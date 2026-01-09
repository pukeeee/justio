/**
 * @file Допоміжні функції для налаштування та очищення тестової бази даних.
 * @description Цей файл містить утиліти для створення клієнта Supabase,
 * очищення даних перед/після тестів та створення тестових сутностей (воркспейси, контакти, угоди).
 * Це центральний елемент для забезпечення ізольованого та передбачуваного середовища в інтеграційних тестах.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/shared/lib/types/database";

// Більш строгий тип для етапів пайплайну в тестах.
type PipelineStage = {
  id: string;
  name: string;
  order: number;
};

/**
 * Створює екземпляр клієнта Supabase, налаштований для роботи з тестовою базою даних.
 * @description Використовує змінні середовища `NEXT_PUBLIC_SUPABASE_URL` та `SUPABASE_SERVICE_ROLE_KEY`
 * для підключення. `SERVICE_ROLE_KEY` є обов'язковим для операцій, що вимагають прав адміністратора,
 * наприклад, для очищення даних та створення користувачів.
 * @throws {Error} Якщо змінні середовища для підключення до Supabase не задані.
 */
export function createTestSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase URL та Key (Anon або Service Role) повинні бути задані у змінних середовища.",
    );
  }

  // Створюємо клієнт з вимкненим persistSession для уникнення збереження сесій між тестами.
  return createClient<Database>(supabaseUrl, supabaseKey, {
    db: { schema: "public" },
    auth: { persistSession: false },
  });
}

/**
 * Очищує всі тестові дані з публічних таблиць та автентифікаційних користувачів.
 * @description Ця функція викликається після кожного інтеграційного тесту для забезпечення ізоляції.
 * Вона видаляє записи з усіх визначених таблиць та користувачів, створених для тестів (з `test-user` в email).
 * Порядок видалення з таблиць важливий для уникнення помилок зовнішніх ключів (foreign key constraints).
 */
export async function cleanupTestData() {
  const supabase = createTestSupabaseClient();

  // 1. Очищення таблиць в публічній схемі.
  const tables: Array<keyof Database["public"]["Tables"]> = [
    // Залежні таблиці спочатку
    "activities",
    "notifications",
    "files",
    "tasks",
    "deal_products",
    "deal_stage_history",
    "deals",
    "product_price_history",
    "products",
    "product_categories",
    "pipelines",
    "contacts",
    "companies",
    "workspace_invitations",
    "payments",
    "workspace_quotas",
    "subscriptions",
    "workspace_users",
    // Основна таблиця в кінці
    "workspaces",
  ];

  for (const table of tables) {
    try {
      let query = supabase.from(table).delete();

      // Для таблиць з PK 'workspace_id' використовуємо його для фільтрації,
      // для інших - 'id'. Це робить очищення безпечнішим і виправляє помилку.
      if (['workspace_quotas', 'subscriptions', 'integrations'].includes(table)) {
        // @ts-ignore - TypeScript не знає, що 'workspace_id' існує, але ми знаємо.
        query = query.neq('workspace_id', '00000000-0000-0000-0000-000000000000');
      } else {
        // @ts-ignore - TypeScript не знає, що 'id' існує, але ми знаємо.
        query = query.neq('id', '00000000-0000-0000-0000-000000000000');
      }

      const { error } = await query;
      if (error) throw error;

    } catch (error) {
      console.warn(`Не вдалося очистити таблицю ${table}:`, (error as Error).message);
    }
  }

  // 2. Очищення тестових користувачів зі схеми auth.
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    // Фільтруємо тільки користувачів, створених спеціально для тестів.
    const testUsers = data.users.filter((user) =>
      user.email?.includes("test-user"),
    );

    for (const user of testUsers) {
      await supabase.auth.admin.deleteUser(user.id);
    }
  } catch (error) {
    console.warn(`Не вдалося очистити auth користувачів:`, error);
  }
}

/**
 * Створює повний набір тестових даних для одного робочого простору.
 * @description Ця функція створює користувача-власника (якщо `owner_id` не передано),
 * робочий простір, зв'язок `workspace_users`, підписку (free tier) та квоти.
 * @param {object} [data] - Необов'язкові дані для створення воркспейсу.
 * @param {string} [data.name] - Назва воркспейсу.
 * @param {string} [data.slug] - Слаг воркспейсу.
 * @param {string} [data.owner_id] - ID існуючого користувача-власника.
 */
