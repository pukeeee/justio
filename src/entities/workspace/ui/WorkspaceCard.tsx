"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { Database } from "@/shared/lib/types/database";
import { Building2 } from "lucide-react";

// Локально визначаємо тип Workspace як підмножину полів з авто-згенерованого типу бази даних.
// Це гарантує консистентність з БД і не вимагає створення окремих файлів типів.
type Workspace = Pick<
  Database["public"]["Tables"]["workspaces"]["Row"],
  "id" | "name" | "slug"
>;

/**
 * @description Пропси для компонента `WorkspaceCard`.
 * @property {Workspace} workspace - Об'єкт воркспейсу, дані якого потрібно відобразити.
 */
type WorkspaceCardProps = {
  workspace: Workspace;
};

/**
 * Компонент картки для відображення одного воркспейсу в списку.
 * Є "тупим" (dumb) компонентом, що відповідає виключно за візуалізацію переданих даних.
 *
 * @param {WorkspaceCardProps} props - Пропси з даними воркспейсу.
 */
export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Card className="group relative flex h-full flex-col transition-all border-2 border-transparent hover:shadow-lg hover:border-primary/80">
      {/* Посилання, що покриває всю картку для клікабельності */}
      <Link
        href={`/dashboard/${workspace.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`Перейти до воркспейсу ${workspace.name}`}
      />

      {/* Заголовок картки з іконкою та назвою */}
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5">
            {/* Іконка будівлі з lucide-react */}
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            {/* Назва воркспейсу */}
            <CardTitle className="text-xl font-semibold line-clamp-1">
              {workspace.name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      {/* Основний контент картки з коротким описом */}
      <CardContent className="flex-1">
        <div className="rounded-lg bg-muted/50 p-3.5">
          {/*<p className="text-sm text-muted-foreground">
            Перейдіть до дашборда для роботи з клієнтами, угодами та аналітикою
          </p>*/}
        </div>
      </CardContent>
    </Card>
  );
}
