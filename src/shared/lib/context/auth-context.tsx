/**
 * Провайдер контексту автентифікації.
 * Надає глобальний стан, пов'язаний з автентифікацією користувача,
 * його робочим простором, роллю, підпискою та квотами для всіх компонентів у додатку.
 */

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createBrowserClient } from "@/shared/supabase/client";
import type { User } from "@supabase/supabase-js";
import type {
  UserRole,
  Workspace,
  WorkspaceUser,
  Subscription,
  WorkspaceQuota,
} from "@/shared/lib/validations/schemas";

// ============================================================================
// ТИПИ
// ============================================================================

/**
 * @interface AuthContextType
 * @description Визначає структуру даних, що зберігаються в контексті автентифікації.
 * @property {User | null} user - Об'єкт користувача від Supabase або null, якщо не автентифікований.
 * @property {Workspace | null} workspace - Поточний активний робочий простір користувача.
 * @property {WorkspaceUser | null} workspaceUser - Профіль користувача в рамках робочого простору (включає роль).
 * @property {UserRole | null} role - Роль поточного користувача.
 * @property {Subscription | null} subscription - Поточна підписка робочого простору.
 * @property {WorkspaceQuota | null} quotas - Поточні квоти та їх використання для робочого простору.
 * @property {boolean} loading - Прапорець, що вказує на процес початкового завантаження даних.
 * @property {() => Promise<void>} refresh - Функція для примусового оновлення всіх даних.
 */
interface AuthContextType {
  user: User | null;
  workspace: Workspace | null;
  workspaceUser: WorkspaceUser | null;
  role: UserRole | null;
  subscription: Subscription | null;
  quotas: WorkspaceQuota | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * @description Розширений тип для результату запиту, що об'єднує дані
 * користувача робочого простору (`WorkspaceUser`) та самого робочого простору (`Workspace`).
 * @note Назва `workspaces` (у множині) є конвенцією Supabase для зв'язаних таблиць,
 * хоча тут очікується один об'єкт.
 */
type WorkspaceUserProfile = WorkspaceUser & {
  workspaces: Workspace | null;
};

// ============================================================================
// КОНТЕКСТ
// ============================================================================

/**
 * @description React Context для зберігання стану автентифікації.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// ПРОВАЙДЕР
// ============================================================================

/**
 * @component AuthProvider
 * @description Компонент-провайдер, що огортає додаток і надає доступ до контексту автентифікації.
 * Він керує станом сесії, завантажує дані користувача, робочого простору, підписки та квот.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Стан для збереження об'єкта користувача Supabase
  const [user, setUser] = useState<User | null>(null);
  // Стан для збереження поточного робочого простору
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  // Стан для збереження профілю користувача в рамках робочого простору
  const [workspaceUser, setWorkspaceUser] = useState<WorkspaceUser | null>(
    null,
  );
  // Стан для збереження поточної підписки
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  // Стан для збереження поточних квот
  const [quotas, setQuotas] = useState<WorkspaceQuota | null>(null);
  // Стан, що вказує на завершення початкового завантаження даних
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient();

  /**
   * @function fetchWorkspace
   * @description Асинхронна функція для отримання даних про робочий простір користувача.
   * Робить запит до таблиці `workspace_users` і за допомогою join отримує пов'язані дані з `workspaces`.
   * @param {string} userId - ID користувача, для якого потрібно знайти робочий простір.
   */
  const fetchWorkspace = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("workspace_users")
          .select("*, workspaces(*)") // Get all fields from workspace_users and all related fields from workspaces
          .eq("user_id", userId)
          .eq("status", "active") // Only active profiles
          .maybeSingle(); // Expect 0 or 1 row, doesn't throw if 0

        if (error) throw error;

        if (data) {
          const { workspaces, ...userProfile } = data as WorkspaceUserProfile;
          setWorkspaceUser(userProfile);
          setWorkspace(workspaces);
        } else {
          // User has no active workspace, this is a valid state for a new user
          setWorkspace(null);
          setWorkspaceUser(null);
        }
      } catch (error) {
        console.error(
          "Помилка при завантаженні робочого простору:",
          JSON.stringify(error, null, 2),
        );
        setWorkspace(null);
        setWorkspaceUser(null);
      }
    },
    [supabase],
  );

  // Головний ефект для ініціалізації та відстеження сесії
  useEffect(() => {
    // Підписка на зміни стану автентифікації (логін, логаут).
    // `onAuthStateChange` спрацьовує негайно з поточною сесією,
    // що робить окремий виклик `getUser()` непотрібним.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Якщо користувач увійшов, завантажуємо його дані
        await fetchWorkspace(currentUser.id);
      } else {
        // Якщо користувач вийшов, очищуємо дані
        setWorkspace(null);
        setWorkspaceUser(null);
      }

      // Позначаємо завантаження як завершене ПІСЛЯ першого спрацьовування onAuthStateChange.
      // Це гарантує, що ми маємо остаточний стан сесії перед рендерингом.
      setLoading(false);
    });

    // Функція очищення, яка відписується від слухача при демонтуванні компонента
    return () => subscription.unsubscribe();
  }, [fetchWorkspace, supabase.auth]);

  // Ефект для завантаження даних, що залежать від робочого простору (підписка, квоти)
  useEffect(() => {
    const fetchWorkspaceData = async (workspaceId: string) => {
      try {
        // Паралельно завантажуємо підписку та квоти для ефективності
        const [subResult, quotasResult] = await Promise.all([
          supabase
            .from("subscriptions")
            .select("*")
            .eq("workspace_id", workspaceId)
            .single(),
          supabase
            .from("workspace_quotas")
            .select("*")
            .eq("workspace_id", workspaceId)
            .single(),
        ]);

        if (subResult.error)
          console.error(
            "Помилка завантаження підписки:",
            subResult.error.message,
          );
        setSubscription(subResult.data as Subscription | null);

        if (quotasResult.error)
          console.error(
            "Помилка завантаження квот:",
            quotasResult.error.message,
          );
        setQuotas(quotasResult.data as WorkspaceQuota | null);
      } catch (error) {
        console.error(
          "Критична помилка при завантаженні даних робочого простору:",
          error,
        );
        setSubscription(null);
        setQuotas(null);
      }
    };

    if (workspace) {
      fetchWorkspaceData(workspace.id);
    } else {
      // Якщо робочого простору немає, очищуємо залежні дані
      setSubscription(null);
      setQuotas(null);
    }
  }, [workspace, supabase]);

  /**
   * @function refresh
   * @description Публічна функція для примусового перезавантаження всіх даних, пов'язаних з сесією.
   */
  const refresh = useCallback(async () => {
    if (user) {
      await fetchWorkspace(user.id);
      // Оновлення підписки та квот відбудеться автоматично через useEffect,
      // який відстежує зміни стану `workspace`.
    }
  }, [user, fetchWorkspace]);

  // Формуємо об'єкт, який буде переданий через контекст
  const value: AuthContextType = {
    user,
    workspace,
    workspaceUser,
    role: workspaceUser?.role ?? null,
    subscription,
    quotas,
    loading,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// ХУК
// ============================================================================

/**
 * @function useAuthContext
 * @description Спеціальний хук для доступу до контексту автентифікації.
 * Забезпечує, що контекст використовується тільки всередині `AuthProvider`.
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuthContext має використовуватися всередині AuthProvider",
    );
  }
  return context;
}
