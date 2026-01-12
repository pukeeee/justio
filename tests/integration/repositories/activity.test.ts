/**
 * @file Комплексні інтеграційні тести для activity.repository.ts.
 * @description Ці тести перевіряють, як RLS-політики та функції репозиторію
 * працюють для різних ролей користувачів (Owner, Manager, User),
 * відповідно до затвердженої матриці прав доступу.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { create, getById, update, hardDelete, getByWorkspaceId } from "@/shared/repositories/activity.repository";
import { createTestWorkspace } from "../../lib/helpers/db-setup";
import type { Database } from "@/shared/lib/types/database";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

type Activity = Database["public"]["Tables"]["activities"]["Row"];
type ActivityInsert = Database["public"]["Tables"]["activities"]["Insert"];

// --- Допоміжні функції для створення тестового середовища ---

/** Створює нового користувача в системі (але не додає до воркспейсу) */
async function createTestUser(adminClient: SupabaseClient<Database>) {
  const email = `test-user-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
  const password = "test-password-123";
  const { data, error } = await adminClient.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  return { user: data.user, email, password };
}

/** Створює автентифікований клієнт для вказаного користувача */
async function createAuthenticatedClient(email: string, password: string): Promise<SupabaseClient<Database>> {
  const anonClient = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: { session }, error } = await anonClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!session) throw new Error("Не вдалося отримати сесію для тестового користувача.");

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${session.access_token}` } } }
  );
}

// --- Основний блок тестів ---

