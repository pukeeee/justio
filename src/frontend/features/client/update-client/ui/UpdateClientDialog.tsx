"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/frontend/shared/components/ui/dialog";
import { ClientForm } from "@/frontend/features/client/shared/ui/ClientForm";
import { UpdateClient } from "@/frontend/entities/client/model/types";
import { getClientDetailsAction } from "../actions/get-client-details.action";
import { updateClientAction } from "../actions/update-client.action";
import { Loader2 } from "lucide-react";

interface UpdateClientDialogProps {
  clientId: string | null | undefined;
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UpdateClientDialog({
  clientId,
  workspaceId,
  open,
  onOpenChange,
  onSuccess,
}: UpdateClientDialogProps) {
  const [defaultValues, setDefaultValues] = useState<Partial<UpdateClient> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  // Завантаження даних при відкритті
  useEffect(() => {
    if (open && clientId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const result = await getClientDetailsAction(clientId);
          if (result.success && result.data) {
            setDefaultValues(result.data);
          } else {
            toast.error(result.error || "Не вдалося завантажити дані клієнта");
            onOpenChange(false);
          }
        } catch (error) {
          console.error("Error loading client details:", error);
          toast.error("Помилка при завантаженні даних");
          onOpenChange(false);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } else if (!open) {
      // Очищення даних при закритті
      setDefaultValues(undefined);
    }
  }, [open, clientId, onOpenChange]);

  const handleSubmit = async (data: any) => {
    // data приходить як CreateClient, але ми знаємо що це update, тому додаємо ID
    // ClientForm повертає CreateClient, тому нам треба додати ID
    if (!clientId) return;

    const updateData: UpdateClient = {
      ...data,
      id: clientId,
    };

    const result = await updateClientAction(updateData);

    if (result.success) {
      toast.success("Клієнта успішно оновлено");
      onOpenChange(false);
      onSuccess?.();
    } else {
      toast.error(result.error || "Не вдалося оновити клієнта");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] sm:h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle>Редагування клієнта</DialogTitle>
          <DialogDescription>
            Змініть дані клієнта. Тип клієнта змінити неможливо.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          defaultValues && (
            <ClientForm
              workspaceId={workspaceId}
              mode="edit"
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              className="flex-1 min-h-0"
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
