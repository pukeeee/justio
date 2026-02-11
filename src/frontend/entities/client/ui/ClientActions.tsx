"use client";

import { Client } from "../model/types";
import { Button } from "@/frontend/shared/components/ui/button";
import { cn } from "@/frontend/shared/lib/utils";
import { MoreVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend/shared/components/ui/dropdown-menu";

interface ClientActionsProps {
  client: Client;
  onEdit?: (client: Client) => void;
  /** @deprecated Використовуйте deleteAction слот */
  onDelete?: (client: Client) => void;
  deleteAction?: React.ReactNode;
  triggerClassName?: string;
  icon?: "vertical" | "horizontal";
}

/**
 * @description Спільний компонент дій для клієнта (редагування, видалення).
 * Використовується в картках та списках для консистентності інтерфейсу.
 */
export function ClientActions({
  client,
  onEdit,
  onDelete,
  deleteAction,
  triggerClassName,
  icon = "vertical",
}: ClientActionsProps) {
  const Icon = icon === "vertical" ? MoreVertical : MoreHorizontal;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("cursor-pointer", triggerClassName)}
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">Дії</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem 
          onClick={() => onEdit?.(client)}
          className="cursor-pointer"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Редагувати
        </DropdownMenuItem>
        
        {deleteAction ? (
          deleteAction
        ) : onDelete ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(client)}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Видалити
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