describe.sequential("activity.repository (інтеграція з ролями)", () => {
  let adminClient: SupabaseClient<Database>;
  let workspaceId: string;

  // Клієнти для кожної ролі
  let ownerClient: SupabaseClient<Database>;
  let managerClient: SupabaseClient<Database>;
  let userClient: SupabaseClient<Database>;
  let outsiderClient: SupabaseClient<Database>; // Користувач з іншого воркспейсу
  let outsiderId: string;

  // ID користувачів для перевірок
  let ownerId: string;
  let managerId: string;
  let userId: string;

  // Тестові сутності
  let userNote: Activity; // Примітка, створена Користувачем
  let userCall: Activity; // Дзвінок, залогований Користувачем

  beforeEach(async () => {
    // Створюємо адмін-клієнт для налаштування тестового середовища
    adminClient = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // 1. Створюємо Власника та його воркспейс
    const { workspace, userId: oid, email: ownerEmail, password: ownerPassword } = await createTestWorkspace({ name: "Main Workspace" });
    workspaceId = workspace.id;
    ownerId = oid;
    ownerClient = await createAuthenticatedClient(ownerEmail!, ownerPassword);

    // 2. Створюємо Менеджера в цьому ж воркспейсі
    const { user: managerUser, email: managerEmail, password: managerPassword } = await createTestUser(adminClient);
    managerId = managerUser.id;
    await adminClient.from("workspace_users").insert({ workspace_id: workspaceId, user_id: managerId, role: "manager" });
    managerClient = await createAuthenticatedClient(managerEmail, managerPassword);

    // 3. Створюємо Користувача в цьому ж воркспейсі
    const { user: userUser, email: userEmail, password: userPassword } = await createTestUser(adminClient);
    userId = userUser.id;
    await adminClient.from("workspace_users").insert({ workspace_id: workspaceId, user_id: userId, role: "user" });
    userClient = await createAuthenticatedClient(userEmail, userPassword);

    // 4. Створюємо користувача в іншому воркспейсі для перевірки ізоляції
    const { userId: outsiderUserId, email: outsiderEmail, password: outsiderPassword } = await createTestWorkspace({ name: "Outsider Workspace" });
    outsiderId = outsiderUserId;
    outsiderClient = await createAuthenticatedClient(outsiderEmail!, outsiderPassword);

    // 5. Створюємо початкові дані для тестів
    userNote = await create({ workspace_id: workspaceId, user_id: userId, activity_type: "note", content: "User's original note" }, userClient);
    userCall = await create({ workspace_id: workspaceId, user_id: userId, activity_type: "call", content: "User's call log" }, userClient);
  });

  // --- Група 1: Операції CREATE ---
  describe("CREATE operations", () => {
    it("1.1: Власник МОЖЕ створити активність", async () => {
      const activityData: ActivityInsert = { workspace_id: workspaceId, user_id: ownerId, activity_type: "note", content: "Owner note" };
      const activity = await create(activityData, ownerClient);
      expect(activity.id).toBeDefined();
      expect(activity.user_id).toBe(ownerId);
    });

    it("1.2: Користувач МОЖЕ створити активність", async () => {
      const activityData: ActivityInsert = { workspace_id: workspaceId, user_id: userId, activity_type: "note", content: "User note" };
      const activity = await create(activityData, userClient);
      expect(activity.id).toBeDefined();
      expect(activity.user_id).toBe(userId);
    });

    it("1.4 (Безпека): Користувач з іншого воркспейсу НЕ МОЖЕ створити активність", async () => {
      const activityData: ActivityInsert = { workspace_id: workspaceId, user_id: outsiderId, activity_type: "note", content: "Malicious note" };
      // RLS політика на INSERT заблокує це, і буде згенеровано помилку
      await expect(create(activityData, outsiderClient)).rejects.toThrow();
    });
  });

  // --- Група 2: Операції UPDATE ---
  describe("UPDATE operations", () => {
    it("2.1: Користувач МОЖЕ оновити ВЛАСНУ примітку", async () => {
      const updated = await update(userNote.id, { content: "User's updated note" }, userClient);
      expect(updated.content).toBe("User's updated note");
    });

    it("2.2: Користувач НЕ МОЖЕ оновити примітку іншого користувача", async () => {
      const ownerNote = await create({ workspace_id: workspaceId, user_id: ownerId, activity_type: "note", content: "Owner's note" }, ownerClient);
      // RLS політика тихо заблокує оновлення, тому ми очікуємо, що контент не зміниться
      const result = await update(ownerNote.id, { content: "User trying to hack" }, userClient);
      expect(result.content).toBe("Owner's note");
    });

    it("2.3 (Ієрархія): Менеджер МОЖЕ оновити примітку, створену Користувачем", async () => {
      const updated = await update(userNote.id, { content: "Manager's edit" }, managerClient);
      expect(updated.content).toBe("Manager's edit");
    });

    it("2.5 (Незмінність логів): Власник НЕ МОЖЕ оновити активність типу 'call'", async () => {
       // RLS політика дозволяє оновлювати ТІЛЬКИ 'note', тому оновлення буде тихо заблоковано
      const result = await update(userCall.id, { content: "Owner trying to change log" }, ownerClient);
      expect(result.content).toBe("User's call log"); // Перевіряємо, що контент не змінився
    });
  });

  // --- Група 3: Операції DELETE ---
  describe("DELETE operations", () => {
    it("3.1: Користувач МОЖЕ видалити ВЛАСНУ примітку", async () => {
      await hardDelete(userNote.id, userClient);
      const result = await getById(userNote.id, userClient);
      expect(result).toBeNull();
    });

    it("3.2: Користувач НЕ МОЖЕ видалити примітку іншого користувача", async () => {
      const ownerNote = await create({ workspace_id: workspaceId, user_id: ownerId, activity_type: "note", content: "Owner's note" }, ownerClient);
      // RLS політика заблокує видалення, тому помилки не буде, але запис залишиться
      await hardDelete(ownerNote.id, userClient);
      const result = await getById(ownerNote.id, ownerClient);
      expect(result).not.toBeNull();
    });
    
    it("3.3 (Ієрархія): Менеджер МОЖЕ видалити примітку, створену Користувачем", async () => {
      await hardDelete(userNote.id, managerClient);
      const result = await getById(userNote.id, managerClient);
      expect(result).toBeNull();
    });

    it("3.4 (Незмінність логів): Власник НЕ МОЖЕ видалити активність типу 'call'", async () => {
      // RLS політика дозволяє видаляти ТІЛЬКИ 'note', тому запис залишиться
      await hardDelete(userCall.id, ownerClient);
      const result = await getById(userCall.id, ownerClient);
      expect(result).not.toBeNull();
    });
  });

  // --- Група 4: Операції SELECT ---
  describe("SELECT operations", () => {
    it("4.1 (Ізоляція): Користувач з іншого воркспейсу НЕ БАЧИТЬ жодних активностей", async () => {
      const activities = await getByWorkspaceId(workspaceId, {}, outsiderClient);
      expect(activities.length).toBe(0);
    });

    it("4.2 (Видимість): Користувач БАЧИТЬ активності в межах свого воркспейсу", async () => {
      const activities = await getByWorkspaceId(workspaceId, {}, userClient);
      // У beforeEach створюється 2 активності: userNote and userCall
      expect(activities.length).toBeGreaterThanOrEqual(2);
      expect(activities.some(a => a.id === userNote.id)).toBe(true);
    });
  });
});