"use client";

import { useState } from "react";
import { Database } from "@/shared/lib/types/database";
import { CreateWorkspaceForm } from "@/features/workspace/ui/CreateWorkspaceForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { PlusCircle } from "lucide-react";
import { WorkspaceList } from "./WorkspaceList";

type Workspace = Pick<
  Database["public"]["Tables"]["workspaces"]["Row"],
  "id" | "name" | "slug"
>;

/**
 * @description Пропси для компонента `WorkspaceClientPage`.
 * @property {Workspace[]} initialWorkspaces - Початковий список воркспейсів, отриманий від серверного компонента.
 */
type WorkspaceClientPageProps = {
  initialWorkspaces: Workspace[];
};

/**
 * Клієнтський компонент-обгортка для сторінки вибору воркспейсів.
 *
 * Відповідає за:
 * 1. Відображення списку воркспейсів (`WorkspaceList`) або стану-заглушки, якщо воркспейсів немає.
 * 2. Управління станом модального вікна для створення нового воркспейсу.
 * 3. Передачу даних та колбеків дочірнім компонентам.
 *
 * @param {WorkspaceClientPageProps} props - Пропси компонента.
 * @returns {JSX.Element}
 */
export function WorkspaceClientPage({
  initialWorkspaces,
}: WorkspaceClientPageProps) {
  // Локальний стан для контролю видимості діалогового вікна створення воркспейсу.
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Джерелом правди для відображення є пропс `initialWorkspaces`,
  // який надходить із серверного компонента. Це спрощує логіку стану.
  const displayWorkspaces = initialWorkspaces;
  const hasWorkspaces = displayWorkspaces.length > 0;

  /**
   * Обробник успішного створення воркспейсу.
   * Єдине завдання цього колбека - закрити діалогове вікно.
   * Оновлення списку воркспейсів відбувається автоматично завдяки `revalidatePath`
   * в `createWorkspaceAction`, що змушує серверний компонент-батько передати новий `initialWorkspaces`.
   */
  const handleSuccessAction = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      {/* Діалогове вікно для створення воркспейсу.
          Його видимість контролюється станом `isDialogOpen`. */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Створити новий воркспейс</DialogTitle>
            <DialogDescription>
              Введіть назву для нового робочого простору
            </DialogDescription>
          </DialogHeader>
          <CreateWorkspaceForm onSuccessAction={handleSuccessAction} />
        </DialogContent>
      </Dialog>

      {/* Основний контент сторінки */}
      <div className="container max-w-6xl py-8">
        {hasWorkspaces ? (
          // --- Стан, коли воркспейси існують ---
          <div className="space-y-6">
            {/* Заголовок сторінки та кнопка "Створити" */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Ваші воркспейси
                </h1>
                <p className="text-muted-foreground mt-2">
                  Оберіть воркспейс для роботи або створіть новий
                </p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)} size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Створити воркспейс
              </Button>
            </div>

            {/* Рендеримо список воркспейсів */}
            <WorkspaceList workspaces={displayWorkspaces} />
          </div>
        ) : (
          // --- Стан-заглушка, коли воркспейсів немає ---
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed bg-muted/30 p-12 text-center max-w-md">
              <div className="rounded-full bg-primary/10 p-4">
                <PlusCircle className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  Створіть свій перший воркспейс
                </h2>
                <p className="text-muted-foreground">
                  Воркспейси допомагають організувати роботу з клієнтами та
                  угодами
                </p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)} size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Створити воркспейс
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
