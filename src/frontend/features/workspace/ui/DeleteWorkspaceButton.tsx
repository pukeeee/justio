"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/frontend/shared/components/ui/button";
import { deleteWorkspaceAction } from "@/frontend/features/workspace/actions/delete-workspace.action";
import { useWorkspaceStore } from "@/frontend/shared/stores/workspace-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/frontend/shared/components/ui/alert-dialog";

interface DeleteWorkspaceButtonProps {
  workspaceId: string;
}

export function DeleteWorkspaceButton({ workspaceId }: DeleteWorkspaceButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const removeWorkspace = useWorkspaceStore((state) => state.removeWorkspace);
  const router = useRouter();

  const handleDelete = async () => {
    setIsPending(true);
    try {
      const result = await deleteWorkspaceAction({ id: workspaceId });

      if (result.success) {
        // Видаляємо зі стора
        removeWorkspace(workspaceId);
        toast.success("Робочий простір переміщено в кошик");
        
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
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
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Видалити робочий простір?</AlertDialogTitle>
          <AlertDialogDescription>
            Це перемістить робочий простір у кошик. Ви зможете відновити його пізніше або видалити назавжди.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Скасувати</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Видалити"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
