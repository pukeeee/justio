/**
 * @file workspace-store.ts
 * @description Zustand store для управління воркспейсами користувача
 *
 * АРХІТЕКТУРА:
 * - SSR-friendly: store ініціалізується на сервері та синхронізується з клієнтом
 * - Hydration-safe: немає розбіжностей між сервером та клієнтом
 * - Singleton pattern: один екземпляр store на весь додаток
 *
 * ВАЖЛИВО:
 * - Ініціалізація відбувається СИНХРОННО при створенні store
 * - Це запобігає race conditions та миготінню UI
 */

import { create } from "zustand";
import { WORKSPACE_TIER_LIMITS } from "@/shared/config/billing";
import type { Workspace } from "@/frontend/entities/workspace/model/type";

// ============================================================================
// ТИПИ СТАНУ
// ============================================================================

/**
 * Інтерфейс стану Zustand store
 */
interface WorkspaceState {
  // ===== ДАНІ =====
  /**
   * Список усіх воркспейсів користувача
   * Завантажується один раз при ініціалізації
   */
  workspaces: Workspace[];

  /**
   * Slug поточного активного воркспейсу (з URL)
   * null = користувач не в контексті воркспейсу
   */
  currentWorkspaceSlug: string | null;

  /**
   * Прапорець ініціалізації
   * true = store отримав дані з сервера
   * false = ще не ініціалізовано (не повинно траплятися в UI)
   */
  initialized: boolean;

  // ===== GETTERS (обчислювані значення) =====
  /**
   * Повертає об'єкт поточного воркспейсу
   * @returns Workspace | null
   */
  getCurrentWorkspace: () => Workspace | null;

  /**
   * Повертає кількість воркспейсів
   * @returns number
   */
  getWorkspaceCount: () => number;

  /**
   * Перевіряє, чи можна створити новий воркспейс
   * Враховує тарифний план та поточну кількість
   * @returns boolean
   */
  canCreateWorkspace: () => boolean;

  // ===== ACTIONS (дії для зміни стану) =====
  /**
   * Ініціалізує store списком воркспейсів з сервера
   * Викликається ОДИН РАЗ при mount додатку
   */
  setWorkspaces: (workspaces: Workspace[]) => void;

  /**
   * Встановлює активний воркспейс за slug
   * Викликається при навігації між воркспейсами
   */
  setCurrentWorkspace: (slug: string | null) => void;

  /**
   * Додає новий воркспейс до списку
   * Викликається після успішного створення
   */
  addWorkspace: (workspace: Workspace) => void;

  /**
   * Видаляє воркспейс зі списку
   * Викликається після успішного видалення
   */
  removeWorkspace: (id: string) => void;

  /**
   * Скидає store до початкового стану
   * Викликається при logout користувача
   */
  reset: () => void;
}

// ============================================================================
// СТВОРЕННЯ STORE
// ============================================================================

/**
 * Zustand store для воркспейсів
 *
 * ОСОБЛИВОСТІ:
 * - Легкий (~1kB) та швидкий
 * - Не потребує Provider (на відміну від Context API)
 * - Підтримує SSR out of the box
 */
