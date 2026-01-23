"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import type { Database } from "@/shared/lib/types/database";
import { ArrowRight, Building2 } from "lucide-react";

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
 * @returns {JSX.Element}
 */
export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Card className="group flex flex-col transition-all hover:shadow-lg hover:border-primary/50">
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
          <p className="text-sm text-muted-foreground">
            Перейдіть до дашборда для роботи з клієнтами, угодами та аналітикою
          </p>
        </div>
      </CardContent>

      {/* Футер картки з кнопкою-посиланням */}
      <CardFooter className="border-t bg-muted/30 p-4">
        <Button
          asChild // Дозволяє кнопці рендеритись як дочірній Link, зберігаючи стилі
          className="w-full group-hover:bg-primary/90"
          size="default"
        >
          {/* Посилання на дашборд відповідного воркспейсу */}
          <Link href={`/dashboard/${workspace.slug}`}>
            Відкрити дашборд
            {/* Іконка стрілки з анімацією при наведенні на картку */}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
