"use client";

import { useTransition } from "react";
import { DropdownMenuItem } from "@/frontend/shared/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteClientAction } from "../actions/delete-client.action";
import { restoreClientAction } from "../../restore-client/actions/restore-client.action";
import { cn } from "@/frontend/shared/lib/utils";
import { DropdownMenuSeparator } from "@/frontend/shared/components/ui/dropdown-menu";

interface DeleteClientMenuItemProps {
  clientId: string;
  workspaceSlug: string;
  clientName: string;
  onDelete?: () => void;
  className?: string;
  showSeparator?: boolean;
}

/**
 * @description Елемент випадаючого меню для видалення клієнта.
 * Використовується в ClientActions для інкапсуляції логіки фічі.
 */
export function DeleteClientMenuItem({
  clientId,
  workspaceSlug,
  clientName,
  onDelete,
  className,
  showSeparator = true,
}: DeleteClientMenuItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e: Event) => {
    // Для DropdownMenuItem ми не використовуємо preventDefault на клік, 
    // але нам потрібно обробити дію
    e.preventDefault();

    startTransition(async () => {
      onDelete?.();

      try {
        const result = await deleteClientAction(clientId, workspaceSlug);

        if (result.success) {
          toast(`Клієнта "${clientName}" переміщено в кошик`, {
            action: {
              label: "Скасувати",
              onClick: async () => {
                const restoreResult = await restoreClientAction(
                  clientId,
                  workspaceSlug,
                );
                if (restoreResult.success) {
                  toast.success(`Клієнта "${clientName}" відновлено`);
                } else {
                  toast.error(
                    restoreResult.error || "Не вдалося відновити клієнта",
                  );
                }
              },
            },
          });
        } else {
          toast.error(result.error || "Не вдалося видалити клієнта");
        }
      } catch {
        toast.error("Сталася непередбачувана помилка");
      }
    });
  };

  return (
    <>
      {showSeparator && <DropdownMenuSeparator />}
      <DropdownMenuItem
        onSelect={handleDelete}
        disabled={isPending}
        className={cn(
          "text-destructive focus:text-destructive cursor-pointer",
          className
        )}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Видалити
      </DropdownMenuItem>
    </>
  );
}
