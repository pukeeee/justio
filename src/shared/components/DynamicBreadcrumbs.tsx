/**
 * @file DynamicBreadcrumbs.tsx
 * @description Клієнтський компонент для динамічного відображення хлібних крихт.
 */

"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import {
  DASHBOARD_NAV,
  DASHBOARD_SECONDARY_NAV,
} from "@/shared/config/dashboard-nav";

interface DynamicBreadcrumbsProps {
  workspaceName: string;
  workspaceSlug: string;
}

/**
 * Динамічні хлібні крихти
 *
 * Формат: [Назва воркспейсу] / [Назва модуля] / [Додатково]
 */
export function DynamicBreadcrumbs({
  workspaceName,
  workspaceSlug,
}: DynamicBreadcrumbsProps) {
  const pathname = usePathname();

  // Отримуємо шлях після /dashboard/[slug]
  // Наприклад: /dashboard/my-workspace/clients -> /clients
  const baseDashboardPath = `/dashboard/${workspaceSlug}`;
  const subPath = pathname.replace(baseDashboardPath, "") || "";

  // Знаходимо назву модуля в конфігурації
  const allNavItems = [...DASHBOARD_NAV, ...DASHBOARD_SECONDARY_NAV];

  // Шукаємо точний збіг або найбільш підходящий префікс
  const currentNavItem = allNavItems.find(
    (item) =>
      item.href === subPath ||
      (item.href !== "" && subPath.startsWith(item.href)),
  );

  const moduleName = currentNavItem?.name || "Огляд";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Рівень воркспейсу */}
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href={baseDashboardPath}>
            {workspaceName}
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="hidden md:block" />

        {/* Рівень модуля */}
        <BreadcrumbItem>
          {subPath === "" || subPath === "/" ? (
            <BreadcrumbPage>{moduleName}</BreadcrumbPage>
          ) : (
            <BreadcrumbPage>{moduleName}</BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {/* Тут можна додати третій рівень для конкретних ID, якщо потрібно */}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
