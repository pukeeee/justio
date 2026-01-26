/**
 * @file page.tsx (/dashboard/[slug]/cases)
 * @description Сторінка управління юридичними справами
 */

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function CasesPageSkeleton() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Завантаження справ...</p>
      </div>
    </div>
  );
}

/**
 * Сторінка юридичних справ
 * 
 * TODO: Реалізувати функціонал:
 * - Kanban дошка зі справами
 * - Етапи: Нові → В роботі → Суд → Завершені
 * - Фільтри по типу справи, клієнту, статусу
 * - Календар засідань та дедлайнів
 * - Документи по справі
 * - Історія подій
 */
export default function CasesPage() {
  return (
    <Suspense fallback={<CasesPageSkeleton />}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-2xl font-bold mb-2">Юридичні справи</h2>
            <p className="text-muted-foreground">
              Управління справами, судовими процесами та консультаціями
            </p>
            <div className="mt-4 p-8 border rounded-lg bg-muted/50">
              <p className="text-center text-sm text-muted-foreground">
                Kanban дошка в розробці
              </p>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
