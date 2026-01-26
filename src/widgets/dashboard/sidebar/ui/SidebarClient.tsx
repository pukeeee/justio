"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { NavGroup } from "./NavGroup";
import { NavUser } from "./NavUser";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/shared/components/ui/sidebar";
import { getFormattedUserData } from "@/shared/lib/auth/get-user-data";

/**
 * Динамічний імпорт ThemeToggle з відключеним SSR.
 * Оскільки SidebarClient — це Client Component, ми можемо безпечно використовувати ssr: false.
 */
const ThemeToggle = dynamic(
  () =>
    import("@/widgets/theme/ui/theme-toggle").then((mod) => mod.ThemeToggle),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 p-2 px-3 h-10 w-full animate-pulse bg-muted/50 rounded-md" />
    ),
  },
);

interface AppSidebarClientProps extends React.ComponentProps<typeof Sidebar> {
  user: Awaited<ReturnType<typeof getFormattedUserData>>;
}

/**
 * Клієнтська частина сайдбару
 */
export function AppSidebarClient({ user, ...props }: AppSidebarClientProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Заголовок з перемикачем воркспейсів */}
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>

      {/* Навігація розділена на логічні групи */}
      <SidebarContent>
        {/* Основні розділи CRM */}
        <NavGroup type="main" />

        {/* Другорядні розділи (Налаштування, Довідка) */}
        <NavGroup type="secondary" label="Додатково" />
      </SidebarContent>

      {/* Футер з темою та профілем */}
      <SidebarFooter>
        <ThemeToggle />
        <NavUser user={user!} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
