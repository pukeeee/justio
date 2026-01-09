/**
 * Репозиторій для роботи з сутністю 'Deal'.
 * Надає методи для CRUD операцій з угодами.
 */

import { createServerClient } from "@/shared/supabase/server";
import type { Database } from "@/shared/lib/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

type Deal = Database["public"]["Tables"]["deals"]["Row"];
type DealInsert = Database["public"]["Tables"]["deals"]["Insert"];
type DealUpdate = Database["public"]["Tables"]["deals"]["Update"];

/**
 * Отримує угоду за ID.
 * @param dealId - ID угоди.
 * @returns Об'єкт угоди або null.
 */
export async function getById(
  dealId: string,
  supabaseClient?: SupabaseClient<Database>
): Promise<Deal | null> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error(`DealRepository Error (getById): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Отримує всі угоди для воркспейсу з фільтрацією та пагінацією.
 * @param workspaceId - ID робочого простору.
 * @param options - Опції фільтрації та пагінації.
 * @returns Масив угод.
 */
export async function getByWorkspaceId(
  workspaceId: string,
  options?: {
    pipelineId?: string;
    stageId?: string;
    ownerId?: string;
    status?: Database["public"]["Enums"]["deal_status"];
    limit?: number;
    offset?: number;
  },
  supabaseClient?: SupabaseClient<Database>
): Promise<Deal[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  let query = supabase
    .from("deals")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (options?.pipelineId) {
    query = query.eq("pipeline_id", options.pipelineId);
  }

  if (options?.stageId) {
    query = query.eq("stage_id", options.stageId);
  }

  if (options?.ownerId) {
    query = query.eq("owner_id", options.ownerId);
  }

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 20) - 1
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error(`DealRepository Error (getByWorkspaceId): ${error.message}`);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Отримує угоди для Kanban view.
 * @param pipelineId - ID воронки.
 * @param stageId - ID етапу (опціонально).
 * @returns Масив угод зі статусом 'open'.
 */
export async function getByPipelineAndStage(
  pipelineId: string,
  stageId?: string,
  supabaseClient?: SupabaseClient<Database>
): Promise<Deal[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  let query = supabase
    .from("deals")
    .select("*")
    .eq("pipeline_id", pipelineId)
    .eq("status", "open")
    .is("deleted_at", null);

  if (stageId) {
    query = query.eq("stage_id", stageId);
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      `DealRepository Error (getByPipelineAndStage): ${error.message}`
    );
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Створює нову угоду.
 * @param deal - Дані для створення угоди.
 * @returns Створена угода.
 */
export async function create(
  deal: DealInsert,
  supabaseClient?: SupabaseClient<Database>
): Promise<Deal> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("deals")
    .insert(deal)
    .select()
    .single();

  if (error) {
    console.error(`DealRepository Error (create): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Оновлює угоду.
 * @param dealId - ID угоди.
 * @param updates - Об'єкт з полями для оновлення.
 * @returns Оновлена угода.
 */
export async function update(
  dealId: string,
  updates: DealUpdate,
  supabaseClient?: SupabaseClient<Database>
): Promise<Deal> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("deals")
    .update(updates)
    .eq("id", dealId)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    console.error(`DealRepository Error (update): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * М'яке видалення угоди.
 * @param dealId - ID угоди.
 * @returns Видалена угода.
 */
export async function softDelete(
  dealId: string,
  supabaseClient?: SupabaseClient<Database>
): Promise<Deal> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("deals")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", dealId)
    .select()
    .single();

  if (error) {
    console.error(`DealRepository Error (softDelete): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Переміщує угоду на інший етап воронки.
 * @param dealId - ID угоди.
 * @param newStageId - ID нового етапу.
 * @returns Оновлена угода.
 */
export async function moveToStage(
  dealId: string,
  newStageId: string,
  supabaseClient?: SupabaseClient<Database>
): Promise<Deal> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("deals")
    .update({ stage_id: newStageId })
    .eq("id", dealId)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    console.error(`DealRepository Error (moveToStage): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Підраховує кількість угод у воркспейсі.
 * @param workspaceId - ID робочого простору.
 * @returns Кількість угод.
 */
export async function countByWorkspaceId(
  workspaceId: string,
  supabaseClient?: SupabaseClient<Database>
): Promise<number> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { count, error } = await supabase
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null);

  if (error) {
    console.error(
      `DealRepository Error (countByWorkspaceId): ${error.message}`
    );
    throw new Error(error.message);
  }

  return count || 0;
}
