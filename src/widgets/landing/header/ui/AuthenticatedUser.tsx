"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { useUser } from "@/shared/hooks/use-auth";
import { DROPDOWN_MENU_ITEMS } from "../config/dropdown-menu.config";
import { signOut } from "@/features/auth/actions/auth.actions";
import { LogOut } from "lucide-react";

/**
 * Компонент для відображення авторизованого користувача
 *
 * Покращення:
 * - Використання useTransition для плавного виходу
 * - Обробка помилок
 * - Оптимізація рендерингу
 */
export function AuthenticatedUser() {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  /**
   * Генерує ініціали з імені користувача
   */
  const getInitials = (name: string | undefined): string => {
    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Обробник виходу з системи
   */
  const handleSignOut = () => {
    setError(null);

    startTransition(async () => {
      try {
        await signOut();
        // Після signOut відбудеться редірект,
        // тому цей код може не виконатись
      } catch (err) {
        // Ловимо тільки реальні помилки, не NEXT_REDIRECT
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          console.error("Помилка виходу:", err);
          setError("Не вдалося вийти. Спробуйте ще раз.");

          // Очищаємо помилку через 3 секунди
          setTimeout(() => setError(null), 3000);
        }
      }
    });
  };

  if (!user) return null;

  const userName = user.user_metadata?.full_name || user.email || "Користувач";
  const userEmail = user.email || "";
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="flex items-center md:gap-4">
      {/* Кнопка Dashboard (тільки на desktop) */}
      <Button asChild size="sm" className="hidden md:inline-flex">
        <Link href="/dashboard">Дашборд</Link>
      </Button>

      {/* Dropdown меню користувача */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full"
            disabled={isPending}
          >
            <Avatar className="h-8 w-8">
              {avatarUrl && (
                <AvatarImage
                  src={avatarUrl}
                  alt={userName}
                  referrerPolicy="no-referrer"
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          {/* Інформація користувача */}
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none truncate">
                {userName}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Навігаційні пункти */}
          {DROPDOWN_MENU_ITEMS.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>{item.label}</Link>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* Кнопка виходу */}
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isPending}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <div className="w-full text-left flex items-center">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isPending ? "Вихід..." : "Вийти"}</span>
            </div>
          </DropdownMenuItem>

          {/* Відображення помилки */}
          {error && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs text-destructive">
                {error}
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
