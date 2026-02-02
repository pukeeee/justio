/**
 * @file get-user-data.ts
 * @description Серверні утиліти для отримання даних користувача з форматуванням
 */

import { createServerClient } from "@/shared/supabase/server";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import * as WorkspaceRepository from "@/shared/repositories/workspace.repository";

/**
 * Тип для форматованих даних користувача
 */
export type FormattedUserData = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  initials: string;
};

/**
 * Отримує воркспейси користувача з кешуванням для Server Components
 * 
 * ВАЖЛИВО: Завдяки cache(), якщо ця функція викликається в декількох 
 * Server Components під час одного запиту, реальний запит до БД 
 * буде виконано лише ОДИН РАЗ.
 */
export const getUserWorkspaces = cache(async () => {
  const supabase = await createServerClient();
  try {
    return await WorkspaceRepository.findAllForUser(supabase);
  } catch (error) {
    console.error("[getUserWorkspaces] Помилка:", error);
    return [];
  }
});

/**
 * Отримує та форматує дані користувача для UI компонентів
...

/**
 * Генерує ініціали з email або імені
 */
function generateInitials(email: string, fullName?: string): string {
  if (fullName) {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  }

  // Якщо немає імені - беремо з email
  const emailPart = email.split("@")[0];
  return emailPart.substring(0, 2).toUpperCase();
}

/**
 * Отримує та форматує дані користувача для UI компонентів
 * 
 * ВИКОРИСТАННЯ:
 * - В Server Components для передачі даних Client Components
 * - Форматує дані в зручний для відображення вигляд
 * - Генерує ініціали для аватара
 * 
 * @returns FormattedUserData | null
 */
export const getFormattedUserData = cache(
  async (): Promise<FormattedUserData | null> => {
    const supabase = await createServerClient();

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        // Не логуємо помилку, якщо сесія просто відсутня (нормально для неавторизованих)
        if (error && error.message !== "Auth session missing!") {
          console.error(
            "[getFormattedUserData] Помилка отримання користувача:",
            error.message,
          );
        }
        return null;
      }

      // Отримуємо додаткові дані з user_metadata
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Користувач";

      const avatarUrl =
        user.user_metadata?.avatar_url || user.user_metadata?.picture || "";

      return {
        id: user.id,
        name: fullName,
        email: user.email || "",
        avatar: avatarUrl,
        initials: generateInitials(user.email || "", fullName),
      };
    } catch (error) {
      console.error("[getFormattedUserData] Критична помилка:", error);
      return null;
    }
  },
);

/**
 * Отримує raw об'єкт User (для cases коли потрібен повний доступ)
 */
export const getCachedUser = cache(async (): Promise<User | null> => {
  const supabase = await createServerClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      // Не логуємо помилку, якщо сесія просто відсутня
      if (error.message !== "Auth session missing!") {
        console.error(
          "[getCachedUser] Помилка отримання користувача:",
          error.message,
        );
      }
      return null;
    }

    return user;
  } catch (error) {
    console.error("[getCachedUser] Критична помилка:", error);
    return null;
  }
});

/**
 * Перевіряє, чи авторизований користувач
 */
export const isAuthenticated = cache(async (): Promise<boolean> => {
  const user = await getCachedUser();
  return !!user;
});
