"use client";

import type { Database } from "@/shared/lib/types/database";
import { WorkspaceCard } from "@/entities/workspace/ui/WorkspaceCard";

// Визначаємо локальний тип `Workspace` як підмножину полів з таблиці `workspaces`.
type Workspace = Pick<
  Database["public"]["Tables"]["workspaces"]["Row"],
  "id" | "name" | "slug"
>;

/**
 * @description Пропси для компонента `WorkspaceList`.
 * @property {Workspace[]} workspaces - Масив об'єктів воркспейсів для відображення.
 */
type WorkspaceListProps = {
  workspaces: Workspace[];
};

/**
 * Компонент для відображення списку воркспейсів у вигляді сітки.
 * Він отримує масив воркспейсів та ітерує по ньому, рендерячи
 * для кожного елемента компонент `WorkspaceCard`.
 *
 * @param {WorkspaceListProps} props - Пропси компонента.
 */
export function WorkspaceList({ workspaces }: WorkspaceListProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </div>
  );
}
