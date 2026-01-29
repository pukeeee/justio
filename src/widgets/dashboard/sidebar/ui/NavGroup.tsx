/**
 * @file NavGroup.tsx
 * @description Універсальний компонент групи навігації для sidebar
 *
 * АРХІТЕКТУРА:
 * - Приймає тип групи як пропс (serializable)
 * - Самостійно імпортує дані, що містять компоненти іконок
 * - Підсвічує активний маршрут
 */

"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import {
  getWorkspaceUrl,
  type NavItem,
  DASHBOARD_NAV,
  DASHBOARD_SECONDARY_NAV,
} from "@/shared/config/dashboard-nav";

/**
 * Типи груп навігації
 */
type NavGroupType = "main" | "secondary";

interface NavGroupProps {
  type: NavGroupType;
  label?: string;
}

/**
 * Мапінг типів на масиви даних
 */
const NAV_DATA: Record<NavGroupType, NavItem[]> = {
  main: DASHBOARD_NAV,
  secondary: DASHBOARD_SECONDARY_NAV,
};

/**
 * Компонент групи навігації
 */
export function NavGroup({ type, label }: NavGroupProps) {
  const params = useParams();
  const pathname = usePathname();
  const workspaceSlug = params?.slug as string | undefined;

  // Отримуємо дані для конкретного типу групи
  const items = NAV_DATA[type];

  /**
   * Перевіряє, чи активний поточний маршрут
   */
  const isActive = (item: NavItem): boolean => {
    if (!workspaceSlug) return false;

    const itemPath = getWorkspaceUrl(workspaceSlug, item.href);

    if (item.href === "") {
      return pathname === `/dashboard/${workspaceSlug}`;
    }

    return pathname.startsWith(itemPath);
  };

  if (!workspaceSlug) return null;

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const href = getWorkspaceUrl(workspaceSlug, item.href);
          const active = isActive(item);

          return (
            <SidebarMenuItem key={item.href || "home"}>
              <SidebarMenuButton asChild isActive={active} tooltip={item.name}>
                <Link href={href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
