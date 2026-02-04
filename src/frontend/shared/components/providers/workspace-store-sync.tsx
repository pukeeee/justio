/**
 * @file workspace-store-sync.tsx
 * @description Клієнтський компонент для синхронізації даних воркспейсів з Zustand store.
 * Використовується в серверних лейаутах для передачі SSR даних у клієнтський стор.
 */

"use client";

import { useWorkspaceStore } from "@/frontend/shared/stores/workspace-store";
import { useEffect } from "react";
import type { Database } from "@/shared/types/database";

type Workspace = Pick<
  Database["public"]["Tables"]["workspaces"]["Row"],
  "id" | "name" | "slug"
>;

interface WorkspaceStoreSyncProps {
  workspaces: Workspace[];
  currentSlug?: string;
}

/**
 * Компонент синхронізації.
 * Він не рендерить нічого в DOM, але виконує синхронізацію стору.
 * 
 * ОПТИМІЗАЦІЯ:
 * 1. Синхронна ініціалізація під час рендеру (запобігає миготінню UI).
 * 2. useEffect для оновлення при зміні пропсів (наприклад, зміна slug в URL).
 */
export function WorkspaceStoreSync({ workspaces, currentSlug }: WorkspaceStoreSyncProps) {
  const store = useWorkspaceStore.getState();
  
  // 1. СИНХРОННА ІНІЦІАЛІЗАЦІЯ (тільки для першого рендеру клієнта)
  // Якщо стор ще не ініціалізований, ми робимо це негайно, 
  // щоб дочірні компоненти вже бачили дані.
  if (!store.initialized && typeof window !== "undefined") {
    store.setWorkspaces(workspaces);
    if (currentSlug) {
      store.setCurrentWorkspace(currentSlug);
    }
  }

  const setWorkspaces = useWorkspaceStore((state) => state.setWorkspaces);
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);

  // 2. АСИНХРОННЕ ОНОВЛЕННЯ (при зміні пропсів)
  useEffect(() => {
    // Оновлюємо тільки якщо дані реально змінилися
    setWorkspaces(workspaces);
    if (currentSlug) {
      setCurrentWorkspace(currentSlug);
    }
  }, [workspaces, currentSlug, setWorkspaces, setCurrentWorkspace]);

  return null;
}
