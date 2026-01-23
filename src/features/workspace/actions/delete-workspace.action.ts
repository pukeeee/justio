'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { deleteWorkspace } from '@/shared/services/workspace.service';

/**
 * @typedef {object} FormState
 * @description Визначає структуру об'єкта, що повертається Server Action для відображення стану операції у формі.
 * @property {boolean} isSuccess - Прапорець, що вказує на успішне виконання операції.
 * @property {boolean} isError - Прапорець, що вказує на виникнення помилки.
 * @property {string} message - Повідомлення про результат операції (успіх або помилка).
 */
export type FormState = {
  isSuccess: boolean;
  isError: boolean;
  message: string;
};

/**
 * Server Action для безпечного видалення воркспейсу.
 * Цей екшен викликається з клієнтської форми і використовує хук `useActionState`.
 * Він делегує бізнес-логіку видалення сервісу `deleteWorkspace`, який містить перевірки прав доступу.
 *
 * @param {string} workspaceId - ID воркспейсу, який потрібно видалити. Цей параметр "прив'язується" (bind) до екшену на клієнті.
 * @param {FormState} _prevState - Попередній стан форми. Не використовується, але є обов'язковим для `useActionState`.
 * @param {FormData} formData - Дані з форми. Не використовуються, оскільки ID воркспейсу передається через `bind`.
 * @returns {Promise<FormState>} - Об'єкт зі станом операції.
 * @throws {Error} Перенаправлення відбувається після успішного видалення, що перериває виконання функції.
 */
export async function deleteWorkspaceAction(
  workspaceId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // Перевірка наявності ID воркспейсу, хоча він має бути завжди переданий через bind.
  if (!workspaceId) {
    return {
      isSuccess: false,
      isError: true,
      message: 'Помилка: ID воркспейсу не вказано.',
    };
  }

  try {
    // Виклик сервісного шару для виконання основної логіки видалення
    const result = await deleteWorkspace(workspaceId);

    // Якщо сервіс повернув помилку (наприклад, недостатньо прав), повертаємо її клієнту
    if (!result.success) {
      return {
        isSuccess: false,
        isError: true,
        message: result.error || 'Не вдалося видалити воркспейс.',
      };
    }

    // Якщо ми дійшли сюди, видалення було успішним.
    // Наступні команди `revalidatePath` та `redirect` викличуть виняток,
    // тому повернення стану успіху тут не потрібне.
  } catch (error) {
    // Обробка непередбачуваних помилок на випадок, якщо сервіс кинув виняток
    const errorMessage =
      error instanceof Error ? error.message : 'Сталася несподівана помилка.';
    return {
      isSuccess: false,
      isError: true,
      message: errorMessage,
    };
  }

  // --- Успішне завершення ---

  // Очищення кешу Next.js для сторінок, які відображають списки воркспейсів.
  // Це гарантує, що користувачі побачать оновлений список без видаленого воркспейсу.
  revalidatePath('/user/workspace'); // Сторінка вибору воркспейсів
  revalidatePath('/dashboard', 'layout'); // Загальний лейаут дашборду, де може бути кешована інформація

  // Перенаправлення користувача на сторінку вибору воркспейсів після успішного видалення.
  // Ця функція кидає спеціальний виняток, який перериває виконання коду.
  redirect('/user/workspace');
}
