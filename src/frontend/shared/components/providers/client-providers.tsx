/**
 * @description Кореневий провайдер клієнтських контекстів
 *
 * АРХІТЕКТУРА:
 * - Синхронна ініціалізація Zustand store для запобігання миготінню
 * - Один Provider замість множини вкладених
 * - SSR-friendly: немає useEffect для критичної ініціалізації
 *
 * ПОРЯДОК ПРОВАЙДЕРІВ (важливо!):
 * 1. AuthProvider - базова автентифікація
 * 3. UI провайдери (модалки, тости)
 */

"use client";

import { AuthProvider } from "@/frontend/shared/lib/context/auth-context";
import { AuthModal } from "@/frontend/widgets/auth/ui/AuthModal";
import { Toaster } from "@/frontend/shared/components/ui/sonner";

// ============================================================================
// ТИПИ
// ============================================================================

interface ClientProvidersProps {
  children: React.ReactNode;
}

// ============================================================================
// ГОЛОВНИЙ ПРОВАЙДЕР
// ============================================================================

/**
 * Кореневий провайдер всіх клієнтських контекстів
 *
 * ВИКОРИСТАННЯ:
 * - Обгортає весь додаток в RootLayout
 *
 * ПЕРЕВАГИ ЦЬОГО ПІДХОДУ:
 * 1. Синхронна ініціалізація - немає миготіння
 * 2. SSR-friendly - дані передаються з сервера через спеціальні синхронізатори
 * 3. Type-safe - TypeScript перевіряє типи
 * 4. Простий debug - всі провайдери в одном місці
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AuthProvider>
      {/* Основний контент додатку */}
      {children}

      {/* UI провайдери (не впливають на ініціалізацію даних) */}
      <AuthModal />
      <Toaster />
    </AuthProvider>
  );
}
