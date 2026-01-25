/**
 * @file layout.tsx (dashboard)
 * @description Layout для сторінок дашборду з ініціалізацією воркспейсів
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/shared/supabase/server";
import { WorkspaceProvider } from "@/shared/components/providers/workspace-provider";

export const metadata: Metadata = {
  title: "Дашборд | CRM4SMB",
  description: "Управління воркспейсом",
};

/**
 * Layout для dashboard-роутів
 *
 * Особливості:
 * - SSR завантаження воркспейсів
 * - Ініціалізація Zustand store
 * - Автоматична перевірка доступу (через middleware)
 */
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerClient();

  // Отримуємо користувача
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Редірект неавтентифікованих (додаткова перевірка, основна в middleware)
  if (!user) {
    redirect("/");
  }

  // Завантажуємо ВСІ воркспейси користувача на сервері
  // RLS політика автоматично фільтрує тільки доступні
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name, slug")
    .order("created_at", { ascending: false });

  // Ініціалізуємо store через Provider
  return (
    <WorkspaceProvider initialWorkspaces={workspaces || []}>
      {children}
    </WorkspaceProvider>
  );
}
