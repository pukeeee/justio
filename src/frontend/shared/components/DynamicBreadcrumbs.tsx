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
} from "@/frontend/shared/components/ui/breadcrumb";
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

  // Отримуємо базовий шлях воркспейсу
  const baseDashboardPath = `/dashboard/${workspaceSlug}`;

  // Знаходимо назву модуля в конфігурації
  const allNavItems = [...DASHBOARD_NAV, ...DASHBOARD_SECONDARY_NAV];

  // Шукаємо найбільш підходящий елемент навігації
  const currentNavItem = allNavItems.find((item) => {
    const fullHref = item.href(workspaceSlug);
    // Точний збіг або якщо поточний pathname починається з href модуля (і це не корінь)
    return (
      pathname === fullHref ||
      (fullHref !== baseDashboardPath && pathname.startsWith(fullHref))
    );
  });

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
          <BreadcrumbPage>{moduleName}</BreadcrumbPage>
        </BreadcrumbItem>

        {/* Тут можна додати третій рівень для конкретних ID, якщо потрібно */}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
