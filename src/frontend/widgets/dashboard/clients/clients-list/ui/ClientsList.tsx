"use client";

import { useState, useMemo, useOptimistic, useTransition } from "react";
import { Client, ClientType } from "@/frontend/entities/client/model/types";
import { ClientListItem } from "@/frontend/entities/client/ui/ClientListItem";
import { ClientCard } from "@/frontend/entities/client/ui/ClientCard";
import { UpdateClientDialog } from "@/frontend/features/client/update-client/ui/UpdateClientDialog";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/shared/components/ui/table";
import { Input } from "@/frontend/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/shared/components/ui/select";
import { Search, FilterX } from "lucide-react";
import { Button } from "@/frontend/shared/components/ui/button";
import { toast } from "sonner";
import { deleteClientAction } from "@/frontend/features/client/delete-client/actions/delete-client.action";
import { restoreClientAction } from "@/frontend/features/client/restore-client/actions/restore-client.action";

interface ClientListProps {
  clients: Client[];
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
}

type FilterValue = ClientType | "all";

/**
 * @description Адаптивний віджет списку контактів.
 * Автоматично перемикається між таблицею (десктоп) та картками (мобайл).
 * Включає в себе функціонал редагування клієнтів через UpdateClientDialog.
 */
export function ClientsList({ clients, onEdit, onDelete }: ClientListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterValue>("all");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [, startTransition] = useTransition();

  // Оптимістичне оновлення списку
  const [optimisticClients, addOptimisticDelete] = useOptimistic(
    clients,
    (state, clientId: string) => state.filter((c) => c.id !== clientId),
  );

  // Логіка фільтрації (використовуємо optimisticClients замість clients)
  const filteredClients = useMemo(() => {
    return optimisticClients.filter((client) => {
      const isIndividual = client.clientType === "individual";
      const name = isIndividual
        ? `${client.firstName} ${client.lastName}`
        : client.companyName;

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone?.includes(searchQuery);

      const matchesType =
        typeFilter === "all" || client.clientType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [optimisticClients, searchQuery, typeFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    onEdit?.(client);
  };

  const handleDelete = (client: Client) => {
    const clientId = client.id;
    const workspaceId = client.workspaceId;

    if (!clientId) return;

    const clientName =
      client.clientType === "individual"
        ? `${client.firstName} ${client.lastName}`
        : client.companyName;

    startTransition(async () => {
      // Миттєво прибираємо зі списку
      addOptimisticDelete(clientId);

      try {
        const result = await deleteClientAction(clientId, workspaceId);

        if (result.success) {
          toast(`Клієнта "${clientName}" переміщено в кошик`, {
            action: {
              label: "Скасувати",
              onClick: async () => {
                const restoreResult = await restoreClientAction(
                  clientId,
                  workspaceId,
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
          onDelete?.(client);
        } else {
          toast.error(result.error || "Не вдалося видалити клієнта");
        }
      } catch {
        toast.error("Сталася непередбачувана помилка");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Панель інструментів (Пошук та Фільтри) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Пошук за іменем, email або телефоном..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as FilterValue)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Тип контакту" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Усі типи</SelectItem>
              <SelectItem value="individual">Фіз. особи</SelectItem>
              <SelectItem value="company">Юр. особи</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || typeFilter !== "all") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={resetFilters}
              title="Скинути фільтри"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Список контактів */}
      {filteredClients.length > 0 ? (
        <>
          {/* Десктопна таблиця (видима від md) */}
          <div className="hidden md:block border rounded-lg bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Клієнт</TableHead>
                  <TableHead className="px-4">Телефон</TableHead>
                  <TableHead className="px-4">Email</TableHead>
                  <TableHead className="px-4">РНОКПП / ЄДРПОУ</TableHead>
                  <TableHead className="w-12.5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <ClientListItem
                    key={client.id}
                    client={client}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Мобільна сітка карток (видима до md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="py-20 text-center border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">Клієнтів не знайдено</p>
          {(searchQuery || typeFilter !== "all") && (
            <Button variant="link" onClick={resetFilters} className="mt-2">
              Скинути фільтри
            </Button>
          )}
        </div>
      )}

      {/* Діалог редагування */}
      {editingClient && (
        <UpdateClientDialog
          key={editingClient.id}
          open={!!editingClient}
          onOpenChange={(open) => !open && setEditingClient(null)}
          clientId={editingClient.id}
          workspaceId={editingClient.workspaceId}
          onSuccess={() => {
            // Тут можна додати логіку після успішного оновлення
          }}
        />
      )}
    </div>
  );
}
