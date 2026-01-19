/**
 * @file auth-context.tsx
 * @description Провайдер контексту автентифікації з виправленими race conditions
 */

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
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

type WorkspaceUserProfile = WorkspaceUser & {
  workspaces: Workspace | null;
};

// ============================================================================
// КОНТЕКСТ
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// ПРОВАЙДЕР
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaceUser, setWorkspaceUser] = useState<WorkspaceUser | null>(
    null,
  );
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [quotas, setQuotas] = useState<WorkspaceQuota | null>(null);
  const [loading, setLoading] = useState(true);

  // Використовуємо ref для запобігання одночасним викликам
  const fetchingRef = useRef(false);
  const supabase = createBrowserClient();

  /**
   * Завантажує дані робочого простору користувача
   */
  const fetchWorkspace = useCallback(
    async (userId: string) => {
      // Запобігаємо одночасним викликам
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      try {
        const { data, error } = await supabase
          .from("workspace_users")
          .select("*, workspaces(*)")
          .eq("user_id", userId)
          .eq("status", "active")
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const { workspaces, ...userProfile } = data as WorkspaceUserProfile;
          setWorkspaceUser(userProfile);
          setWorkspace(workspaces);
        } else {
          setWorkspace(null);
          setWorkspaceUser(null);
        }
      } catch (error) {
        console.error("Помилка при завантаженні робочого простору:", error);
        setWorkspace(null);
        setWorkspaceUser(null);
      } finally {
        fetchingRef.current = false;
      }
    },
    [supabase],
  );

  /**
   * Завантажує дані підписки та квот
   */
  const fetchWorkspaceData = useCallback(
    async (workspaceId: string) => {
      try {
        const [subResult, quotasResult] = await Promise.all([
          supabase
            .from("subscriptions")
            .select("*")
            .eq("workspace_id", workspaceId)
            .maybeSingle(),
          supabase
            .from("workspace_quotas")
            .select("*")
            .eq("workspace_id", workspaceId)
            .maybeSingle(),
        ]);

        if (subResult.error) {
          console.error("Помилка завантаження підписки:", subResult.error);
        }
        setSubscription((subResult.data as Subscription) || null);

        if (quotasResult.error) {
          console.error("Помилка завантаження квот:", quotasResult.error);
        }
        setQuotas((quotasResult.data as WorkspaceQuota) || null);
      } catch (error) {
        console.error("Помилка завантаження даних воркспейсу:", error);
        setSubscription(null);
        setQuotas(null);
      }
    },
    [supabase],
  );

  /**
   * Ініціалізація та відстеження змін автентифікації
   */
  useEffect(() => {
    let mounted = true;

    // Початкове завантаження користувача
    const initializeAuth = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        setUser(currentUser);

        if (currentUser) {
          await fetchWorkspace(currentUser.id);
        } else {
          // Очищаємо дані якщо немає користувача
          setWorkspace(null);
          setWorkspaceUser(null);
          setSubscription(null);
          setQuotas(null);
        }
      } catch (error) {
        console.error("Помилка ініціалізації автентифікації:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Підписка на зміни автентифікації
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Логування для debugging
      if (process.env.NODE_ENV === "development") {
        console.log("[AuthProvider] Auth state change:", event, !!session);
      }

      const currentUser = session?.user ?? null;

      // ВАЖЛИВО: Спочатку оновлюємо user state
      setUser(currentUser);

      if (currentUser) {
        await fetchWorkspace(currentUser.id);
      } else {
        // При SIGN_OUT очищаємо всі дані одразу
        setWorkspace(null);
        setWorkspaceUser(null);
        setSubscription(null);
        setQuotas(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      authSubscription.unsubscribe();
    };
  }, [fetchWorkspace, supabase.auth]);

  /**
   * Ефект для завантаження залежних даних воркспейсу
   */
  useEffect(() => {
    if (workspace?.id) {
      fetchWorkspaceData(workspace.id);
    } else {
      setSubscription(null);
      setQuotas(null);
    }
  }, [workspace?.id, fetchWorkspaceData]);

  /**
   * Функція для ручного оновлення даних
   */
  const refresh = useCallback(async () => {
    if (user?.id) {
      await fetchWorkspace(user.id);
    }
  }, [user?.id, fetchWorkspace]);

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

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuthContext має використовуватися всередині AuthProvider",
    );
  }
  return context;
}
