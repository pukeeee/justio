/**
 * @file NavUser.tsx
 * @description Компонент користувача в sidebar з dropdown меню
 * 
 * АРХІТЕКТУРА:
 * - Отримує дані користувача з props (передаються з серверного компонента)
 * - Використовує уніфіковану конфігурацію USER_PAGES
 * - Підтримує Server Actions для logout
 */

"use client";

import { ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
  USER_PAGES,
  UPGRADE_ACTION,
  LOGOUT_ACTION,
} from "@/shared/lib/config/user-pages";
import { signOut } from "@/features/auth/actions/auth.actions";
import type { FormattedUserData } from "@/shared/lib/auth/get-user-data";

/**
 * Props для компонента
 */
interface NavUserProps {
  user: FormattedUserData;
}

/**
 * Компонент навігації користувача в sidebar
 * 
 * ФУНКЦІОНАЛ:
 * - Відображає аватар та інформацію користувача
 * - Dropdown меню з навігацією
 * - Опція оновлення тарифу
 * - Кнопка виходу з системи
 * 
 * @param user - Форматовані дані користувача
 */
export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  /**
   * Обробник виходу з системи
   * Викликає Server Action та редіректить на головну
   */
  const handleLogout = async () => {
    try {
      await signOut();
      // Редірект відбувається в Server Action
    } catch (error) {
      console.error("[NavUser] Помилка виходу:", error);
      // Fallback редірект
      router.push("/");
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          {/* Тригер - кнопка з аватаром */}
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          {/* Dropdown контент */}
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* Заголовок з інформацією користувача */}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Опція оновлення тарифу */}
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <a href={UPGRADE_ACTION.href} className="cursor-pointer">
                  <UPGRADE_ACTION.icon className="mr-2 h-4 w-4" />
                  {UPGRADE_ACTION.label}
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Основна навігація */}
            <DropdownMenuGroup>
              {USER_PAGES.map((page) => (
                <DropdownMenuItem key={page.href} asChild>
                  <a href={page.href} className="cursor-pointer">
                    <page.icon className="mr-2 h-4 w-4" />
                    {page.label}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Вихід */}
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LOGOUT_ACTION.icon className="mr-2 h-4 w-4" />
              {LOGOUT_ACTION.label}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
