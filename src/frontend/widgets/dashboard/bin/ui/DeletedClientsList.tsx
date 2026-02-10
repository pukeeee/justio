"use client";

import { useState, useMemo, useOptimistic, useTransition } from "react";
import { Client } from "@/frontend/entities/client/model/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/shared/components/ui/table";
import { Button } from "@/frontend/shared/components/ui/button";
import { RotateCcw, Trash2, Search, AlertTriangle } from "lucide-react";
import { Input } from "@/frontend/shared/components/ui/input";
import { toast } from "sonner";
import { restoreClientAction } from "@/frontend/features/client/restore-client/actions/restore-client.action";
import { hardDeleteClientAction } from "@/frontend/features/client/delete-client/actions/hard-delete-client.action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/shared/components/ui/dialog";

interface DeletedClientsListProps {
  initialClients: Client[];
  workspaceId: string;
}

export function DeletedClientsList({
  initialClients,
  workspaceId,
}: DeletedClientsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteClient, setConfirmDeleteClient] = useState<Client | null>(
    null,
  );
  const [, startTransition] = useTransition();

  const [optimisticClients, removeOptimistic] = useOptimistic(
    initialClients,
    (state, clientId: string) => state.filter((c) => c.id !== clientId),
  );

  const filteredClients = useMemo(() => {
    return optimisticClients.filter((client) => {
      const name =
        client.clientType === "individual"
          ? `${client.firstName} ${client.lastName}`
          : client.companyName;

      return (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [optimisticClients, searchQuery]);

  const handleRestore = (client: Client) => {
    if (!client.id) return;

    startTransition(async () => {
      removeOptimistic(client.id!);
      const result = await restoreClientAction(client.id!, workspaceId);
      if (result.success) {
        toast.success("Клієнта відновлено");
      } else {
        toast.error(result.error || "Не вдалося відновити клієнта");
      }
    });
  };

  const handleHardDelete = () => {
    if (!confirmDeleteClient?.id) return;

    const clientId = confirmDeleteClient.id;

    startTransition(async () => {
      removeOptimistic(clientId);
      setConfirmDeleteClient(null);

      const result = await hardDeleteClientAction(clientId, workspaceId);
      if (result.success) {
        toast.success("Клієнта видалено назавжди");
      } else {
        toast.error(result.error || "Не вдалося видалити клієнта");
      }
    });
  };

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
                    {client.clientType === "individual"
                      ? `${client.firstName} ${client.lastName}`
                      : client.companyName}
                  </TableCell>
                  <TableCell className="px-4 text-muted-foreground">
                    {client.clientType === "individual"
                      ? "Фіз. особа"
                      : "Компанія"}
                  </TableCell>
                  <TableCell className="px-4">{client.email || "—"}</TableCell>
                  <TableCell className="px-4 text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRestore(client)}
                      title="Відновити"
                    >
                      <RotateCcw className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setConfirmDeleteClient(client)}
                      title="Видалити назавжди"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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

      {/* Діалог підтвердження остаточного видалення */}
      <Dialog
        open={!!confirmDeleteClient}
        onOpenChange={(open) => !open && setConfirmDeleteClient(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Остаточне видалення
            </DialogTitle>
            <DialogDescription>
              Ви впевнені, що хочете видалити клієнта{" "}
              <strong>
                {confirmDeleteClient?.clientType === "individual"
                  ? `${confirmDeleteClient.firstName} ${confirmDeleteClient.lastName}`
                  : confirmDeleteClient?.companyName}
              </strong>{" "}
              назавжди? Цю дію неможливо скасувати.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteClient(null)}
            >
              Скасувати
            </Button>
            <Button variant="destructive" onClick={handleHardDelete}>
              Видалити назавжди
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
