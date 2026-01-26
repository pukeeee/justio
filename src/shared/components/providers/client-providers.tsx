/**
 * @file client-providers.tsx
 * @description Кореневий провайдер клієнтських контекстів
 *
 * АРХІТЕКТУРА:
 * - Синхронна ініціалізація Zustand store для запобігання миготінню
 * - Один Provider замість множини вкладених
 * - SSR-friendly: немає useEffect для критичної ініціалізації
 *
 * ПОРЯДОК ПРОВАЙДЕРІВ (важливо!):
 * 1. AuthProvider - базова автентифікація
 * 2. WorkspaceInitializer - синхронна ініціалізація store
 * 3. UI провайдери (модалки, тости)
 */

"use client";

import { AuthProvider } from "@/shared/lib/context/auth-context";
import { AuthModal } from "@/widgets/auth/ui/AuthModal";
import { Toaster } from "@/shared/components/ui/sonner";
import type { Database } from "@/shared/lib/types/database";
import { useWorkspaceStore } from "@/shared/stores/workspace-store";

// ============================================================================
// ТИПИ
// ============================================================================

type Workspace = Pick<
  Database["public"]["Tables"]["workspaces"]["Row"],
  "id" | "name" | "slug"
>;

interface ClientProvidersProps {
  children: React.ReactNode;
  initialWorkspaces?: Workspace[];
}

// ============================================================================
// КОМПОНЕНТ ІНІЦІАЛІЗАЦІЇ STORE
// ============================================================================

/**
 * Внутрішній компонент для СИНХРОННОЇ ініціалізації Zustand store
 *
 * ЧОМУ ОКРЕМИЙ КОМПОНЕНТ:
 * - Виконується ДО першого рендеру дочірніх компонентів
 * - Використовує React.useSyncExternalStore під капотом (через Zustand)
 * - Запобігає race conditions та миготінню
 *
 * ВАЖЛИВО:
 * - НЕ використовує useEffect (асинхронний)
 * - Викликає setWorkspaces ОДРАЗУ при першому рендері
 * - Захищено від повторних ініціалізацій через перевірку initialized
 */
function WorkspaceInitializer({ workspaces }: { workspaces: Workspace[] }) {
  // Отримуємо пряму посилання на store (без підписки на зміни)
  const store = useWorkspaceStore.getState();

  // КРИТИЧНА ЛОГІКА: ініціалізація ТІЛЬКИ якщо ще не ініціалізовано
  // Це запобігає скиданню store при ре-рендерах
  if (!store.initialized && workspaces.length > 0) {
    // СИНХРОННИЙ виклик - відбувається ДО рендеру дочірніх компонентів
    store.setWorkspaces(workspaces);

    // Логування для debug (тільки dev)
    if (process.env.NODE_ENV === "development") {
      console.log(
        "[WorkspaceInitializer] Store ініціалізовано з",
        workspaces.length,
        "воркспейсами",
      );
    }
  }

  // Компонент не рендерить нічого - він тільки ініціалізує store
  return null;
}

// ============================================================================
// ГОЛОВНИЙ ПРОВАЙДЕР
// ============================================================================

/**
 * Кореневий провайдер всіх клієнтських контекстів
 *
 * ВИКОРИСТАННЯ:
 * - Обгортає весь додаток в RootLayout
 * - Отримує initialWorkspaces з серверного компонента (SSR)
 *
 * ПЕРЕВАГИ ЦЬОГО ПІДХОДУ:
 * 1. Синхронна ініціалізація - немає миготіння
 * 2. SSR-friendly - дані передаються з сервера
 * 3. Type-safe - TypeScript перевіряє типи
 * 4. Простий debug - всі провайдери в одному місці
 *
 * @example
 * // В RootLayout:
 * const workspaces = await getWorkspaces();
 * return (
 *   <ClientProviders initialWorkspaces={workspaces}>
 *     {children}
 *   </ClientProviders>
 * );
 */
export function ClientProviders({
  children,
  initialWorkspaces = [],
}: ClientProvidersProps) {
  return (
    <AuthProvider>
      {/*
        ВАЖЛИВО: WorkspaceInitializer ПЕРЕД children
        Це гарантує, що store буде ініціалізований ДО рендеру компонентів,
        які його використовують (наприклад, TeamSwitcher)
      */}
      <WorkspaceInitializer workspaces={initialWorkspaces} />

      {/* Основний контент додатку */}
      {children}

      {/* UI провайдери (не впливають на ініціалізацію даних) */}
      <AuthModal />
      <Toaster />
    </AuthProvider>
  );
}
