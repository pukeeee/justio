/**
 * @file CreateWorkspaceForm.tsx
 * @description Форма створення воркспейсу з використанням react-hook-form та API Layer
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/frontend/shared/components/ui/button";
import { Input } from "@/frontend/shared/components/ui/input";
import { Label } from "@/frontend/shared/components/ui/label";
import { Alert, AlertDescription } from "@/frontend/shared/components/ui/alert";

import { createWorkspaceAction } from "@/frontend/features/workspace/actions/create-workspace.action";
import { CreateWorkspaceRequestSchema, type CreateWorkspaceRequest } from "@/backend/api/contracts/workspace.contracts";
import {
  useWorkspaceStore,
  useCanCreateWorkspace,
} from "@/frontend/shared/stores/workspace-store";

// ============================================================================
// ТИПИ
// ============================================================================

type CreateWorkspaceFormProps = {
  /** Callback після успішного створення */
  onSuccessAction: () => void;
};

// ============================================================================
// ОСНОВНИЙ КОМПОНЕНТ
// ============================================================================

export function CreateWorkspaceForm({
  onSuccessAction,
}: CreateWorkspaceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // ===== ПЕРЕВІРКА КВОТИ =====
  const canCreate = useCanCreateWorkspace();
  const addWorkspace = useWorkspaceStore((state) => state.addWorkspace);

  // ===== FORM SETUP =====
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CreateWorkspaceRequest>({
    resolver: zodResolver(CreateWorkspaceRequestSchema),
    defaultValues: {
      name: "",
    },
  });

  // ===== ОБРОБКА SUBMIT =====
  const onSubmit = async (data: CreateWorkspaceRequest) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await createWorkspaceAction(data);

      if (result.success && result.data) {
        // Додаємо в store для миттєвого оновлення UI
        addWorkspace({
          id: result.data.id,
          name: result.data.name,
          slug: result.data.slug,
        });

        toast.success(`Воркспейс "${result.data.name}" створено!`);
        onSuccessAction();
      } else if (result.error) {
        // Обробка помилок валідації від бекенду
        if (result.error.validationErrors) {
          Object.entries(result.error.validationErrors).forEach(([field, message]) => {
            setError(field as any, { message });
          });
        } else {
          setServerError(result.error.message);
          toast.error(result.error.message);
        }
      }
    } catch (error) {
      console.error("Create workspace error:", error);
      setServerError("Несподівана помилка при створенні воркспейсу");
      toast.error("Несподівана помилка");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== РЕНДЕР =====

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Назва воркспейсу</Label>
        <Input
          id="name"
          placeholder="Моя компанія"
          {...register("name")}
          autoComplete="off"
          autoFocus
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
        <p className="text-xs text-muted-foreground">Від 2 до 100 символів</p>
      </div>

      {serverError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Створення...
          </>
        ) : (
          "Створити воркспейс"
        )}
      </Button>
    </form>
  );
}
