"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/frontend/shared/components/ui/button";
import { hardDeleteWorkspaceAction } from "@/frontend/features/workspace/actions/hard-delete-workspace.action";
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

interface HardDeleteWorkspaceButtonProps {
  workspaceId: string;
  workspaceName: string;
}

/**
 * Кнопка для незворотного видалення воркспейсу
 */
export function HardDeleteWorkspaceButton({ 
  workspaceId, 
  workspaceName 
}: HardDeleteWorkspaceButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const removeWorkspace = useWorkspaceStore((state) => state.removeWorkspace);
  const router = useRouter();

  const handleHardDelete = async () => {
    setIsPending(true);
    try {
      const result = await hardDeleteWorkspaceAction({ id: workspaceId });

      if (result.success) {
        removeWorkspace(workspaceId);
        toast.success(`Воркспейс "${workspaceName}" та всі його дані назавжди видалені`);
        router.push("/user/workspace");
      } else {
        toast.error(result.error?.message || "Помилка при повному видаленні");
      }
    } catch (error) {
      console.error("Hard delete error:", error);
      toast.error("Несподівана помилка");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <AlertTriangle className="h-4 w-4" />
          Повне видалення
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Ви впевнені, що хочете видалити все назавжди?
          </AlertDialogTitle>
          <AlertDialogDescription asChild className="space-y-4">
            <div>
              <p>
                Ця дія є <strong>незворотною</strong>. Будуть видалені:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Всі клієнти та їхні дані</li>
                <li>Всі документи та файли</li>
                <li>Історія операцій та налаштування</li>
              </ul>
              <p>
                Щоб підтвердити, введіть назву воркспейсу: <strong>{workspaceName}</strong>
              </p>
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder="Введіть назву для підтвердження"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Скасувати</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleHardDelete();
            }}
            disabled={confirmName !== workspaceName || isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Так, видалити все назавжди"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
