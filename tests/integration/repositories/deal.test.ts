/**
 * @file Інтеграційні тести для deal.repository.ts.
 * @description Ці тести перевіряють взаємодію з реальною базою даних
 * для всіх функцій репозиторію угод.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  create,
  getById,
  update,
  softDelete,
  getByWorkspaceId,
  getByPipelineAndStage,
  moveToStage,
  countByWorkspaceId,
} from "@/shared/lib/repositories/deal.repository";
import { createTestWorkspace } from "../../lib/helpers/db-setup";
import type { Database } from "@/shared/lib/types/database";

type Pipeline = Database["public"]["Tables"]["pipelines"]["Row"];
type Deal = Database["public"]["Tables"]["deals"]["Row"];
type DealInsert = Database["public"]["Tables"]["deals"]["Insert"];

type PipelineStage = {
  id: string;
  name: string;
  order: number;
};

import { createClient, SupabaseClient } from "@supabase/supabase-js";

describe.sequential("deal.repository (integration)", () => {
  let testWorkspaceId: string;
  let testOwnerId: string;
  let testPipeline: Pipeline;
  let testStage1Id: string;
  let testStage2Id: string;
  // `testClient` буде клієнтом, автентифікованим як тестовий користувач
  let testClient: SupabaseClient<Database>;

  beforeEach(async () => {
    // Створюємо воркспейс і отримуємо дані тестового користувача
    const { workspace, userId, email, password } = await createTestWorkspace();
    if (!email || !password) {
      throw new Error(
        "Не вдалося створити тестового користувача з email/паролем.",
      );
    }
    testWorkspaceId = workspace.id;
    testOwnerId = userId;

    // Створюємо тимчасовий анонімний клієнт, щоб залогінитися
    const anonClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const {
      data: { session },
      error: signInError,
    } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) throw signInError;
    if (!session)
      throw new Error("Не вдалося отримати сесію для тестового користувача.");

    // Створюємо основний тестовий клієнт, що використовує JWT користувача.
    // Це потрібно, щоб auth.uid() коректно працював у тригерах БД.
    testClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${session.access_token}` },
        },
      },
    );

    // Створюємо тестовий пайплайн
    const { data: pipeline, error } = await testClient
      .from("pipelines")
      .insert({
        workspace_id: testWorkspaceId,
        name: "Test Pipeline",
        stages: [
          { id: "stage-1", name: "New", order: 1 },
          { id: "stage-2", name: "Contacted", order: 2 },
        ],
      })
      .select()
      .single();

    if (error) throw error;
    testPipeline = pipeline;
    testStage1Id = (testPipeline.stages as PipelineStage[])[0].id;
    testStage2Id = (testPipeline.stages as PipelineStage[])[1].id;
  });

  // --- Tests will be added here ---

  describe("create and getById", () => {
    it("повинен створити угоду і потім отримати її за ID", async () => {
      const dealData: DealInsert = {
        workspace_id: testWorkspaceId,
        pipeline_id: testPipeline.id,
        stage_id: testStage1Id,
        title: "Initial Test Deal",
        amount: 5000,
        owner_id: testOwnerId,
      };

      // Act: Створюємо угоду
      const createdDeal = await create(dealData, testClient);

      // Assert: Перевіряємо створену угоду
      expect(createdDeal).not.toBeNull();
      expect(createdDeal.id).toBeDefined();
      expect(createdDeal.title).toBe("Initial Test Deal");
      expect(createdDeal.workspace_id).toBe(testWorkspaceId);

      // Act: Отримуємо угоду за ID
      const fetchedDeal = await getById(createdDeal.id, testClient);

      // Assert: Перевіряємо отриману угоду
      expect(fetchedDeal).not.toBeNull();
      expect(fetchedDeal?.id).toBe(createdDeal.id);
      expect(fetchedDeal?.title).toBe("Initial Test Deal");
    });

    it("getById повинен повертати null для неіснуючого ID", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const result = await getById(nonExistentId, testClient);
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    let deal: Deal;

    beforeEach(async () => {
      deal = await create(
        {
          workspace_id: testWorkspaceId,
          pipeline_id: testPipeline.id,
          stage_id: testStage1Id,
          title: "Deal to be Updated",
          amount: 100,
          owner_id: testOwnerId,
        },
        testClient,
      );
    });

    it("повинен оновити поля угоди", async () => {
      const updates = {
        title: "Updated Title",
        amount: 2500,
      };

      // Act
      const updatedDeal = await update(deal.id, updates, testClient);

      // Assert
      expect(updatedDeal).not.toBeNull();
      expect(updatedDeal.title).toBe("Updated Title");
      expect(updatedDeal.amount).toBe(2500);
      expect(updatedDeal.id).toBe(deal.id);
    });

    it("повинен викидати помилку при оновленні неіснуючої угоди", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      await expect(
        update(nonExistentId, { title: "Won't work" }, testClient),
      ).rejects.toThrow();
    });
  });

  describe("softDelete", () => {
    let deal: Deal;

    beforeEach(async () => {
      deal = await create(
        {
          workspace_id: testWorkspaceId,
          pipeline_id: testPipeline.id,
          stage_id: testStage1Id,
          title: "Deal to be Deleted",
          owner_id: testOwnerId,
        },
        testClient,
      );
    });

    it("повинен м'яко видалити угоду", async () => {
      // Act
      const deletedDeal = await softDelete(deal.id, testClient);
      const shouldBeNull = await getById(deal.id, testClient);

      // Assert
      expect(deletedDeal.deleted_at).not.toBeNull();
      expect(shouldBeNull).toBeNull();
    });
  });

  describe("getByWorkspaceId", () => {
    let anotherOwnerId: string;

    beforeEach(async () => {
      const { userId } = await createTestWorkspace({ name: "another" });
      anotherOwnerId = userId;

      // Створюємо кілька угод для тестування фільтрів
      await create(
        {
          title: "Deal 1",
          workspace_id: testWorkspaceId,
          pipeline_id: testPipeline.id,
          stage_id: testStage1Id,
          owner_id: testOwnerId,
          status: "open",
        },
        testClient,
      );
      await create(
        {
          title: "Deal 2",
          workspace_id: testWorkspaceId,
          pipeline_id: testPipeline.id,
          stage_id: testStage2Id,
          owner_id: testOwnerId,
          status: "won",
        },
        testClient,
      );
      await create(
        {
          title: "Deal 3",
          workspace_id: testWorkspaceId,
          pipeline_id: testPipeline.id,
          stage_id: testStage1Id,
          owner_id: anotherOwnerId,
          status: "open",
        },
        testClient,
      );
    });

    it("повинен повертати всі угоди для воркспейсу", async () => {
      const result = await getByWorkspaceId(testWorkspaceId, {}, testClient);
      expect(result.length).toBe(3);
    });

    it("повинен фільтрувати за stage_id", async () => {
      const result = await getByWorkspaceId(
        testWorkspaceId,
        { stageId: testStage1Id },
        testClient,
      );
      expect(result.length).toBe(2);
      expect(result.every((d) => d.stage_id === testStage1Id)).toBe(true);
    });

    it("повинен фільтрувати за owner_id", async () => {
      const result = await getByWorkspaceId(
        testWorkspaceId,
        { ownerId: anotherOwnerId },
        testClient,
      );
      expect(result.length).toBe(1);
      expect(result[0].owner_id).toBe(anotherOwnerId);
    });

    it("повинен фільтрувати за status", async () => {
      const result = await getByWorkspaceId(
        testWorkspaceId,
        { status: "won" },
        testClient,
      );
      expect(result.length).toBe(1);
      expect(result[0].status).toBe("won");
    });

    it("повинен застосовувати пагінацію (limit і offset)", async () => {
      const firstPage = await getByWorkspaceId(
        testWorkspaceId,
        { limit: 2, offset: 0 },
        testClient,
      );
      expect(firstPage.length).toBe(2);

      const secondPage = await getByWorkspaceId(
        testWorkspaceId,
        { limit: 2, offset: 2 },
        testClient,
      );
      expect(secondPage.length).toBe(1);
    });
  });

  describe("getByPipelineAndStage", () => {
    beforeEach(async () => {
      await create(
        {
          title: "Open Deal",
          workspace_id: testWorkspaceId,
          pipeline_id: testPipeline.id,
          stage_id: testStage1Id,
          owner_id: testOwnerId,
          status: "open",
        },
        testClient,
      );
      await create(
        {
          title: "Won Deal",
          workspace_id: testWorkspaceId,
          pipeline_id: testPipeline.id,
          stage_id: testStage2Id,
          owner_id: testOwnerId,
          status: "won",
        },
        testClient,
      );
    });

    it("повинен повертати тільки відкриті ('open') угоди для пайплайну", async () => {
      const result = await getByPipelineAndStage(
        testPipeline.id,
        undefined,
        testClient,
      );
      expect(result.length).toBe(1);
      expect(result[0].status).toBe("open");
    });
  });

  describe("moveToStage", () => {
    it("повинен перемістити угоду на інший етап", async () => {
      const deal = await create(
        {
          title: "Movable Deal",
          workspace_id: testWorkspaceId,
          pipeline_id: testPipeline.id,
          stage_id: testStage1Id,
          owner_id: testOwnerId,
        },
        testClient,
      );

      // Act
      const movedDeal = await moveToStage(deal.id, testStage2Id, testClient);

      // Assert
      expect(movedDeal.stage_id).toBe(testStage2Id);
    });
  });

  describe("countByWorkspaceId", () => {
    beforeEach(async () => {
      await create(
        {
          title: "Count Deal 1",
          workspace_id: testWorkspaceId,
          pipeline_id: testPipeline.id,
          stage_id: testStage1Id,
          owner_id: testOwnerId,
        },
        testClient,
      );
      await create(
        {
          title: "Count Deal 2",
          workspace_id: testWorkspaceId,
          pipeline_id: testPipeline.id,
          stage_id: testStage1Id,
          owner_id: testOwnerId,
        },
        testClient,
      );
    });

    it("повинен правильно підраховувати кількість угод", async () => {
      const count = await countByWorkspaceId(testWorkspaceId, testClient);
      expect(count).toBe(2);
    });
  });
});
