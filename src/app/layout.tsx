/**
 * @file layout.tsx (root)
 * @description Root Layout з ініціалізацією воркспейсів для всього додатку
 */

import type { Metadata } from "next";
import { Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/widgets/theme/model/theme-provider";
import { ClientProviders } from "@/shared/components/providers/client-providers";
import { createServerClient } from "@/shared/supabase/server";
import type { Database } from "@/shared/lib/types/database";

type Workspace = Pick<
  Database["public"]["Tables"]["workspaces"]["Row"],
  "id" | "name" | "slug"
>;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM для малого бізнесу",
  description: "Українська CRM система для малого та середнього бізнесу",
};

/**
 * Root Layout - Server Component
 *
 * Завантажує воркспейси на сервері для моментального відображення
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerClient();

  // Отримуємо користувача
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Якщо користувач автентифікований - завантажуємо його воркспейси
  let initialWorkspaces: Workspace[] = [];
  if (user) {
    const { data: workspaces } = await supabase
      .from("workspaces")
      .select("id, name, slug")
      .order("created_at", { ascending: false });

    initialWorkspaces = workspaces || [];
  }

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
          <ClientProviders initialWorkspaces={initialWorkspaces}>
            {children}
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
