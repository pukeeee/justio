/**
 * @file CreateWorkspaceForm.tsx
 * @description Форма створення воркспейсу з перевіркою квот
 */

"use client";

import { useActionState, useEffect } from "react";
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

type CreateWorkspaceFormProps = {
  onSuccessAction: () => void;
};

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
 * Форма створення воркспейсу з перевіркою ліміту
 */
export function CreateWorkspaceForm({
  onSuccessAction,
}: CreateWorkspaceFormProps) {
  // Перевіряємо чи можна створити воркспейс
  const canCreate = useCanCreateWorkspace();
  const addWorkspace = useWorkspaceStore((state) => state.addWorkspace);

  const [state, formAction] = useActionState(createWorkspaceAction, {
    workspace: null,
    error: null,
  });

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }

    if (state.workspace) {
      // Додаємо в store
      addWorkspace(state.workspace);

      toast.success(`Воркспейс "${state.workspace.name}" створено!`);
      onSuccessAction();
    }
  }, [state, onSuccessAction, addWorkspace]);

  // Якщо досягнуто ліміт - показуємо попередження
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

  return (
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

      {state.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
