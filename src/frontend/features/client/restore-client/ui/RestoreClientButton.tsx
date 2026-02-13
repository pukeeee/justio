"use client";

import { useTransition } from "react";
import { Button } from "@/frontend/shared/components/ui/button";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { restoreClientAction } from "../actions/restore-client.action";
import { cn } from "@/frontend/shared/lib/utils";

interface RestoreClientButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  clientId: string;
  workspaceId: string;
  workspaceSlug: string;
  clientName: string;
  onRestore?: () => void;
  showLabel?: boolean;
}

/**
 * @description Кнопка для відновлення клієнта з кошика.
 * Інкапсулює в собі виклик Server Action та обробку тостів.
 */
export function RestoreClientButton({
  clientId,
  workspaceId,
  workspaceSlug,
  clientName,
  onRestore,
  showLabel = false,
  className,
  variant = "ghost",
  size = "icon-sm",
  ...props
}: RestoreClientButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleRestore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      onRestore?.();

      try {
        const result = await restoreClientAction(clientId, workspaceId, workspaceSlug);

        if (result.success) {
          toast.success(`Клієнта "${clientName}" відновлено`);
        } else {
          toast.error(result.error?.message || "Не вдалося відновити клієнта");
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
      onClick={handleRestore}
      disabled={isPending || props.disabled}
      title="Відновити"
      className={cn(className)}
      {...props}
    >
      <RotateCcw className={cn("h-4 w-4 text-primary", showLabel && "mr-2")} />
      {showLabel && "Відновити"}
    </Button>
  );
}
