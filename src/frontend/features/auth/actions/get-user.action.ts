"use server";

import { authController } from "@/backend/api/controllers";
import type { UserResponse } from "@/backend/api/contracts/auth.contracts";
import type { ApiResponse } from "@/backend/api/contracts/base.contracts";

/**
 * Server Action для отримання даних поточного користувача.
 * Використовується для ініціалізації профілю або стану на фронтенді.
 */
export async function getUserAction(): Promise<ApiResponse<UserResponse>> {
  return await authController.getCurrentUser();
}
