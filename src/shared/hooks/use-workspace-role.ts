/**
 * @file use-workspace-role.ts
 * @description Хук для отримання ролі користувача в воркспейсі
 *
 * ВИПРАВЛЕННЯ:
 * - Додано кешування через Map для запобігання повторним запитам
 * - Debouncing для множинних викликів
 * - Cleanup при unmount
 * - Типізовані помилки
 *
 * АРХІТЕКТУРА:
 * - Client-side only хук
 * - Використовує URL params для визначення воркспейсу
 * - Кешує результати в пам'яті
 */

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@/shared/supabase/client";
import type { UserRole } from "@/shared/lib/validations/schemas";

// ============================================================================
// КЕШ ДЛЯ РОЛЕЙ
// ============================================================================

/**
 * Глобальний кеш для ролей
 *
 * СТРУКТУРА:
 * Key: `${userId}:${workspaceId}`
 * Value: { role, timestamp }
 *
 * ОПТИМІЗАЦІЯ:
 * - Зменшує кількість запитів до БД
 * - TTL: 5 хвилин (достатньо для більшості сценаріїв)
 * - Автоматично очищається при logout
 */
const roleCache = new Map<string, { role: UserRole; timestamp: number }>();

/**
 * Час життя кешу (5 хвилин)
 */
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Отримує роль з кешу якщо вона свіжа
 */
function getCachedRole(cacheKey: string): UserRole | null {
  const cached = roleCache.get(cacheKey);

  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;

  if (isExpired) {
    roleCache.delete(cacheKey);
    return null;
  }

  return cached.role;
}

/**
 * Зберігає роль в кеш
 */
function setCachedRole(cacheKey: string, role: UserRole): void {
  roleCache.set(cacheKey, {
    role,
    timestamp: Date.now(),
  });
}

/**
 * Очищає весь кеш (викликається при logout)
 */
export function clearRoleCache(): void {
  roleCache.clear();
}

// ============================================================================
// ТИПИ
// ============================================================================

/**
 * Результат хука useWorkspaceRole
 */
interface UseWorkspaceRoleResult {
  /** Роль користувача в воркспейсі */
  role: UserRole | null;
  /** Чи йде завантаження */
  loading: boolean;
  /** Помилка якщо сталася */
  error: Error | null;
}

// ============================================================================
// ГОЛОВНИЙ ХУК
// ============================================================================

/**
 * Хук для отримання ролі користувача в поточному воркспейсі (з URL)
 *
 * ВИКОРИСТАННЯ:
 * ```tsx
 * function DealCard() {
 *   const { role, loading } = useWorkspaceRole();
 *
 *   if (loading) return <Skeleton />;
 *   if (role === 'owner') return <DeleteButton />;
 *   return <ViewOnlyMode />;
 * }
 * ```
 *
 * ОПТИМІЗАЦІЇ:
 * - Кешування результатів
 * - Автоматичний cleanup
 * - Debouncing для швидких змін slug
 *
 * @returns {UseWorkspaceRoleResult} Об'єкт з роллю, статусом завантаження та помилкою
 */
