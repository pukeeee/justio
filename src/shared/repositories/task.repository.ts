/**
 * Репозиторій для роботи з сутністю 'Task'.
 * Надає методи для CRUD операцій з завданнями.
 */

import { createServerClient } from "@/shared/supabase/server";
import type { Database } from "@/shared/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

// Строго типізовані переліки для фільтрів та статусів
export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type TaskPriority = Database["public"]["Enums"]["task_priority"];
export type TaskType = Database["public"]["Enums"]["task_type"];

/**
 * Отримує завдання за ID.
 * @param taskId - ID завдання.
 * @returns Об'єкт завдання або null.
 */
export async function getById(
  taskId: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Task | null> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error(`TaskRepository Error (getById): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Отримує всі завдання для воркспейсу з фільтрацією та пагінацією.
 * @param workspaceId - ID робочого простору.
 * @param options - Опції фільтрації та пагінації.
 * @returns Масив завдань.
 */
export async function getByWorkspaceId(
  workspaceId: string,
  options?: {
    assignedTo?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    taskType?: TaskType;
    dueDate?: string;
    limit?: number;
    offset?: number;
  },
  supabaseClient?: SupabaseClient<Database>,
): Promise<Task[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  let query = supabase
    .from("tasks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (options?.assignedTo) {
    query = query.eq("assigned_to", options.assignedTo);
  }

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.priority) {
    query = query.eq("priority", options.priority);
  }

  if (options?.taskType) {
    query = query.eq("task_type", options.taskType);
  }

  if (options?.dueDate) {
    query = query.eq("due_date", options.dueDate);
  }

  if (options?.limit || options?.offset) {
    const limit = options.limit ?? 20;
    const from = options.offset ?? 0;
    const to = from + limit - 1;
    query = query.range(from, to);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`TaskRepository Error (getByWorkspaceId): ${error.message}`);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Отримує завдання пов'язані з конкретним контактом.
 * @param contactId - ID контакту.
 * @returns Масив завдань.
 */
export async function getByContactId(
  contactId: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Task[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("contact_id", contactId)
    .is("deleted_at", null)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) {
    console.error(`TaskRepository Error (getByContactId): ${error.message}`);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Отримує завдання пов'язані з конкретною угодою.
 * @param dealId - ID угоди.
 * @returns Масив завдань.
 */
export async function getByDealId(
  dealId: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Task[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("deal_id", dealId)
    .is("deleted_at", null)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) {
    console.error(`TaskRepository Error (getByDealId): ${error.message}`);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Отримує прострочені завдання для користувача.
 * @param workspaceId - ID робочого простору.
 * @param assignedTo - ID користувача.
 * @returns Масив прострочених завдань.
 */
export async function getOverdueTasks(
  workspaceId: string,
  assignedTo: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Task[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("assigned_to", assignedTo)
    .neq("status", "completed")
    .lt("due_date", now)
    .is("deleted_at", null)
    .order("due_date", { ascending: true });

  if (error) {
    console.error(`TaskRepository Error (getOverdueTasks): ${error.message}`);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Створює нове завдання.
 * @param task - Дані для створення завдання.
 * @returns Створене завдання.
 */
export async function create(
  task: TaskInsert,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Task> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("tasks")
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error(`TaskRepository Error (create): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Оновлює завдання.
 * @param taskId - ID завдання.
 * @param updates - Об'єкт з полями для оновлення.
 * @returns Оновлене завдання.
 */
export async function update(
  taskId: string,
  updates: TaskUpdate,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Task> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    console.error(`TaskRepository Error (update): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * М'яке видалення завдання.
 * @param taskId - ID завдання.
 * @returns Видалене завдання.
 */
export async function softDelete(
  taskId: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Task> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", taskId)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    console.error(`TaskRepository Error (softDelete): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Позначає завдання як виконане.
 * @param taskId - ID завдання.
 * @returns Оновлене завдання.
 */
export async function markAsCompleted(
  taskId: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Task> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("tasks")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    console.error(`TaskRepository Error (markAsCompleted): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Підраховує кількість завдань у воркспейсі.
 * @param workspaceId - ID робочого простору.
 * @param status - Фільтр за статусом (опціонально).
 * @returns Кількість завдань.
 */
export async function countByWorkspaceId(
  workspaceId: string,
  options?: { status?: TaskStatus },
  supabaseClient?: SupabaseClient<Database>,
): Promise<number> {
  const supabase = supabaseClient ?? (await createServerClient());
  let query = supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null);

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  const { count, error } = await query;

  if (error) {
    console.error(
      `TaskRepository Error (countByWorkspaceId): ${error.message}`,
    );
    throw new Error(error.message);
  }

  return count || 0;
}
