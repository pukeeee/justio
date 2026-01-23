/**
 * @file Сервіс для роботи з воркспейсами.
 * @description Цей файл містить бізнес-логіку та логіку оркестрації,
 * пов'язану з управлінням воркспейсами. Він виступає як посередник
 * між Server Actions (шар дій) та репозиторіями (шар доступу до даних).
 */


import { createServerClient } from '@/shared/supabase/server';
import type { Database } from '@/shared/lib/types/database';
import { WorkspaceRepository } from '@/shared/repositories';

// Визначаємо локальний тип `Workspace` як підмножина полів з таблиці `workspaces`.
type Workspace = Pick<
  Database['public']['Tables']['workspaces']['Row'],
  'id' | 'name' | 'slug'
>;

/**
 * Отримує всі воркспейси, до яких поточний автентифікований користувач має доступ.
 * @async
 * @returns {Promise<Workspace[] | null>} Проміс, що повертає масив об'єктів воркспейсів або `null` у разі помилки або відсутності користувача.
 * @throws Помилки не кидаються, а логуються в консоль. У разі помилки повертається `null`.
 */
export async function getUserWorkspaces(): Promise<Workspace[] | null> {
  try {
    // Створення серверного клієнта Supabase для взаємодії з БД.
    const supabase = await createServerClient();

    // Отримання даних поточного користувача.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Якщо користувач не автентифікований, робота неможлива.
    if (!user) {
      console.error(
        "[WorkspaceService:getUserWorkspaces] Користувач не автентифікований.",
      );
      return null;
    }

    // Делегування запиту до репозиторію. RLS політики в Supabase забезпечують,
    // що повернуться тільки ті воркспейси, до яких користувач має доступ.
    const workspaces = await WorkspaceRepository.findAllForUser(supabase);
    return workspaces;
  } catch (error) {
    console.error(
      "[WorkspaceService:getUserWorkspaces] Неочікувана помилка:",
      error,
    );
    return null;
  }
}

/**
 * Створює новий воркспейс для автентифікованого користувача.
 * Виконує валідацію вхідних даних та викликає RPC-функцію в базі даних для створення запису.
 * @async
 * @param {string} name - Назва нового воркспейсу.
 * @returns {Promise<{ workspace: Workspace | null; error: string | null }>} Об'єкт, що містить або новостворений воркспейс, або повідомлення про помилку.
 */
export async function createWorkspace(
  name: string,
): Promise<{ workspace: Workspace | null; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        workspace: null,
        error: "Помилка автентифікації. Спробуйте увійти знову.",
      };
    }

    // Валідація бізнес-правил на рівні сервісу.
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return {
        workspace: null,
        error: "Назва має бути довшою за 2 символи та коротшою за 100.",
      };
    }

    // Делегування створення до репозиторію, який викликає відповідну RPC-функцію.
    const newWorkspace = await WorkspaceRepository.create(
      supabase,
      trimmedName,
    );

    return {
      workspace: newWorkspace,
      error: null,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Несподівана помилка.";
    console.error(
      `[WorkspaceService:createWorkspace] Неочікувана помилка: ${errorMessage}`,
    );
    return {
      workspace: null,
      error: errorMessage,
    };
  }
}

/**
 * Отримує один воркспейс за його унікальним ідентифікатором (ID).
 * Доступ контролюється RLS політиками на рівні бази даних.
 * @async
 * @param {string} workspaceId - ID воркспейсу, який потрібно знайти.
 * @returns {Promise<Workspace | null>} Проміс, що повертає об'єкт воркспейсу або `null`, якщо його не знайдено або сталася помилка.
 */
export async function getWorkspaceById(
  workspaceId: string,
): Promise<Workspace | null> {
  try {
    const supabase = await createServerClient();
    const workspace = await WorkspaceRepository.findById(supabase, workspaceId);
    return workspace;
  } catch (error) {
    console.error(
      `[WorkspaceService:getWorkspaceById] Неочікувана помилка: ${error}`,
    );
    return null;
  }
}

/**
 * Видаляє воркспейс за його ID, виконуючи попередню перевірку прав доступу.
 * Тільки користувач з роллю 'owner' має право видаляти воркспейс.
 * @async
 * @param {string} workspaceId - ID воркспейсу для видалення.
 * @returns {Promise<{ success: boolean; error: string | null }>} Об'єкт, що містить статус операції та повідомлення про помилку, якщо вона сталася.
 */
export async function deleteWorkspace(
  workspaceId: string,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Помилка автентифікації." };
    }

    // Крок 1: Отримання ролі користувача для даного воркспейсу через RPC-виклик.
    const { data: role, error: roleError } = await supabase.rpc(
      "get_workspace_role",
      { p_user_id: user.id, p_workspace_id: workspaceId },
    );

    if (roleError) {
      // Якщо функція RPC повернула помилку, обробляємо її.
      console.error(
        `[WorkspaceService:deleteWorkspace] Помилка отримання ролі: ${roleError.message}`,
      );
      throw new Error(roleError.message);
    }

    // Крок 2: Авторизація. Перевіряємо, чи є користувач власником.
    if (role !== "owner") {
      return {
        success: false,
        error: "Тільки власник може видалити цей воркспейс.",
      };
    }

    // Крок 3: Якщо перевірка пройдена, делегуємо видалення репозиторію.
    await WorkspaceRepository.deleteById(supabase, workspaceId);

    return { success: true, error: null };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Несподівана помилка.";
    console.error(
      `[WorkspaceService:deleteWorkspace] Неочікувана помилка: ${errorMessage}`,
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
}
