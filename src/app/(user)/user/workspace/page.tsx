/**
 * @file page.tsx (/user/workspace)
 * @description Серверна сторінка управління воркспейсами
 *
 * АРХІТЕКТУРА:
 * - Server Component (за замовчуванням)
 * - Мінімальна логіка (тільки Suspense boundary)
 * - Дані завантажуються в RootLayout та зберігаються в store
 */

import { WorkspaceClientPage } from "@/widgets/workspace/ui/WorkspaceClientPage";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

/**
 * Loading fallback для Suspense
 *
 * ВИКОРИСТАННЯ:
 * - Показується поки WorkspaceClientPage завантажується
 * - Покращує UX під час initial render
 */
function WorkspacePageSkeleton() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Завантаження воркспейсів...
        </p>
      </div>
    </div>
  );
}

/**
 * Сторінка управління воркспейсами
 *
 * СПРОЩЕННЯ:
 * - Видалено getWorkspaces() - дані вже є в store
 * - Видалено передачу initialWorkspaces
 * - Store ініціалізується в RootLayout
 *
 * ПЕРЕВАГИ:
 * 1. Немає дублювання запитів
 * 2. Менше коду
 * 3. Single Source of Truth (store)
 * 4. Автоматичне оновлення при змінах
 *
 * ВАЖЛИВО:
 * - Suspense все ще потрібний для правильної hydration
 * - Fallback показується тільки при initial load
 * - Після hydration компонент працює миттєво
 */
export default function WorkspacePage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <WorkspaceClientPage />
    </Suspense>
  );
}
