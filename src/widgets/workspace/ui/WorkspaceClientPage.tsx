/**
 * @file WorkspaceClientPage.tsx
 * @description Клієнтська сторінка управління воркспейсами
 *
 * ВИПРАВЛЕННЯ:
 * - Використовує Zustand store замість prop drilling
 * - Автоматично оновлюється при змінах store
 * - Skeleton state поки дані завантажуються
 */

"use client";

import { useState } from "react";
import { CreateWorkspaceForm } from "@/features/workspace/ui/CreateWorkspaceForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { WorkspaceCard } from "@/entities/workspace/ui/WorkspaceCard";
import { CreateWorkspaceCard } from "@/features/workspace/ui/CreateWorkspaceButton";
import {
  useWorkspaces,
  useWorkspacesInitialized,
} from "@/shared/stores/workspace-store";
import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Skeleton для карток воркспейсів
 * Показується поки store завантажується
 */
function WorkspaceCardSkeleton() {
  return (
    <div className="rounded-lg border-2 border-dashed border-muted p-6">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
        </div>
      </div>
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}

/**
 * Компонент сторінки управління воркспейсами
 *
 * ФУНКЦІОНАЛ:
 * 1. Відображає список всіх воркспейсів користувача
 * 2. Дозволяє створювати нові воркспейси
 * 3. Автоматично оновлюється при змінах
 *
 * СТАН:
 * - workspaces: з Zustand store
 * - initialized: з Zustand store
 * - isDialogOpen: локальний стан для модалки
 */
export function WorkspaceClientPage() {
  /**
   * Локальний стан модального вікна
   */
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /**
   * Отримуємо дані з Zustand store
   *
   * ВАЖЛИВО:
   * - НЕ використовуємо props (initialWorkspaces)
   * - Store - єдине джерело правди
   * - Автоматичне оновлення при змінах
   */
  const workspaces = useWorkspaces();
  const initialized = useWorkspacesInitialized();

  /**
   * Обробник успішного створення воркспейсу
   *
   * ЛОГІКА:
   * - Закриває модалку
   * - Store вже оновлений через createWorkspaceAction
   * - Компонент автоматично ре-рендериться
   */
  const handleSuccessAction = () => {
    setIsDialogOpen(false);
  };

  /**
   * СТАН ЗАВАНТАЖЕННЯ:
   * Показуємо skeleton поки store не ініціалізований
   * Це запобігає миготінню пустого списку
   */
  if (!initialized) {
    return (
      <div className="container max-w-6xl py-10">
        <div className="space-y-8">
          {/* Заголовок з skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Сітка з skeleton картками */}
          <div className="mx-auto max-w-4xl pt-1">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <WorkspaceCardSkeleton />
              <WorkspaceCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * ОСНОВНИЙ РЕНДЕР:
   * Відображаємо список воркспейсів та кнопку створення
   */
  return (
    <>
      {/* Модальне вікно створення воркспейсу */}
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

      {/* Основний контент */}
      <div className="container max-w-6xl py-8">
        <div className="space-y-8">
          {/* Заголовок сторінки */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ваші воркспейси
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Оберіть воркспейс для роботи або створіть новий
            </p>
          </div>

          {/* Контейнер з обмеженням ширини */}
          <div className="mx-auto max-w-4xl">
            {/*
              Адаптивна сітка:
              - 1 колонка на mobile
              - 2 колонки на tablet
              - 3 колонки на desktop
            */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Картки існуючих воркспейсів */}
              {workspaces.map((workspace) => (
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}

              {/* Картка створення нового воркспейсу */}
              <CreateWorkspaceCard
                onClickAction={() => setIsDialogOpen(true)}
              />
            </div>
          </div>

          {/* Пустий стан якщо немає воркспейсів */}
          {workspaces.length === 0 && (
            <div className="mx-auto max-w-md text-center py-12">
              <h2 className="text-lg font-semibold mb-2">
                Створіть свій перший воркспейс
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Воркспейс - це робочий простір для вашої команди. Він містить
                всі клієнти, угоди та завдання.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
