"use client";

import { useActionState, useEffect } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/frontend/shared/components/ui/button";
import { deleteWorkspaceAction, FormState } from "@/frontend/features/workspace/actions/delete-workspace.action";
import { useWorkspaceStore } from "@/frontend/shared/stores/workspace-store";
import { toast } from "sonner";

interface DeleteWorkspaceButtonProps {
  workspaceId: string;
}

const initialState: FormState = {
  isSuccess: false,
  isError: false,
  message: "",
};

export function DeleteWorkspaceButton({ workspaceId }: DeleteWorkspaceButtonProps) {
  const removeWorkspace = useWorkspaceStore((state) => state.removeWorkspace);
  
  // Прив'язуємо ID до екшену
  const deleteActionWithId = deleteWorkspaceAction.bind(null, workspaceId);
  
  // Використовуємо useActionState для обробки результату екшену
  const [state, formAction, isPending] = useActionState(
    deleteActionWithId,
    initialState
  );

  // Слідкуємо за успіхом або помилкою
  useEffect(() => {
    if (state.isError) {
      toast.error(state.message);
    }
    // Success обробляти не потрібно, бо відбудеться redirect
    // Але якщо ми хочемо оновити стор ПЕРЕД редіректом (щоб не було миготіння):
    // Примітка: redirect() перериває виконання на сервері, 
    // тому успішний стан на клієнті ми побачимо лише якщо redirect не спрацює
  }, [state]);

  const handleDelete = async (formData: FormData) => {
    // Оптимістично видаляємо зі стора (або чекаємо результату)
    // В даному випадку краще видалити зі стора відразу, щоб при переході
    // на сторінку списку воркспейсів його вже там не було.
    removeWorkspace(workspaceId);
    formAction(formData);
  };

  return (
    <form action={handleDelete}>
      <Button 
        variant="destructive" 
        className="gap-2" 
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Видалити воркспейс
      </Button>
    </form>
  );
}
