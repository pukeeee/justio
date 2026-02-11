"use client";

import { useTransition } from "react";
import { Button } from "@/frontend/shared/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteClientAction } from "../actions/delete-client.action";
import { restoreClientAction } from "../../restore-client/actions/restore-client.action";
import { cn } from "@/frontend/shared/lib/utils";

interface DeleteClientButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  clientId: string;
  workspaceSlug: string;
  clientName: string;
  onDelete?: () => void;
  showLabel?: boolean;
}

/**
 * @description Кнопка для м'якого видалення клієнта (переміщення в кошик).
 * Після видалення показує тост із можливістю скасувати дію.
 */
export function DeleteClientButton({
  clientId,
  workspaceSlug,
  clientName,
  onDelete,
  showLabel = false,
  className,
  variant = "ghost",
  size = "icon-sm",
  ...props
}: DeleteClientButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      // Викликаємо колбек для оптимістичного оновлення
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
    <Button
      variant={variant}
      size={size}
      onClick={handleDelete}
      disabled={isPending || props.disabled}
      title="Видалити"
      className={cn(className)}
      {...props}
    >
      <Trash2 className={cn("h-4 w-4 text-destructive", showLabel && "mr-2")} />
      {showLabel && "Видалити"}
    </Button>
  );
}
