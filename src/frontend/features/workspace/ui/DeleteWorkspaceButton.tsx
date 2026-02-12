"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/frontend/shared/components/ui/button";
import { deleteWorkspaceAction } from "@/frontend/features/workspace/actions/delete-workspace.action";
import { useWorkspaceStore } from "@/frontend/shared/stores/workspace-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteWorkspaceButtonProps {
  workspaceId: string;
}

export function DeleteWorkspaceButton({ workspaceId }: DeleteWorkspaceButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const removeWorkspace = useWorkspaceStore((state) => state.removeWorkspace);
  const router = useRouter();

  const handleDelete = async () => {
    // Підтвердження видалення
    if (!confirm("Ви впевнені, що хочете видалити цей робочий простір? Цю дію неможливо скасувати.")) {
      return;
    }

    setIsPending(true);
    try {
      const result = await deleteWorkspaceAction({ id: workspaceId });

      if (result.success) {
        // Видаляємо зі стора
        removeWorkspace(workspaceId);
        toast.success("Робочий простір успішно видалено");
        
        // Перенаправлення
        router.push("/user/workspace");
      } else {
        toast.error(result.error?.message || "Помилка при видаленні");
      }
    } catch (error) {
      console.error("Delete workspace error:", error);
      toast.error("Несподівана помилка");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      className="gap-2" 
      disabled={isPending}
      onClick={handleDelete}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      Видалити воркспейс
    </Button>
  );
}