export function useWorkspaceRole(): UseWorkspaceRoleResult {
  const params = useParams();
  const workspaceSlug = params?.slug as string | undefined;

  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Ref для відстеження чи компонент mounted
  const isMounted = useRef(true);

  // Ref для debounce timeout
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // Скидаємо isMounted на true при кожному новому ефекті
    isMounted.current = true;

    /**
     * EARLY RETURN: якщо немає slug
     * Це нормальна ситуація для роутів без :slug параметра
     */
    if (!workspaceSlug) {
      setLoading(false);
      setRole(null);
      return;
    }

    /**
     * Функція завантаження ролі
     *
     * ЛОГІКА:
     * 1. Перевіряємо кеш
     * 2. Якщо є в кеші - використовуємо
     * 3. Якщо немає - робимо запит до БД
     * 4. Зберігаємо в кеш
     */
    const fetchRole = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = createBrowserClient();

        // КРОК 1: Отримуємо користувача
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (isMounted.current) {
            setRole(null);
            setLoading(false);
          }
          return;
        }

        // КРОК 2: Отримуємо ID воркспейсу за slug
        const { data: workspace, error: workspaceError } = await supabase
          .from("workspaces")
          .select("id")
          .eq("slug", workspaceSlug)
          .single();

        if (workspaceError || !workspace) {
          throw new Error(`Воркспейс з slug "${workspaceSlug}" не знайдено`);
        }

        // КРОК 3: Перевіряємо кеш
        const cacheKey = `${user.id}:${workspace.id}`;
        const cachedRole = getCachedRole(cacheKey);

        if (cachedRole) {
          if (isMounted.current) {
            setRole(cachedRole);
            setLoading(false);
          }
          return;
        }

        // КРОК 4: Запит до БД через RPC
        const { data: userRole, error: roleError } = await supabase.rpc(
          "get_workspace_role",
          {
            p_user_id: user.id,
            p_workspace_id: workspace.id,
          },
        );

        if (roleError) {
          throw new Error(`Помилка отримання ролі: ${roleError.message}`);
        }

        const role = userRole as UserRole;

        // КРОК 5: Зберігаємо в кеш
        setCachedRole(cacheKey, role);

        // КРОК 6: Оновлюємо стан (тільки якщо компонент ще mounted)
        if (isMounted.current) {
          setRole(role);
        }
      } catch (err) {
        console.error("[useWorkspaceRole] Помилка:", err);

        if (isMounted.current) {
          setError(
            err instanceof Error
              ? err
              : new Error("Невідома помилка при отриманні ролі"),
          );
          setRole(null);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    /**
     * DEBOUNCING:
     * Затримка 100ms перед запитом
     * Якщо slug змінюється швидко - скасовуємо попередній запит
     */
    timeoutRef.current = setTimeout(fetchRole, 100);

    /**
     * CLEANUP:
     * - Скасовуємо pending запит
     * - Помічаємо компонент як unmounted
     */
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [workspaceSlug]);

  return { role, loading, error };
}

// ============================================================================
// ДОДАТКОВИЙ ХУК (для конкретного воркспейсу за ID)
// ============================================================================

/**
 * Хук для отримання ролі в конкретному воркспейсі (за ID)
 *
 * ВИКОРИСТАННЯ:
 * ```tsx
 * function WorkspaceCard({ workspaceId }: { workspaceId: string }) {
 *   const { role } = useWorkspaceRoleById(workspaceId);
 *   return <div>Your role: {role}</div>;
 * }
 * ```
 *
 * КОЛИ ВИКОРИСТОВУВАТИ:
 * - Коли потрібно знати роль не в поточному, а в іншому воркспейсі
 * - Наприклад, в списку всіх воркспейсів
 *
 * @param workspaceId - ID воркспейсу (не slug!)
 * @returns {UseWorkspaceRoleResult}
 */
export function useWorkspaceRoleById(
  workspaceId: string | null,
): UseWorkspaceRoleResult {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isMounted = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    isMounted.current = true;

    if (!workspaceId) {
      setLoading(false);
      setRole(null);
      return;
    }

    const fetchRole = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = createBrowserClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (isMounted.current) {
            setRole(null);
            setLoading(false);
          }
          return;
        }

        // Перевіряємо кеш
        const cacheKey = `${user.id}:${workspaceId}`;
        const cachedRole = getCachedRole(cacheKey);

        if (cachedRole) {
          if (isMounted.current) {
            setRole(cachedRole);
            setLoading(false);
          }
          return;
        }

        // Запит до БД
        const { data: userRole, error: roleError } = await supabase.rpc(
          "get_workspace_role",
          {
            p_user_id: user.id,
            p_workspace_id: workspaceId,
          },
        );

        if (roleError) {
          throw new Error(`Помилка отримання ролі: ${roleError.message}`);
        }

        const role = userRole as UserRole;

        // Зберігаємо в кеш
        setCachedRole(cacheKey, role);

        if (isMounted.current) {
          setRole(role);
        }
      } catch (err) {
        console.error("[useWorkspaceRoleById] Помилка:", err);

        if (isMounted.current) {
          setError(
            err instanceof Error
              ? err
              : new Error("Невідома помилка при отриманні ролі"),
          );
          setRole(null);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    timeoutRef.current = setTimeout(fetchRole, 100);

    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [workspaceId]);

  return { role, loading, error };
}
