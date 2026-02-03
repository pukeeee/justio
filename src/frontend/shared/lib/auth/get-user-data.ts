/**
 * @file get-user-data.ts
 * @description Серверні утиліти для отримання даних користувача з форматуванням
 */

import { cache } from "react";
import { container } from "@/backend/infrastructure/di/container";
import { IAuthService } from "@/backend/application/interfaces/services/auth.service.interface";
import { IWorkspaceRepository } from "@/backend/application/interfaces/repositories/workspace.repository.interface";

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
  try {
    const authService = container.resolve<IAuthService>("IAuthService");
    const currentUser = await authService.getCurrentUser();

    if (!currentUser) return [];

    const workspaceRepo = container.resolve<IWorkspaceRepository>(
      "IWorkspaceRepository",
    );
    const workspaces = await workspaceRepo.findAllByUserId(currentUser.id);

    // Мапимо до спрощеного формату для фронтенду
    return workspaces.map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
    }));
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
    try {
      const authService = container.resolve<IAuthService>("IAuthService");
      const user = await authService.getCurrentUser();

      if (!user) return null;

      const fullName = user.fullName || user.email.split("@")[0] || "Користувач";
      const avatarUrl = user.avatarUrl || "";

      return {
        id: user.id,
        name: fullName,
        email: user.email,
        avatar: avatarUrl,
        initials: generateInitials(user.email, user.fullName || undefined),
      };
    } catch (error) {
      console.error("[getFormattedUserData] Критична помилка:", error);
      return null;
    }
  },
);

/**
 * Отримує доменний об'єкт User
 */
export const getCachedUser = cache(async () => {
  try {
    const authService = container.resolve<IAuthService>("IAuthService");
    return await authService.getCurrentUser();
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
