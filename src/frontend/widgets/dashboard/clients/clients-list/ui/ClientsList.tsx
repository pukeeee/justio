"use client";

import { useState } from "react";
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
import { DeleteClientMenuItem } from "@/frontend/features/client/delete-client/ui/DeleteClientMenuItem";
import { useWorkspaceStore } from "@/frontend/shared/stores/workspace-store";
import { useOptimisticClients } from "@/frontend/features/client/shared/hooks/use-optimistic-clients";
import { getClientDisplayName } from "@/frontend/entities/client/lib/client-utils";

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

  const currentWorkspaceSlug = useWorkspaceStore(
    (state) => state.currentWorkspaceSlug,
  );

  const { filteredClients, removeOptimistic } = useOptimisticClients({
    initialClients: clients,
    searchQuery,
    typeFilter,
  });

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    onEdit?.(client);
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
                    deleteAction={
                      <DeleteClientMenuItem
                        clientId={client.id!}
                        workspaceSlug={currentWorkspaceSlug || ""}
                        clientName={getClientDisplayName(client)}
                        onDelete={() => {
                          removeOptimistic(client.id!);
                          onDelete?.(client);
                        }}
                      />
                    }
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
                deleteAction={
                  <DeleteClientMenuItem
                    clientId={client.id!}
                    workspaceSlug={currentWorkspaceSlug || ""}
                    clientName={getClientDisplayName(client)}
                    onDelete={() => {
                      removeOptimistic(client.id!);
                      onDelete?.(client);
                    }}
                  />
                }
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
