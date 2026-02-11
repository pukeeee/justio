"use client";

import { useState } from "react";
import { Client } from "@/frontend/entities/client/model/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/shared/components/ui/table";
import { Search } from "lucide-react";
import { Input } from "@/frontend/shared/components/ui/input";
import { RestoreClientButton } from "@/frontend/features/client/restore-client/ui/RestoreClientButton";
import { HardDeleteClientButton } from "@/frontend/features/client/delete-client/ui/HardDeleteClientButton";
import { useWorkspaceStore } from "@/frontend/shared/stores/workspace-store";
import { useOptimisticClients } from "@/frontend/features/client/shared/hooks/use-optimistic-clients";
import { getClientDisplayName } from "@/frontend/entities/client/lib/client-utils";

interface DeletedClientsListProps {
  initialClients: Client[];
  workspaceId: string;
}

export function DeletedClientsList({
  initialClients,
}: DeletedClientsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const currentWorkspaceSlug = useWorkspaceStore(
    (state) => state.currentWorkspaceSlug,
  );

  const { filteredClients, removeOptimistic } = useOptimisticClients({
    initialClients,
    searchQuery,
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук у кошику..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Клієнт</TableHead>
              <TableHead className="px-4">Тип</TableHead>
              <TableHead className="px-4">Email</TableHead>
              <TableHead className="w-37.5 text-right px-4">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="px-4 font-medium">
                    {getClientDisplayName(client)}
                  </TableCell>
                  <TableCell className="px-4 text-muted-foreground">
                    {client.clientType === "individual"
                      ? "Фіз. особа"
                      : "Компанія"}
                  </TableCell>
                  <TableCell className="px-4">{client.email || "—"}</TableCell>
                  <TableCell className="px-4 text-right space-x-2">
                    <RestoreClientButton
                      clientId={client.id!}
                      workspaceSlug={currentWorkspaceSlug || ""}
                      clientName={getClientDisplayName(client)}
                      onRestore={() => removeOptimistic(client.id!)}
                    />
                    <HardDeleteClientButton
                      clientId={client.id!}
                      workspaceSlug={currentWorkspaceSlug || ""}
                      clientName={getClientDisplayName(client)}
                      onDelete={() => removeOptimistic(client.id!)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  Кошик порожній
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
