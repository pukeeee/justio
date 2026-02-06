/**
 * @file Sidebar.tsx
 * @description Головний серверний компонент сайдбару.
 * Завантажує дані на сервері та передає їх у клієнтську частину.
 */

import * as React from "react";
import { Sidebar } from "@/frontend/shared/components/ui/sidebar";
import { getFormattedUserData } from "@/frontend/shared/lib/auth/get-user-data";
import { AppSidebarClient } from "./SidebarClient";

/**
 * Server Component обгортка
 * Завантажує дані користувача та передає Client Component
 */
export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // Завантажуємо дані користувача на сервері
  const userData = await getFormattedUserData();

  // Якщо немає користувача - не рендеримо sidebar
  if (!userData) {
    return null;
  }

  return <AppSidebarClient user={userData} {...props} />;
}
