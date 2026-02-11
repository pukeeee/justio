"use client";

import { useState, useTransition } from "react";
import { Button } from "@/frontend/shared/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { hardDeleteClientAction } from "../actions/hard-delete-client.action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/shared/components/ui/dialog";
import { cn } from "@/frontend/shared/lib/utils";

interface HardDeleteClientButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  clientId: string;
  workspaceSlug: string;
  clientName: string;
  onDelete?: () => void;
  showLabel?: boolean;
}

/**
 * @description Кнопка для остаточного видалення клієнта з кошика.
 * Містить у собі діалог підтвердження.
 */
export function HardDeleteClientButton({
  clientId,
  workspaceSlug,
  clientName,
  onDelete,
  showLabel = false,
  className,
  variant = "ghost",
  size = "icon-sm",
  ...props
}: HardDeleteClientButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleHardDelete = () => {
    startTransition(async () => {
      onDelete?.();
      setIsOpen(false);

      try {
        const result = await hardDeleteClientAction(clientId, workspaceSlug);
        if (result.success) {
          toast.success(`Клієнта "${clientName}" видалено назавжди`);
        } else {
          toast.error(result.error || "Не вдалося видалити клієнта");
        }
      } catch {
        toast.error("Сталася непередбачувана помилка");
      }
    });
  };

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpenDialog}
        disabled={isPending || props.disabled}
        title="Видалити назавжди"
        className={cn(className)}
        {...props}
      >
        <Trash2 className={cn("h-4 w-4 text-destructive", showLabel && "mr-2")} />
        {showLabel && "Видалити назавжди"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Остаточне видалення
            </DialogTitle>
            <DialogDescription>
              Ви впевнені, що хочете видалити клієнта <strong>{clientName}</strong> назавжди? 
              Цю дію неможливо скасувати.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Скасувати
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleHardDelete}
              disabled={isPending}
            >
              Видалити назавжди
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
