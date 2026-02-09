"use client";

import { Client } from "../model/types";
import { Avatar, AvatarFallback } from "@/frontend/shared/components/ui/avatar";
import { Button } from "@/frontend/shared/components/ui/button";
import { TableCell, TableRow } from "@/frontend/shared/components/ui/table";
import { MoreVertical, Pencil, Trash2, Mail, Phone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend/shared/components/ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/frontend/shared/lib/utils";

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Дії</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit?.(client)}>
              <Pencil className="mr-2 h-4 w-4" />
              Редагувати
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(client)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Видалити
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