export async function createTestWorkspace(data?: {
  name?: string;
  slug?: string;
  owner_id?: string;
}) {
  const supabase = createTestSupabaseClient();
  let userId = data?.owner_id;
  let email: string | undefined;

  // Якщо owner_id не передано, створюємо нового користувача через Admin API.
  if (!userId) {
    email = `test-user-${Date.now()}-${Math.floor(
      Math.random() * 1000,
    )}@example.com`;
    const { data: user, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password: "test-password-123",
        email_confirm: true, // Створюємо одразу підтвердженого користувача.
      });

    if (createError) throw createError;
    userId = user.user.id;
  }

  // Створюємо робочий простір.
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      name: data?.name || "Test Workspace",
      slug: data?.slug || `test-${Date.now()}`,
      owner_id: userId,
    })
    .select()
    .single();

  if (workspaceError) throw workspaceError;

  // Прив'язуємо користувача до воркспейсу.
  const { error: userError } = await supabase.from("workspace_users").insert({
    workspace_id: workspace.id,
    user_id: userId,
    role: "owner",
    status: "active",
  });

  if (userError) throw userError;

  // Створюємо безкоштовну підписку за замовчуванням.
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .insert({
      workspace_id: workspace.id,
      tier: "free",
      status: "active",
    })
    .select()
    .single();

  if (subError) throw subError;

  // Створюємо квоти (використовуємо upsert, оскільки тригер може їх вже створити).
  const { data: quota, error: quotaError } = await supabase
    .from("workspace_quotas")
    .upsert({
      workspace_id: workspace.id,
      max_users: 2,
      max_contacts: 100,
      max_deals: 50,
      max_storage_mb: 500,
      current_users: 1,
      current_contacts: 0,
      current_deals: 0,
      current_storage_mb: 0,
    })
    .select()
    .single();

  if (quotaError) throw quotaError;

  return {
    workspace,
    subscription,
    quota,
    userId,
    email,
    password: "test-password-123",
  };
}

/**
 * Створює тестовий контакт у вказаному робочому просторі.
 * @param {string} workspaceId - ID робочого простору, до якого належить контакт.
 * @param {object} [data] - Необов'язкові дані для контакту.
 */
export async function createTestContact(
  workspaceId: string,
  data?: {
    first_name?: string;
    last_name?: string;
    company_id?: string;
  },
) {
  const supabase = createTestSupabaseClient();

  const { data: contact, error } = await supabase
    .from("contacts")
    .insert({
      workspace_id: workspaceId,
      first_name: data?.first_name || "John",
      last_name: data?.last_name || "Doe",
      company_id: data?.company_id || null,
      status: "new",
    })
    .select()
    .single();

  if (error) throw error;
  return contact;
}

/**
 * Створює тестову угоду у вказаному робочому просторі та пайплайні.
 * @param {string} workspaceId - ID робочого простору.
 * @param {string} pipelineId - ID пайплайну.
 * @param {object} [data] - Необов'язкові дані для угоди.
 */
export async function createTestDeal(
  workspaceId: string,
  pipelineId: string,
  data?: {
    title?: string;
    amount?: number;
    owner_id?: string;
  },
) {
  const supabase = createTestSupabaseClient();

  // Отримуємо перший етап з пайплайну, щоб призначити його угоді.
  const { data: pipeline, error: pipelineError } = await supabase
    .from("pipelines")
    .select("stages")
    .eq("id", pipelineId)
    .single();

  if (pipelineError) throw pipelineError;
  if (!pipeline) throw new Error(`Pipeline з ID ${pipelineId} не знайдено.`);

  // Перевіряємо, чи є у пайплайна етапи.
  const stages = pipeline.stages as Json;
  if (
    !Array.isArray(stages) ||
    stages.length === 0 ||
    typeof stages[0] !== "object" ||
    stages[0] === null ||
    !("id" in stages[0])
  ) {
    throw new Error(
      `Пайплайн з ID ${pipelineId} не має коректно налаштованих етапів (stages).`
    );
  }
  const firstStage = stages[0] as PipelineStage;

  const { data: deal, error } = await supabase
    .from("deals")
    .insert({
      workspace_id: workspaceId,
      pipeline_id: pipelineId,
      stage_id: firstStage.id,
      title: data?.title || "Test Deal",
      amount: data?.amount || 1000,
      owner_id: data?.owner_id || crypto.randomUUID(),
      status: "open",
    })
    .select()
    .single();

  if (error) throw error;
  return deal;
}
