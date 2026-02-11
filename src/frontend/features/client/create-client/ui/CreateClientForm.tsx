"use client";

import { createClientAction } from "@/frontend/features/client/create-client/actions/create-client.action";
import { CreateClient } from "@/frontend/entities/client/model/types";
import { ClientForm } from "@/frontend/features/client/shared/ui/ClientForm";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/frontend/shared/stores/workspace-store";

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
  const currentWorkspaceSlug = useWorkspaceStore(
    (state) => state.currentWorkspaceSlug,
  );

  const handleSubmit = async (data: CreateClient) => {
    const result = await createClientAction(data, currentWorkspaceSlug || "");

    if (result.success) {
      toast.success("Клієнта успішно створено");
      onSuccess?.();
    }
    
    return result;
  };

  return (
    <ClientForm
      workspaceId={workspaceId}
      mode="create"
      onSubmit={handleSubmit}
      onSuccess={onSuccess}
      className={className}
    />
  );
}