export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  // ===== ПОЧАТКОВИЙ СТАН =====
  workspaces: [],
  currentWorkspaceSlug: null,
  initialized: false,

  // ===== GETTERS =====

  /**
   * Знаходить поточний воркспейс за slug
   */
  getCurrentWorkspace: () => {
    const { workspaces, currentWorkspaceSlug } = get();

    if (!currentWorkspaceSlug) return null;

    return workspaces.find((w) => w.slug === currentWorkspaceSlug) || null;
  },

  /**
   * Повертає кількість воркспейсів
   */
  getWorkspaceCount: () => {
    return get().workspaces.length;
  },

  /**
   * Перевіряє можливість створення нового воркспейсу
   *
   * БІЗНЕС-ЛОГІКА:
   * - Free tier: максимум 1 воркспейс
   * - Solo: максимум 5 воркспейсів
   * - Firm: максимум 20 воркспейсів
   * - Enterprise: необмежено
   *
   * TODO: Отримувати реальний тариф користувача з підписки
   * Поки що використовуємо free tier як обмеження
   */
  canCreateWorkspace: () => {
    const count = get().getWorkspaceCount();

    // ТИМЧАСОВЕ РІШЕННЯ: використовуємо free tier
    // В майбутньому тут буде перевірка реального тарифу з subscriptions
    const limit = WORKSPACE_TIER_LIMITS.free.workspaces;

    return count < limit;
  },

  // ===== ACTIONS =====

  /**
   * Ініціалізація store даними з сервера
   *
   * ВАЖЛИВО:
   * - Викликається ОДИН РАЗ при завантаженні додатку
   * - Гарантує унікальність воркспейсів за ID
   */
  setWorkspaces: (workspaces) => {
    // Використовуємо Map для гарантії унікальності за ID
    const uniqueWorkspaces = Array.from(
      new Map(workspaces.map((w) => [w.id, w])).values(),
    );

    set({
      workspaces: uniqueWorkspaces,
      initialized: true,
    });
  },

  /**
   * Встановлює активний воркспейс
   *
   * ВАЛІДАЦІЯ:
   * - Перевіряє, чи існує воркспейс з таким slug
   */
  setCurrentWorkspace: (slug) => {
    const { workspaces } = get();

    if (slug === null) {
      set({ currentWorkspaceSlug: null });
      return;
    }

    const exists = workspaces.some((w) => w.slug === slug);

    if (!exists) {
      console.warn(
        `[WorkspaceStore] Спроба встановити неіснуючий воркспейс: ${slug}`,
      );
      return;
    }

    set({ currentWorkspaceSlug: slug });
  },

  /**
   * Додає новий воркспейс до списку
   *
   * КОЛИ ВИКЛИКАЄТЬСЯ:
   * - Після успішного створення воркспейсу через Server Action
   */
  addWorkspace: (workspace) => {
    set((state) => {
      // Перевіряємо, чи вже існує воркспейс з таким ID
      const exists = state.workspaces.some((w) => w.id === workspace.id);
      if (exists) return state;

      return {
        workspaces: [...state.workspaces, workspace],
      };
    });
  },

  /**
   * Видаляє воркспейс зі списку
   *
   * ДОДАТКОВА ЛОГІКА:
   * - Якщо видалений воркспейс був активним, скидає currentWorkspaceSlug
   */
  removeWorkspace: (id) => {
    set((state) => {
      const currentWorkspace = state.getCurrentWorkspace();

      return {
        workspaces: state.workspaces.filter((w) => w.id !== id),
        currentWorkspaceSlug:
          currentWorkspace?.id === id ? null : state.currentWorkspaceSlug,
      };
    });
  },

  /**
   * Повний скид store
   *
   * КОЛИ ВИКЛИКАЄТЬСЯ:
   * - При logout користувача
   */
  reset: () => {
    set({
      workspaces: [],
      currentWorkspaceSlug: null,
      initialized: false,
    });
  },
}));

// ============================================================================
// ДОПОМІЖНІ ХУКИ
// ============================================================================

/**
 * Хук для отримання поточного воркспейсу
 *
 * ОПТИМІЗАЦІЯ:
 * - Селективна підписка: компонент ре-рендериться тільки при зміні поточного воркспейсу
 * - Не ре-рендериться при додаванні/видаленні інших воркспейсів
 *
 * @example
 * function DashboardHeader() {
 *   const workspace = useCurrentWorkspace();
 *   return <h1>{workspace?.name}</h1>;
 * }
 */
export function useCurrentWorkspace() {
  return useWorkspaceStore((state) => state.getCurrentWorkspace());
}

/**
 * Хук для перевірки можливості створення воркспейсу
 *
 * ВИКОРИСТАННЯ:
 * - В UI для показу/приховування кнопки "Створити воркспейс"
 * - В формах для валідації перед відправкою
 *
 * @example
 * function CreateButton() {
 *   const canCreate = useCanCreateWorkspace();
 *   return canCreate ? <Button>Створити</Button> : <UpgradeMessage />;
 * }
 */
export function useCanCreateWorkspace() {
  return useWorkspaceStore((state) => state.canCreateWorkspace());
}

/**
 * Хук для отримання всіх воркспейсів
 *
 * ВИКОРИСТАННЯ:
 * - Для відображення списку всіх воркспейсів
 * - Для dropdown/select компонентів
 *
 * @example
 * function WorkspaceList() {
 *   const workspaces = useWorkspaces();
 *   return workspaces.map(w => <WorkspaceCard key={w.id} workspace={w} />);
 * }
 */
export function useWorkspaces() {
  return useWorkspaceStore((state) => state.workspaces);
}

/**
 * Хук для отримання статусу ініціалізації
 *
 * ВИКОРИСТАННЯ:
 * - Для показу skeleton/loader до завантаження даних
 * - Для запобігання помилкам при доступі до неініціалізованого store
 *
 * @example
 * function WorkspaceSelector() {
 *   const initialized = useWorkspacesInitialized();
 *   if (!initialized) return <Skeleton />;
 *   // ... решта компонента
 * }
 */
export function useWorkspacesInitialized() {
  return useWorkspaceStore((state) => state.initialized);
}
