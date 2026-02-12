import { Client } from "../model/types";
import { Card, CardContent } from "@/frontend/shared/components/ui/card";
import { Avatar, AvatarFallback } from "@/frontend/shared/components/ui/avatar";
import { Badge } from "@/frontend/shared/components/ui/badge";
import { Phone, Mail } from "lucide-react";
import { ClientActions } from "./ClientActions";

interface ClientCardProps {
  client: Client;
  onEdit?: (client: Client) => void;
  deleteAction?: React.ReactNode;
}

/**
 * @description Компонент картки контакту для мобільного вигляду та списків.
 * Адаптований під різні типи контактів (фіз. особа / компанія).
 * Використовує готові дані displayName з бекенда.
 */
export function ClientCard({ client, onEdit, deleteAction }: ClientCardProps) {
  const isIndividual = client.clientType === "individual";

  // Формуємо ініціали для аватара з готового імені
  const initials = (client.displayName?.[0] || "К").toUpperCase();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border">
              <AvatarFallback
                className={
                  isIndividual
                    ? "bg-blue-100 text-blue-700"
                    : "bg-orange-100 text-orange-700"
                }
              >
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <h3 className="font-semibold leading-none text-foreground">
                {client.displayName}
              </h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-[10px] uppercase font-bold py-0 h-5"
                >
                  {isIndividual
                    ? `Фіз. особа${client.isFop ? " (ФОП)" : ""}`
                    : "Компанія"}
                </Badge>
              </div>
            </div>
          </div>

          <ClientActions
            client={client}
            onEdit={onEdit}
            deleteAction={deleteAction}
            icon="horizontal"
            triggerClassName="h-8 w-8"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          {client.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <a
                href={`tel:${client.phone}`}
                className="hover:text-primary transition-colors"
              >
                {client.phone}
              </a>
            </div>
          )}
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <a
                href={`mailto:${client.email}`}
                className="hover:text-primary transition-colors"
              >
                {client.email}
              </a>
            </div>
          )}
          {/* РНОКПП / ЄДРПОУ */}
          {client.clientType === "individual" && client.taxNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold">РНОКПП:</span>
              <span>{client.taxNumber}</span>
            </div>
          )}
          {client.clientType === "company" && client.taxId && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold">ЄДРПОУ:</span>
              <span>{client.taxId}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
