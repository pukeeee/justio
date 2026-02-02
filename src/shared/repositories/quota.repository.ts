/**
 * Репозиторій для роботи з сутностями 'Quotas'.
 * Надає методи для взаємодії з таблицею 'workspace_quotas'.
 */

import { createServerClient } from "@/shared/supabase/server";
import type { Database } from "@/shared/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

type Quota = Database["public"]["Tables"]["workspace_quotas"]["Row"];
type QuotaUpdate = Database["public"]["Tables"]["workspace_quotas"]["Update"];

/**
 * Отримує поточне використання та ліміти для воркспейсу.
 * @param workspaceId - ID робочого простору.
 * @param supabaseClient - опціональний екземпляр Supabase клієнта.
 * @returns Об'єкт квот або null.
 */
export async function getQuotasByWorkspaceId(
  workspaceId: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Quota | null> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("workspace_quotas")
    .select("*")
    .eq("workspace_id", workspaceId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error(`QuotaRepository Error (getByWorkspaceId): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Оновлює ліміти (квоти) для воркспейсу.
 * @param workspaceId - ID робочого простору.
 * @param updates - Об'єкт з лімітами для оновлення.
 * @param supabaseClient - опціональний екземпляр Supabase клієнта.
 * @returns Оновлений об'єкт квот.
 */
export async function updateQuotas(
  workspaceId: string,
  updates: QuotaUpdate,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Quota> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("workspace_quotas")
    .update(updates)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error) {
    console.error(`QuotaRepository Error (updateQuotas): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}
