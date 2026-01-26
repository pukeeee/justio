/**
 * @file CreateWorkspaceForm.tsx
 * @description Форма створення воркспейсу з перевіркою квот
 */

"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createWorkspaceAction } from "@/features/workspace/actions/create-workspace.action";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  useWorkspaceStore,
  useCanCreateWorkspace,
} from "@/shared/stores/workspace-store";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

// ============================================================================
// ТИПИ
// ============================================================================

type CreateWorkspaceFormProps = {
  /** Callback після успішного створення */
  onSuccessAction: () => void;
};

// ============================================================================
// SUBMIT BUTTON COMPONENT
// ============================================================================

/**
 * Кнопка submit з індикатором завантаження
 *
 * ВАЖЛИВО:
 * - Використовує useFormStatus() з react-dom
 * - Автоматично disabled під час pending
 * - Показує spinner
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Створення...
        </>
      ) : (
        "Створити воркспейс"
      )}
    </Button>
  );
}

// ============================================================================
// ОСНОВНИЙ КОМПОНЕНТ
// ============================================================================

/**
 * Форма створення воркспейсу з валідацією та обробкою помилок
 *
 * ФУНКЦІОНАЛ:
 * 1. Client-side валідація (2-100 символів)
 * 2. Перевірка квоти перед відображенням форми
 * 3. Server Action для створення
 * 4. Автоматичне додавання в store
 * 5. Toast нотифікації
 */
export function CreateWorkspaceForm({
  onSuccessAction,
}: CreateWorkspaceFormProps) {
  // ===== ПЕРЕВІРКА КВОТИ =====

  /**
   * Перевіряємо чи може користувач створити ще один воркспейс
   * Враховує тарифний план
   */
  const canCreate = useCanCreateWorkspace();

  /**
   * Функція для додавання воркспейсу в store
   */
  const addWorkspace = useWorkspaceStore((state) => state.addWorkspace);

  // ===== FORM STATE =====

  const [state, formAction] = useActionState(createWorkspaceAction, {
    workspace: null,
    error: null,
  });

  // ===== REFS ДЛЯ ЗАПОБІГАННЯ ДУБЛЮВАННЮ =====

  /**
   * Ref для відстеження чи вже показали toast для поточного стану
   * Запобігає подвійним нотифікаціям при ре-рендерах
   */
  const previousStateRef = useRef(state);

  // ===== ОБРОБКА РЕЗУЛЬТАТУ =====

  /**
   * Effect для обробки результату Server Action
   *
   * ОПТИМІЗАЦІЯ:
   * - Виконується тільки при зміні state
   * - Перевіряємо чи це новий стан (не дублюємо toast)
   * - Cleanup на unmount
   */
  useEffect(() => {
    // Перевіряємо чи стан змінився
    const stateChanged = previousStateRef.current !== state;

    if (!stateChanged) return;

    // Оновлюємо ref
    previousStateRef.current = state;

    // ОБРОБКА ПОМИЛКИ
    if (state.error) {
      toast.error(state.error);
    }

    // ОБРОБКА УСПІХУ
    if (state.workspace) {
      // Додаємо в store
      addWorkspace(state.workspace);

      // Показуємо успішне повідомлення
      toast.success(`Воркспейс "${state.workspace.name}" створено!`);

      // Викликаємо callback (закриє модалку)
      onSuccessAction();
    }
  }, [state, onSuccessAction, addWorkspace]);

  // ===== РЕНДЕР =====

  /**
   * СТАН 1: Досягнуто ліміт
   * Показуємо попередження замість форми
   */
  if (!canCreate) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Ви досягли максимальної кількості воркспейсів для вашого тарифу.
          <br />
          Оновіть підписку щоб створити більше воркспейсів.
        </AlertDescription>
      </Alert>
    );
  }

  /**
   * СТАН 2: Форма створення
   */
  return (
    <form action={formAction} className="space-y-4">
      {/* Поле вводу назви */}
      <div className="space-y-2">
        <Label htmlFor="name">Назва воркспейсу</Label>
        <Input
          id="name"
          name="name"
          placeholder="Моя компанія"
          required
          minLength={2}
          maxLength={100}
          autoComplete="off"
          autoFocus
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">Від 2 до 100 символів</p>
      </div>

      {/* Відображення помилки від server */}
      {state.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Кнопка submit */}
      <SubmitButton />
    </form>
  );
}
