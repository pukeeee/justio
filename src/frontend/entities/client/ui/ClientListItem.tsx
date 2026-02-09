"use client";

import { Client } from "../model/types";
import { Avatar, AvatarFallback } from "@/frontend/shared/components/ui/avatar";
import { TableCell, TableRow } from "@/frontend/shared/components/ui/table";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { cn } from "@/frontend/shared/lib/utils";
import { ClientActions } from "./ClientActions";

interface ClientListItemProps {
  client: Client;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  className?: string;
}

/**
 * @description Рядок таблиці для відображення контакту на десктопі.
 * Використовує стандартні компоненти Table для консистентності.
 */
export function ClientListItem({
  client,
  onEdit,
  onDelete,
  className,
}: ClientListItemProps) {
  const isIndividual = client.clientType === "individual";

  const displayName = isIndividual
    ? `${client.firstName} ${client.lastName}`
    : client.companyName;

  const initials = isIndividual
    ? `${client.firstName?.[0] || ""}${client.lastName?.[0] || ""}`.toUpperCase()
    : (client.companyName?.[0] || "").toUpperCase();

  return (
    <TableRow className={cn("group transition-colors", className)}>
      <TableCell className="py-3 px-4">
        <Link
          href={`/dashboard/clients/${client.id}`}
          className="flex items-center gap-3 outline-none"
        >
          <Avatar className="h-9 w-9 border">
            <AvatarFallback
              className={
                isIndividual
                  ? "bg-blue-50 text-blue-600"
                  : "bg-orange-50 text-orange-600"
              }
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
              {displayName}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              {isIndividual
                ? `Фізична особа${client.isFop ? " (ФОП)" : ""}`
                : "Юридична особа"}
            </span>
          </div>
        </Link>
      </TableCell>

      <TableCell className="py-3 px-4">
        {client.phone ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <a href={`tel:${client.phone}`} className="hover:text-foreground">
              {client.phone}
            </a>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>

      <TableCell className="py-3 px-4">
        {client.email ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <a
              href={`mailto:${client.email}`}
              className="hover:text-foreground truncate max-w-50"
            >
              {client.email}
            </a>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>

      <TableCell className="py-3 px-4">
        {isIndividual ? (
          client.taxNumber ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{client.taxNumber}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                РНОКПП
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )
        ) : client.taxId ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{client.taxId}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              ЄДРПОУ
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>

      <TableCell className="py-3 px-4 text-right">
        <ClientActions
          client={client}
          onEdit={onEdit}
          onDelete={onDelete}
          triggerClassName="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </TableCell>
    </TableRow>
  );
}
