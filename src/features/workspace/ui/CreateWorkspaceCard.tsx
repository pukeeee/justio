"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { PlusCircle } from "lucide-react";

/**
 * @description Пропси для компонента `CreateWorkspaceCard`.
 * @property {() => void} onClickAction - Функція, що викликається при кліку на картку.
 */
type CreateWorkspaceCardProps = {
  onClickAction: () => void;
};

/**
 * Компонент-картка для створення нового воркспейсу.
 * Візуально відрізняється від звичайної картки воркспейсу (пунктирна рамка),
 * спонукаючи користувача до дії.
 *
 * @param {CreateWorkspaceCardProps} props - Пропси компонента.
 */
export function CreateWorkspaceCard({
  onClickAction,
}: CreateWorkspaceCardProps) {
  return (
    <Card
      onClick={onClickAction}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClickAction()}
      role="button"
      tabIndex={0}
      className="group flex h-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 text-muted-foreground transition-all hover:border-primary/80 hover:text-primary"
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <PlusCircle className="h-10 w-10" />
          <span className="text-lg font-semibold">Створити воркспейс</span>
        </div>
      </CardContent>
    </Card>
  );
}
