/**
 * @file Репозиторій для роботи з сутністю 'Workspace'.
 * @description Цей файл є шаром доступу до даних (Data Access Layer) для сутності 'workspaces'.
 * Він інкапсулює всю логіку прямих запитів до бази даних, пов'язаних з воркспейсами,
 * використовуючи клієнт Supabase. Кожна функція відповідає за конкретну CRUD-операцію
 * або виклик RPC-функції.
 */
import type { Database } from "@/shared/lib/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

type Workspace = Pick<
  Database["public"]["Tables"]["workspaces"]["Row"],
  "id" | "name" | "slug"
>;

/**
 * Отримує всі воркспейси, до яких має доступ поточний користувач.
 * Результат фільтрується на рівні бази даних за допомогою RLS (Row-Level Security) політик,
 * що гарантує, що користувач отримає тільки ті воркспейси, в яких він є учасником.
 * @async
 * @param {SupabaseClient<Database>} supabase - Екземпляр клієнта Supabase.
 * @returns {Promise<Workspace[]>} Проміс, що повертає масив об'єктів воркспейсів.
 * @throws {Error} Кидає помилку, якщо запит до бази даних завершився невдало.
 */
export async function findAllForUser(
  supabase: SupabaseClient<Database>,
): Promise<Workspace[]> {
  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("id, name, slug")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      `[WorkspaceRepository:findAllForUser] Помилка: ${error.message}`,
    );
    throw new Error("Не вдалося отримати список воркспейсів.");
  }

  return (workspaces as Workspace[]) || [];
}

/**
 * Створює новий воркспейс та призначає поточного користувача його власником.
 * Операція виконується через виклик RPC-функції `create_workspace_with_owner` в базі даних.
 * Це забезпечує атомарність операції (створення воркспейсу та запису в `workspace_users` в одній транзакції).
 * @async
 * @param {SupabaseClient<Database>} supabase - Екземпляр клієнта Supabase.
 * @param {string} name - Назва нового воркспейсу.
 * @returns {Promise<Workspace>} Проміс, що повертає новостворений об'єкт воркспейсу.
 * @throws {Error} Кидає помилку, якщо RPC-виклик завершився невдало.
 */
export async function create(
  supabase: SupabaseClient<Database>,
  name: string,
): Promise<Workspace> {
  const { data, error } = await supabase
    .rpc("create_workspace_with_owner", { p_name: name })
    .single();

  if (error || !data) {
    console.error(
      `[WorkspaceRepository:create] Помилка RPC: ${error?.message}`,
    );
    throw new Error(error?.message || "Не вдалося створити воркспейс.");
  }

  // Мапінг результату RPC у звичний об'єкт Workspace
  return {
    id: data.workspace_id,
    name: data.workspace_name,
    slug: data.workspace_slug,
  };
}

/**
 * Отримує один воркспейс за його унікальним ідентифікатором (ID).
 * Доступ контролюється RLS політиками, тому запит поверне дані тільки якщо
 * поточний користувач є учасником цього воркспейсу.
 * @async
 * @param {SupabaseClient<Database>} supabase - Екземпляр клієнта Supabase.
 * @param {string} workspaceId - ID воркспейсу, який потрібно знайти.
 * @returns {Promise<Workspace | null>} Проміс, що повертає об'єкт воркспейсу або `null`, якщо його не знайдено.
 * @throws {Error} Кидає помилку при будь-якій помилці бази даних, окрім "запис не знайдено".
 */
export async function findById(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<Workspace | null> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, slug")
    .eq("id", workspaceId)
    .single();

  if (error) {
    // Код 'PGRST116' від PostgREST означає, що запит `.single()` не повернув жодного рядка.
    // Це очікувана поведінка, коли воркспейс не знайдено, тому ми не вважаємо це помилкою.
    if (error.code === "PGRST116") {
      return null;
    }
    // Всі інші помилки вважаються критичними.
    console.error(`[WorkspaceRepository:findById] Помилка: ${error.message}`);
    throw new Error("Не вдалося знайти воркспейс.");
  }

  return data as Workspace;
}

/**
 * Видаляє воркспейс за його унікальним ідентифікатором (ID).
 * Успішність операції залежить від RLS політики на таблиці `workspaces`.
 * Політика має дозволяти видалення тільки користувачам з відповідною роллю (наприклад, 'owner').
 * Завдяки 'ON DELETE CASCADE' в базі даних, при видаленні воркспейсу також видаляються всі пов'язані з ним дані.
 * @async
 * @param {SupabaseClient<Database>} supabase - Екземпляр клієнта Supabase.
 * @param {string} workspaceId - ID воркспейсу для видалення.
 * @returns {Promise<void>} Проміс, що завершується, коли операція виконана.
 * @throws {Error} Кидає помилку, якщо операція видалення в базі даних завершилася невдало.
 */
export async function deleteById(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<void> {
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  if (error) {
    console.error(`[WorkspaceRepository:deleteById] Помилка: ${error.message}`);
    throw new Error("Не вдалося видалити воркспейс.");
  }
}
