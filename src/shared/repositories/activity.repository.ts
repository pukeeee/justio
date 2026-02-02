/**
 * Репозиторій для роботи з сутністю 'Activity'.
 * Надає методи для CRUD операцій з активностями (включаючи notes, calls, emails).
 */

import { createServerClient } from "@/shared/supabase/server";
import type { Database } from "@/shared/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

type Activity = Database["public"]["Tables"]["activities"]["Row"];
type ActivityInsert = Database["public"]["Tables"]["activities"]["Insert"];
type ActivityUpdate = Database["public"]["Tables"]["activities"]["Update"];
type ActivityType = Database["public"]["Enums"]["activity_type"];

/**
 * Отримує активність за ID.
 * @param activityId - ID активності.
 * @returns Об'єкт активності або null.
 */
export async function getById(
  activityId: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Activity | null> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("id", activityId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error(`ActivityRepository Error (getById): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Отримує всі активності для воркспейсу з фільтрацією та пагінацією.
 * @param workspaceId - ID робочого простору.
 * @param options - Опції фільтрації та пагінації.
 * @returns Масив активностей.
 */
export async function getByWorkspaceId(
  workspaceId: string,
  options?: {
    activityType?: ActivityType;
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  },
  supabaseClient?: SupabaseClient<Database>,
): Promise<Activity[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  let query = supabase
    .from("activities")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (options?.activityType) {
    query = query.eq("activity_type", options.activityType);
  }

  if (options?.userId) {
    query = query.eq("user_id", options.userId);
  }

  if (options?.startDate) {
    query = query.gte("created_at", options.startDate);
  }

  if (options?.limit || options?.offset) {
    const limit = options.limit ?? 20;
    const from = options.offset ?? 0;
    const to = from + limit - 1;
    query = query.range(from, to);
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      `ActivityRepository Error (getByWorkspaceId): ${error.message}`,
    );
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Отримує активності для конкретного контакту.
 * @param contactId - ID контакту.
 * @returns Масив активностей.
 */
export async function getByContactId(
  contactId: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Activity[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      `ActivityRepository Error (getByContactId): ${error.message}`,
    );
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Отримує активності для конкретної угоди.
 * @param dealId - ID угоди.
 * @returns Масив активностей.
 */
export async function getByDealId(
  dealId: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Activity[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`ActivityRepository Error (getByDealId): ${error.message}`);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Отримує активності для конкретної компанії.
 * @param companyId - ID компанії.
 * @returns Масив активностей.
 */
export async function getByCompanyId(
  companyId: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Activity[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      `ActivityRepository Error (getByCompanyId): ${error.message}`,
    );
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Отримує активності для конкретного завдання.
 * @param taskId - ID завдання.
 * @returns Масив активностей.
 */
export async function getByTaskId(
  taskId: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Activity[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`ActivityRepository Error (getByTaskId): ${error.message}`);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Отримує примітки (notes) для воркспейсу.
 * Це спеціалізований метод для роботи з activity_type = 'note'.
 * @param workspaceId - ID робочого простору.
 * @param options - Опції фільтрації.
 * @returns Масив notes (activities з типом 'note').
 */
export async function getNotesByWorkspaceId(
  workspaceId: string,
  options?: {
    userId?: string;
    isPinned?: boolean;
    limit?: number;
    offset?: number;
  },
  supabaseClient?: SupabaseClient<Database>,
): Promise<Activity[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  let query = supabase
    .from("activities")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("activity_type", "note")
    .order("created_at", { ascending: false });

  if (options?.userId) {
    query = query.eq("user_id", options.userId);
  }

  // Фільтр по pinned через metadata
  if (options?.isPinned !== undefined) {
    query = query.eq("metadata->>is_pinned", String(options.isPinned));
  }

  if (options?.limit || options?.offset) {
    const limit = options.limit ?? 20;
    const from = options.offset ?? 0;
    const to = from + limit - 1;
    query = query.range(from, to);
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      `ActivityRepository Error (getNotesByWorkspaceId): ${error.message}`,
    );
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Пошук notes за текстом.
 * @param workspaceId - ID робочого простору.
 * @param searchQuery - Текст для пошуку.
 * @returns Масив знайдених notes (макс 50).
 */
export async function searchNotes(
  workspaceId: string,
  searchQuery: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Activity[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("activity_type", "note")
    .ilike("content", `%${searchQuery}%`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error(`ActivityRepository Error (searchNotes): ${error.message}`);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Створює нову активність.
 * @param activity - Дані для створення активності.
 * @returns Створена активність.
 */
export async function create(
  activity: ActivityInsert,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Activity> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("activities")
    .insert(activity)
    .select()
    .single();

  if (error) {
    console.error(`ActivityRepository Error (create): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Оновлює активність.
 * УВАГА: Activities зазвичай незмінні (append-only log).
 * Цей метод варто використовувати тільки для виправлення помилок
 * або оновлення metadata (наприклад, is_pinned для notes).
 * @param activityId - ID активності.
 * @param updates - Об'єкт з полями для оновлення.
 * @returns Оновлена активність.
 */
export async function update(
  activityId: string,
  updates: ActivityUpdate,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Activity> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { error: updateError } = await supabase
    .from("activities")
    .update(updates)
    .eq("id", activityId);

  if (updateError) {
    console.error(`ActivityRepository Error (update): ${updateError.message}`);
    throw new Error(updateError.message);
  }

  const { data, error: selectError } = await supabase
    .from("activities")
    .select("*")
    .eq("id", activityId)
    .single();

  if (selectError) {
    console.error(
      `ActivityRepository Error (post-update select): ${selectError.message}`,
    );
    throw new Error(selectError.message);
  }

  return data;
}

/**
 * Видаляє активність.
 * УВАГА: Activities - це історія подій, тому видалення має бути рідкісним.
 * @param activityId - ID активності.
 */
export async function hardDelete(
  activityId: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<void> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId);

  if (error) {
    console.error(`ActivityRepository Error (hardDelete): ${error.message}`);
    throw new Error(error.message);
  }
}

/**
 * Закріпити/відкріпити примітку (note).
 * Оновлює metadata.is_pinned для activity з типом 'note'.
 * @param activityId - ID активності (примітки).
 * @param isPinned - Статус закріплення.
 * @returns Оновлена активність.
 */
export async function toggleNotePin(
  activityId: string,
  isPinned: boolean,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Activity> {
  const supabase = supabaseClient ?? (await createServerClient());

  // Спочатку отримуємо поточну активність
  const { data: currentActivity, error: fetchError } = await supabase
    .from("activities")
    .select("metadata")
    .eq("id", activityId)
    .eq("activity_type", "note")
    .single();

  if (fetchError) {
    console.error(
      `ActivityRepository Error (toggleNotePin): ${fetchError.message}`,
    );
    throw new Error(fetchError.message);
  }

  // Оновлюємо metadata
  const updatedMetadata = {
    ...((currentActivity.metadata as Record<string, unknown>) || {}),
    is_pinned: isPinned,
  };

  const { error: updateError } = await supabase
    .from("activities")
    .update({ metadata: updatedMetadata })
    .eq("id", activityId);

  if (updateError) {
    console.error(
      `ActivityRepository Error (toggleNotePin update): ${updateError.message}`,
    );
    throw new Error(updateError.message);
  }

  const { data, error: selectError } = await supabase
    .from("activities")
    .select("*")
    .eq("id", activityId)
    .single();

  if (selectError) {
    console.error(
      `ActivityRepository Error (toggleNotePin post-update select): ${selectError.message}`,
    );
    throw new Error(selectError.message);
  }

  return data;
}

/**
 * Підраховує кількість активностей у воркспейсі.
 * @param workspaceId - ID робочого простору.
 * @param activityType - Фільтр за типом (опціонально).
 * @returns Кількість активностей.
 */
export async function countByWorkspaceId(
  workspaceId: string,
  activityType?: ActivityType,
  supabaseClient?: SupabaseClient<Database>,
): Promise<number> {
  const supabase = supabaseClient ?? (await createServerClient());
  let query = supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  if (activityType) {
    query = query.eq("activity_type", activityType);
  }

  const { count, error } = await query;

  if (error) {
    console.error(
      `ActivityRepository Error (countByWorkspaceId): ${error.message}`,
    );
    throw new Error(error.message);
  }

  return count || 0;
}
