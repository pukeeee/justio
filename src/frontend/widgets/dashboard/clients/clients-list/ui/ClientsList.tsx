"use client";

import { useState, useMemo } from "react";
import { Client, ClientType } from "@/frontend/entities/client/model/types";
import { ClientListItem } from "@/frontend/entities/client/ui/ClientListItem";
import { ClientCard } from "@/frontend/entities/client/ui/ClientCard";
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

interface ClientListProps {
  clients: Client[];
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
}

type FilterValue = ClientType | "all";

/**
 * @description Адаптивний віджет списку контактів.
 * Автоматично перемикається між таблицею (десктоп) та картками (мобайл).
 */
export function ClientsList({ clients, onEdit, onDelete }: ClientListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterValue>("all");

  // Логіка фільтрації
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
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
  }, [clients, searchQuery, typeFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
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
                    onEdit={onEdit}
                    onDelete={onDelete}
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
                onEdit={onEdit}
                onDelete={onDelete}
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
    </div>
  );
}
