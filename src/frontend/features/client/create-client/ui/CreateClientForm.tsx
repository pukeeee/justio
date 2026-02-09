"use client";

import { createClientAction } from "@/frontend/features/client/create-client/actions/create-client.action";
import { CreateClient } from "@/frontend/entities/client/model/types";
import { ClientForm } from "@/frontend/features/client/shared/ui/ClientForm";
import { toast } from "sonner";

interface CreateClientFormProps {
  workspaceId: string;
  onSuccess?: () => void;
  className?: string;
}

export function CreateClientForm({
  workspaceId,
  onSuccess,
  className,
}: CreateClientFormProps) {
  const handleSubmit = async (data: CreateClient) => {
    const result = await createClientAction(data);

    if (result.success) {
      toast.success("Клієнта успішно створено");
      onSuccess?.();
    } else {
      toast.error(result.error || "Не вдалося створити клієнта");
      // Кидаємо помилку, щоб форма не очистилася і показала стан помилки (якщо потрібно)
      // Але в даному випадку ми просто показуємо тост
    }
  };

  return (
    <ClientForm
      workspaceId={workspaceId}
      mode="create"
      onSubmit={handleSubmit}
      className={className}
    />
  );
}