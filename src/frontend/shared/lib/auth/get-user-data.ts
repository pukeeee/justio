/**
 * @file get-user-data.ts
 * @description Серверні утиліти для отримання даних користувача (Wrapper над API Layer)
 *
 * ВАЖЛИВО: Цей файл є тимчасовим "містком" для забезпечення зворотньої сумісності
 * під час рефакторингу. Всі методи всередині використовують професійні Server Actions.
 */

import { cache } from "react";
import { getUserAction } from "@/frontend/features/auth/actions/get-user.action";
import { getWorkspacesAction } from "@/frontend/features/workspace/actions/get-workspaces.action";
import type { Workspace } from "@/frontend/entities/workspace/model/type";

/**
 * Тип для форматованих даних користувача (View Model)
 */
export type FormattedUserData = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  initials: string;
};

/**
 * Отримує воркспейси користувача з кешуванням для Server Components.
 * Тепер використовує системний WorkspaceController через Server Action.
 */
export const getUserWorkspaces = cache(async (): Promise<Workspace[]> => {
  try {
    const result = await getWorkspacesAction();

    if (!result.success || !result.data) {
      return [];
    }

    // Мапимо до формату, який очікує існуючий фронтенд
    return result.data.items.map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
    }));
  } catch (error) {
    console.error("[getUserWorkspaces] Помилка рефакторингу:", error);
    return [];
  }
});

/**
 * Отримує та форматує дані користувача для UI компонентів.
 * Тепер використовує AuthController через Server Action.
 */
export const getFormattedUserData = cache(
  async (): Promise<FormattedUserData | null> => {
    try {
      const result = await getUserAction();

      if (!result.success || !result.data) {
        return null;
      }

      const { id, name, email, avatar, initials } = result.data;

      return {
        id,
        name,
        email,
        avatar,
        initials,
      };
    } catch (error) {
      console.error("[getFormattedUserData] Помилка рефакторингу:", error);
      return null;
    }
  },
);

/**
 * Отримує статус авторизації (кешовано)
 */
export const isAuthenticated = cache(async (): Promise<boolean> => {
  try {
    const result = await getUserAction();
    return result.success && !!result.data;
  } catch (error) {
    return false;
  }
});

/**
 * Отримує дані користувача (застарілий метод, краще використовувати getFormattedUserData)
 */
export const getCachedUser = cache(async () => {
  try {
    const result = await getUserAction();
    return result.data || null;
  } catch (error) {
    return null;
  }
});
