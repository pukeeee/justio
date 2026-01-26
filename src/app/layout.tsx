/**
 * @file layout.tsx (root)
 * @description Кореневий Layout додатку з SSR ініціалізацією воркспейсів
 *
 * АРХІТЕКТУРА:
 * - Server Component: рендериться на сервері
 * - Завантажує дані воркспейсів для автентифікованих користувачів
 * - Передає дані клієнтським провайдерам для синхронної ініціалізації
 */

import type { Metadata } from "next";
import { Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/widgets/theme/model/theme-provider";
import { ClientProviders } from "@/shared/components/providers/client-providers";
import { getUserWorkspaces, getCachedUser } from "@/shared/lib/auth/get-user-data";

// ============================================================================
// ШРИФТИ
// ============================================================================

/**
 * Основний шрифт (Geist Sans)
 * Використовується для всього тексту крім коду
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Моноширинний шрифт (Geist Mono)
 * Використовується для коду та технічних елементів
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: "CRM для малого бізнесу",
  description: "Українська CRM система для малого та середнього бізнесу",
};

// ============================================================================
// ROOT LAYOUT (Server Component)
// ============================================================================

/**
 * Кореневий Layout додатку
 *
 * ВІДПОВІДАЛЬНІСТЬ:
 * 1. Завантаження даних на сервері (SSR)
 * 2. Налаштування HTML структури
 * 3. Підключення шрифтів та стилів
 * 4. Ініціалізація провайдерів
 *
 * ЛОГІКА ЗАВАНТАЖЕННЯ ДАНИХ:
 * - Перевіряємо автентифікацію користувача
 * - Якщо користувач залогінений - завантажуємо його воркспейси
 * - Якщо гість - передаємо порожній масив
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ===== ЗАВАНТАЖЕННЯ ДАНИХ (SSR) =====

  /**
   * Отримуємо користувача та його воркспейси паралельно
   * getUserWorkspaces вже загорнута в cache() та використовує репозиторій
   */
  const [user, initialWorkspaces] = await Promise.all([
    getCachedUser(),
    getUserWorkspaces()
  ]);

  // Debug логування (тільки dev)
  if (process.env.NODE_ENV === "development" && user) {
    console.log(
      `[RootLayout] Завантажено ${initialWorkspaces.length} воркспейсів для користувача ${user.id}`,
    );
  }

  // ===== РЕНДЕРИНГ HTML =====

  /**
   * HTML структура додатку
   *
   * ВАЖЛИВІ АТРИБУТИ:
   * - suppressHydrationWarning: дозволяє ThemeProvider змінювати <html> без попереджень
   * - lang="uk": українська мова для accessibility та SEO
   * - className: CSS змінні шрифтів для використання в Tailwind
   */
  return (
    <html
      lang="uk"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/*
            Клієнтські провайдери з SSR даними
          */}
          <ClientProviders initialWorkspaces={initialWorkspaces}>
            {children}
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
