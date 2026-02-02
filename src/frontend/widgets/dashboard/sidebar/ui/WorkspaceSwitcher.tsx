/**
 * @file TeamSwitcher.tsx
 * @description Компонент перемикача воркспейсів у сайдбарі
 *
 * АРХІТЕКТУРА:
 * - Отримує дані безпосередньо з Zustand store (без проміжних провайдерів)
 * - Використовує селективні підписки для оптимізації ре-рендерів
 * - Синхронізує активний воркспейс з URL
 */

"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Building2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend/shared/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/frontend/shared/components/ui/sidebar";
import {
  useWorkspaces,
  useCanCreateWorkspace,
  useWorkspacesInitialized,
} from "@/frontend/shared/stores/workspace-store";

/**
 * Компонент перемикача воркспейсів
 *
 * ФУНКЦІОНАЛ:
 * 1. Відображає список всіх воркспейсів користувача
 * 2. Дозволяє переключатися між воркспейсами
 * 3. Показує кнопку створення (якщо не досягнуто ліміт)
 * 4. Підсвічує активний воркспейс
 *
 * СТАН:
 * - workspaces: з Zustand store (список воркспейсів)
 * - canCreate: з Zustand store (чи можна створити новий)
 * - initialized: з Zustand store (чи завантажено дані)
 * - currentSlug: з URL params (активний воркспейс)
 */
export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const params = useParams();

  // ===== ОТРИМАННЯ ДАНИХ З STORE =====

  /**
   * Список воркспейсів з Zustand
   * ОПТИМІЗАЦІЯ: селективна підписка - ре-рендер тільки при зміні списку
   */
  const workspaces = useWorkspaces();

  /**
   * Чи можна створити новий воркспейс
   * Враховує тарифний план та поточну кількість
   */
  const canCreate = useCanCreateWorkspace();

  /**
   * Чи ініціалізовано store даними з сервера
   * ВАЖЛИВО: використовується для показу skeleton до завантаження
   */
  const initialized = useWorkspacesInitialized();

  // ===== ОТРИМАННЯ SLUG З URL =====

  /**
   * Slug активного воркспейсу з URL
   * Приклад: /dashboard/my-workspace -> "my-workspace"
   */
  const currentSlug = params?.slug as string | undefined;

  // ===== ОБЧИСЛЕННЯ АКТИВНОГО ВОРКСПЕЙСУ =====

  /**
   * Знаходить активний воркспейс за slug з URL
   *
   * ЛОГІКА FALLBACK:
   * 1. Якщо є slug в URL - шукаємо воркспейс з таким slug
   * 2. Якщо не знайдено - fallback на перший воркспейс
   * 3. Якщо немає воркспейсів - повертає undefined
   *
   * МЕМОІЗАЦІЯ:
   * - Перераховується тільки при зміні workspaces або currentSlug
   * - Запобігає зайвим ре-рендерам дочірніх компонентів
   */
  const activeWorkspace = React.useMemo(() => {
    // Якщо store ще не ініціалізовано - повертаємо undefined
    if (!initialized) return undefined;

    // Якщо немає воркспейсів - повертаємо undefined
    if (workspaces.length === 0) return undefined;

    // Якщо є slug в URL - шукаємо відповідний воркспейс
    if (currentSlug) {
      const found = workspaces.find((w) => w.slug === currentSlug);
      if (found) return found;

      // Debug: логуємо, якщо slug в URL не відповідає жодному воркспейсу
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[TeamSwitcher] Воркспейс з slug "${currentSlug}" не знайдено. ` +
            `Fallback на перший воркспейс.`,
        );
      }
    }

    // Fallback на перший воркспейс
    return workspaces[0];
  }, [workspaces, currentSlug, initialized]);

  // ===== ОБРОБНИКИ ПОДІЙ =====

  /**
   * Обробник переключення воркспейсу
   *
   * ЛОГІКА:
   * - Навігує на /dashboard/{slug}
   * - Next.js автоматично оновить params
   * - activeWorkspace перерахується через useMemo
   *
   * МЕМОІЗАЦІЯ:
   * - useCallback запобігає створенню нової функції при кожному рендері
   * - Залежність: router (не змінюється)
   */
  const handleWorkspaceSwitch = React.useCallback(
    (slug: string) => {
      router.push(`/dashboard/${slug}`);
    },
    [router],
  );

  /**
   * Обробник створення нового воркспейсу
   *
   * ЛОГІКА:
   * - Навігує на сторінку управління воркспейсами
   * - Там користувач може створити новий воркспейс
   * - Після створення redirect на /dashboard/{new-slug}
   */
  const handleCreateWorkspace = React.useCallback(() => {
    router.push("/user/workspace");
  }, [router]);

  // ===== РЕНДЕРИНГ =====

  /**
   * СТАН 1: Завантаження
   * Показуємо skeleton поки store не ініціалізовано
   * Це запобігає миготінню "Створити воркспейс"
   */
  if (!initialized) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary/20 flex aspect-square size-8 items-center justify-center rounded-lg animate-pulse" />
            <div className="grid flex-1 gap-1.5">
              <div className="h-4 w-24 bg-sidebar-primary/20 rounded animate-pulse" />
              <div className="h-3 w-16 bg-sidebar-primary/20 rounded animate-pulse" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  /**
   * СТАН 2: Немає воркспейсів
   * Показуємо кнопку створення першого воркспейсу
   */
  if (workspaces.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={handleCreateWorkspace}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Plus className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Створити воркспейс</span>
              <span className="truncate text-xs">Почніть роботу</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  /**
   * СТАН 3: Є воркспейси
   * Показуємо dropdown з переліком та поточним воркспейсом
   */
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {/* Іконка воркспейсу */}
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Building2 className="size-4" />
              </div>

              {/* Інформація про поточний воркспейс */}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeWorkspace?.name || "Воркспейс"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {workspaces.length}{" "}
                  {workspaces.length === 1 ? "воркспейс" : "воркспейси"}
                </span>
              </div>

              {/* Стрілка dropdown */}
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          {/* Випадаюче меню */}
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {/* Заголовок секції */}
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Воркспейси
            </DropdownMenuLabel>

            {/* Список воркспейсів */}
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleWorkspaceSwitch(workspace.slug)}
                className="gap-2 p-2"
                disabled={workspace.slug === currentSlug}
              >
                {/* Іконка */}
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Building2 className="size-4 shrink-0" />
                </div>

                {/* Назва */}
                <span className="truncate">{workspace.name}</span>

                {/* Індикатор активного */}
                {workspace.slug === currentSlug && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Активний
                  </span>
                )}
              </DropdownMenuItem>
            ))}

            {/* Кнопка створення нового (якщо можна) */}
            {canCreate && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onClick={handleCreateWorkspace}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Додати воркспейс
                  </div>
                </DropdownMenuItem>
              </>
            )}

            {/* Повідомлення про ліміт (якщо досягнуто) */}
            {!canCreate && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Досягнуто ліміт воркспейсів для вашого тарифу
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
