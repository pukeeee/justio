/**
 * @file TeamSwitcher.tsx
 * @description Компонент перемикача воркспейсів у сайдбарі
 *
 * Особливості:
 * - Моментальне відображення (дані з Zustand)
 * - Автоматичне визначення активного воркспейсу з URL
 * - Перевірка ліміту створення воркспейсів
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
} from "@/shared/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import {
  useWorkspaceStore,
  useCanCreateWorkspace,
} from "@/shared/stores/workspace-store";

/**
 * Компонент перемикача воркспейсів
 * Відображає список всіх воркспейсів користувача та дозволяє перемикатися між ними
 */
export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const params = useParams();

  // Отримуємо slug з URL
  const currentSlug = params?.slug as string | undefined;

  // Отримуємо дані з Zustand store (моментально, без loading)
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const canCreate = useCanCreateWorkspace();

  // Знаходимо активний воркспейс
  const activeWorkspace = React.useMemo(() => {
    if (!currentSlug) return workspaces[0]; // Fallback на перший
    return workspaces.find((w) => w.slug === currentSlug) || workspaces[0];
  }, [workspaces, currentSlug]);

  // Синхронізуємо активний воркспейс зі store
  React.useEffect(() => {
    if (activeWorkspace) {
      useWorkspaceStore.getState().setCurrentWorkspace(activeWorkspace.slug);
    }
  }, [activeWorkspace]);

  /**
   * Обробник перемикання воркспейсу
   */
  const handleWorkspaceSwitch = React.useCallback(
    (slug: string) => {
      router.push(`/dashboard/${slug}`);
    },
    [router],
  );

  /**
   * Обробник створення нового воркспейсу
   */
  const handleCreateWorkspace = React.useCallback(() => {
    router.push("/user/workspace");
  }, [router]);

  // Якщо немає жодного воркспейсу - показуємо placeholder
  if (workspaces.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            onClick={handleCreateWorkspace}
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

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeWorkspace?.name || "Воркспейс"}
                </span>
                <span className="truncate text-xs">
                  {workspaces.length}{" "}
                  {workspaces.length === 1 ? "воркспейс" : "воркспейси"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Воркспейси
            </DropdownMenuLabel>
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleWorkspaceSwitch(workspace.slug)}
                className="gap-2 p-2"
                disabled={workspace.slug === currentSlug}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-sidebar">
                  <Building2 className="size-3.5 shrink-0" />
                </div>
                <span className="truncate">{workspace.name}</span>
                {workspace.slug === currentSlug && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Активний
                  </span>
                )}
              </DropdownMenuItem>
            ))}

            {canCreate && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onClick={handleCreateWorkspace}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Додати воркспейс
                  </div>
                </DropdownMenuItem>
              </>
            )}

            {!canCreate && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Досягнуто ліміт воркспейсів
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
