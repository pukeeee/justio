"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { createWorkspaceAction } from "@/features/workspace/actions/create-workspace.action";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * @typedef {object} CreateWorkspaceFormProps
 * @description Пропси для компонента `CreateWorkspaceForm`.
 * @property {() => void} onSuccessAction - Колбек-функція, яка викликається після успішного створення воркспейсу.
 */
type CreateWorkspaceFormProps = {
  onSuccessAction: () => void;
};

/**
 * Внутрішній компонент кнопки відправки форми.
 * Використовує хук `useFormStatus` для отримання стану відправки форми-батька.
 * Це дозволяє показувати стан завантаження (`pending`) без необхідності передавати пропси.
 * @returns {JSX.Element}
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

/**
 * Форма для створення нового воркспейсу.
 * Використовує React `useActionState` для управління станом форми та взаємодії з Server Action.
 * Після успішного створення викликає наданий колбек `onSuccessAction`.
 *
 * @param {CreateWorkspaceFormProps} props - Пропси компонента.
 * @returns {JSX.Element}
 */
export function CreateWorkspaceForm({
  onSuccessAction,
}: CreateWorkspaceFormProps) {
  /**
   * Ініціалізація стану форми за допомогою `useActionState`.
   * @param {Action} createWorkspaceAction - Server Action, який буде викликаний при відправці форми.
   * @param {object} initialState - Початковий стан форми.
   * @returns {[state, formAction]} - Поточний стан та функція для відправки форми.
   */
  const [state, formAction] = useActionState(createWorkspaceAction, {
    workspace: null,
    error: null,
  });

  // `useEffect` для обробки "сайд-ефектів", що виникають після зміни стану `state`.
  // Це правильний спосіб викликати такі дії, як показ сповіщень або колбеків,
  // у відповідь на результат роботи Server Action.
  useEffect(() => {
    // Якщо `state` містить помилку, показуємо її користувачеві.
    if (state.error) {
      toast.error(state.error);
    }

    // Якщо `state` містить успішно створений воркспейс, показуємо сповіщення
    // і викликаємо батьківський колбек для закриття модального вікна.
    if (state.workspace) {
      toast.success(`Воркспейс "${state.workspace.name}" створено!`);
      onSuccessAction();
    }
    // Залежності хука: `state` (результат екшену) та `onSuccessAction` (колбек).
  }, [state, onSuccessAction]);

  return (
    // HTML-тег <form> з атрибутом `action`, що вказує на Server Action.
    <form action={formAction} className="space-y-4">
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
        />
        <p className="text-xs text-muted-foreground">Від 2 до 100 символів</p>
      </div>

      {/* Блок для відображення помилки, якщо вона є в стані `state` */}
      {state.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Компонент кнопки, який знає про стан відправки форми */}
      <SubmitButton />
    </form>
  );
}
