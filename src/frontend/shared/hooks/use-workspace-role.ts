/**
 * @file use-workspace-role.ts
 * @description Хук для отримання ролі користувача в воркспейсі через бекенд
 */

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  getUserRoleBySlugAction, 
  getUserRoleAction 
} from "@/frontend/features/auth/actions/auth.actions";
import { useAuthContext } from "@/frontend/shared/lib/context/auth-context";
import type { UserRole } from "@/frontend/shared/lib/validations/schemas";

// ============================================================================
// КЕШ ДЛЯ РОЛЕЙ (клієнтський)
// ============================================================================

const roleCache = new Map<string, { role: UserRole; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 хвилини для клієнтського кешу

function getCachedRole(cacheKey: string): UserRole | null {
  const cached = roleCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    roleCache.delete(cacheKey);
    return null;
  }
  return cached.role;
}

function setCachedRole(cacheKey: string, role: UserRole): void {
  roleCache.set(cacheKey, { role, timestamp: Date.now() });
}

export function clearRoleCache(): void {
  roleCache.clear();
}

// ============================================================================
// ТИПИ
// ============================================================================

interface UseWorkspaceRoleResult {
  role: UserRole | null;
  loading: boolean;
  error: Error | null;
}

// ============================================================================
// ГОЛОВНИЙ ХУК (за слагом з URL)
// ============================================================================

export function useWorkspaceRole(): UseWorkspaceRoleResult {
  const params = useParams();
  const workspaceSlug = params?.slug as string | undefined;
  const { user } = useAuthContext();

  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!workspaceSlug || !user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        setLoading(true);
        
        // Перевіряємо кеш
        const cacheKey = `${user.id}:${workspaceSlug}`;
        const cachedRole = getCachedRole(cacheKey);
        
        if (cachedRole) {
          if (isMounted.current) setRole(cachedRole);
          return;
        }

        // Викликаємо Server Action
        const userRole = await getUserRoleBySlugAction(workspaceSlug);
        
        if (isMounted.current) {
          const typedRole = userRole as UserRole;
          setRole(typedRole);
          if (typedRole) setCachedRole(cacheKey, typedRole);
        }
      } catch (err) {
        console.error("[useWorkspaceRole] Помилка:", err);
        if (isMounted.current) setError(err instanceof Error ? err : new Error("Помилка ролі"));
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchRole();

    return () => { isMounted.current = false; };
  }, [workspaceSlug, user]);

  return { role, loading, error };
}

// ============================================================================
// ХУК ЗА ID
// ============================================================================

export function useWorkspaceRoleById(workspaceId: string | null): UseWorkspaceRoleResult {
  const { user } = useAuthContext();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!workspaceId || !user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        setLoading(true);
        const cacheKey = `${user.id}:${workspaceId}`;
        const cachedRole = getCachedRole(cacheKey);

        if (cachedRole) {
          if (isMounted.current) setRole(cachedRole);
          return;
        }

        const userRole = await getUserRoleAction(workspaceId);
        
        if (isMounted.current) {
          const typedRole = userRole as UserRole;
          setRole(typedRole);
          if (typedRole) setCachedRole(cacheKey, typedRole);
        }
      } catch (err) {
        console.error("[useWorkspaceRoleById] Помилка:", err);
        if (isMounted.current) setError(err instanceof Error ? err : new Error("Помилка ролі"));
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchRole();

    return () => { isMounted.current = false; };
  }, [workspaceId, user]);

  return { role, loading, error };
}
