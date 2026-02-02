/**
 * Репозиторій для роботи з сутністю 'Contact'.
 * Надає методи для CRUD операцій з контактами.
 */

import { createServerClient } from "@/shared/supabase/server";
import type { Database } from "@/shared/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];
type ContactUpdate = Database["public"]["Tables"]["contacts"]["Update"];

/**
 * Отримує контакт за ID.
 * @param contactId - ID контакту.
 * @returns Об'єкт контакту або null.
 */
export async function getById(
  contactId: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Contact | null> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error(`ContactRepository Error (getById): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Отримує всі контакти для воркспейсу з фільтрацією та пагінацією.
 * @param workspaceId - ID робочого простору.
 * @param options - Опції фільтрації та пагінації.
 * @returns Масив контактів.
 */
export async function getByWorkspaceId(
  workspaceId: string,
  options?: {
    ownerId?: string;
    status?: Contact["status"];
    limit?: number;
    offset?: number;
    showDeleted?: boolean;
  },
  supabaseClient?: SupabaseClient<Database>,
): Promise<Contact[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  let query = supabase
    .from("contacts")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (!options?.showDeleted) {
    query = query.is("deleted_at", null);
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
      options.offset + (options.limit || 20) - 1,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      `ContactRepository Error (getByWorkspaceId): ${error.message}`,
    );
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Отримує всі контакти для вказаної компанії.
 * @param companyId - ID компанії.
 * @param options - Опції пагінації.
 * @returns Масив контактів.
 */
export async function getByCompanyId(
  companyId: string,
  options?: {
    limit?: number;
    offset?: number;
    showDeleted?: boolean;
  },
  supabaseClient?: SupabaseClient<Database>,
): Promise<Contact[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  let query = supabase
    .from("contacts")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (!options?.showDeleted) {
    query = query.is("deleted_at", null);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 20) - 1,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error(`ContactRepository Error (getByCompanyId): ${error.message}`);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Створює новий контакт.
 * @param contact - Дані для створення контакту.
 * @returns Створений контакт.
 */
export async function create(
  contact: ContactInsert,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Contact> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("contacts")
    .insert(contact)
    .select()
    .single();

  if (error) {
    console.error(`ContactRepository Error (create): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Оновлює контакт.
 * @param contactId - ID контакту.
 * @param updates - Об'єкт з полями для оновлення.
 * @returns Оновлений контакт.
 */
export async function update(
  contactId: string,
  updates: ContactUpdate,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Contact> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("contacts")
    .update(updates)
    .eq("id", contactId)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    console.error(`ContactRepository Error (update): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * М'яке видалення контакту.
 * @param contactId - ID контакту.
 * @returns Видалений контакт.
 */
export async function softDelete(
  contactId: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Contact> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("contacts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", contactId)
    .select()
    .single();

  if (error) {
    console.error(`ContactRepository Error (softDelete): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Відновлює м'яко видалений контакт.
 * @param contactId - ID контакту.
 * @returns Відновлений контакт.
 */
export async function restore(
  contactId: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Contact> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("contacts")
    .update({ deleted_at: null })
    .eq("id", contactId)
    .select()
    .single();

  if (error) {
    console.error(`ContactRepository Error (restore): ${error.message}`);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Пошук контактів за текстом.
 * @param workspaceId - ID робочого простору.
 * @param searchQuery - Текст для пошуку.
 * @returns Масив знайдених контактів (макс 50).
 */
export async function search(
  workspaceId: string,
  searchQuery: string,
  supabaseClient?: SupabaseClient<Database>,
): Promise<Contact[]> {
  const supabase = supabaseClient ?? (await createServerClient());
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .or(`full_name.ilike.%${searchQuery}%,position.ilike.%${searchQuery}%`)
    .limit(50);

  if (error) {
    console.error(`ContactRepository Error (search): ${error.message}`);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Підраховує кількість контактів у воркспейсі.
 * @param workspaceId - ID робочого простору.
 * @param options - Опції фільтрації.
 * @returns Кількість контактів.
 */
export async function count(
  workspaceId: string,
  options?: {
    ownerId?: string;
    status?: Contact["status"];
    showDeleted?: boolean;
  },
  supabaseClient?: SupabaseClient<Database>,
): Promise<number> {
  const supabase = supabaseClient ?? (await createServerClient());
  let query = supabase
    .from("contacts")
    .select("id", { count: "exact" })
    .eq("workspace_id", workspaceId);

  if (!options?.showDeleted) {
    query = query.is("deleted_at", null);
  }

  if (options?.ownerId) {
    query = query.eq("owner_id", options.ownerId);
  }

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  const { count, error } = await query;

  if (error) {
    console.error(`ContactRepository Error (count): ${error.message}`);
    throw new Error(error.message);
  }

  return count || 0;
}
