/**
 * @file workspace-store.ts
 * @description Zustand store для управління воркспейсами користувача
 * 
 * Чому Zustand:
 * - Легкий (~1kB) та швидкий
 * - Простий API без boilerplate
 * - Відмінна підтримка SSR/hydration
 * - Не вимагає провайдерів
 */

import { create } from 'zustand';
import type { Database } from '@/shared/lib/types/database';
import { WORKSPACE_TIER_LIMITS } from '@/shared/lib/config/billing';

// Тип воркспейсу з мінімальними даними
type Workspace = Pick<
  Database['public']['Tables']['workspaces']['Row'],
  'id' | 'name' | 'slug'
>;

// Стан store
interface WorkspaceState {
  // Дані
  workspaces: Workspace[];
  currentWorkspaceSlug: string | null;
  initialized: boolean;

  // Обчислювані значення (getters)
  getCurrentWorkspace: () => Workspace | null;
  canCreateWorkspace: () => boolean;
  getWorkspaceCount: () => number;

  // Дії (actions)
  setWorkspaces: (workspaces: Workspace[]) => void;
  setCurrentWorkspace: (slug: string) => void;
  addWorkspace: (workspace: Workspace) => void;
  removeWorkspace: (id: string) => void;
  reset: () => void;
}

/**
 * Store для воркспейсів
 * Ініціалізується один раз при завантаженні додатку
 */
export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  // Початковий стан
  workspaces: [],
  currentWorkspaceSlug: null,
  initialized: false,

  // Getter: поточний воркспейс
  getCurrentWorkspace: () => {
    const { workspaces, currentWorkspaceSlug } = get();
    return workspaces.find((w) => w.slug === currentWorkspaceSlug) || null;
  },

  // Getter: кількість воркспейсів
  getWorkspaceCount: () => {
    return get().workspaces.length;
  },

  // Getter: чи можна створити новий воркспейс
  // ВАЖЛИВО: Використовуємо реальну логіку з білінгу
  canCreateWorkspace: () => {
    const count = get().getWorkspaceCount();
    
    // TODO: Отримувати реальний тариф користувача
    // Поки що використовуємо free tier як максимум
    const limit = WORKSPACE_TIER_LIMITS.free.workspaces;
    
    return count < limit;
  },

  // Action: встановити список воркспейсів (ініціалізація)
  setWorkspaces: (workspaces) => {
    set({ 
      workspaces, 
      initialized: true 
    });
  },

  // Action: встановити поточний воркспейс
  setCurrentWorkspace: (slug) => {
    const { workspaces } = get();
    
    // Перевіряємо, чи існує такий воркспейс
    const exists = workspaces.some((w) => w.slug === slug);
    
    if (!exists) {
      console.warn(`[WorkspaceStore] Спроба встановити неіснуючий воркспейс: ${slug}`);
      return;
    }

    set({ currentWorkspaceSlug: slug });
  },

  // Action: додати новий воркспейс
  addWorkspace: (workspace) => {
    set((state) => ({
      workspaces: [...state.workspaces, workspace],
    }));
  },

  // Action: видалити воркспейс
  removeWorkspace: (id) => {
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== id),
      // Скидаємо поточний, якщо він був видалений
      currentWorkspaceSlug:
        state.getCurrentWorkspace()?.id === id
          ? null
          : state.currentWorkspaceSlug,
    }));
  },

  // Action: скинути store (вихід користувача)
  reset: () => {
    set({
      workspaces: [],
      currentWorkspaceSlug: null,
      initialized: false,
    });
  },
}));

/**
 * Хелпер для ініціалізації store на сервері або клієнті
 */
export function initializeWorkspaceStore(workspaces: Workspace[]) {
  const store = useWorkspaceStore.getState();
  
  // Ініціалізуємо тільки один раз
  if (!store.initialized) {
    store.setWorkspaces(workspaces);
  }
}

/**
 * Хук для швидкого доступу до поточного воркспейсу
 */
export function useCurrentWorkspace() {
  return useWorkspaceStore((state) => state.getCurrentWorkspace());
}

/**
 * Хук для перевірки можливості створення воркспейсу
 */
export function useCanCreateWorkspace() {
  return useWorkspaceStore((state) => state.canCreateWorkspace());
}
