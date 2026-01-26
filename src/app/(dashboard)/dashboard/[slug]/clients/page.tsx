/**
 * @file page.tsx (/dashboard/[slug]/clients)
 * @description Сторінка управління клієнтами та компаніями
 */

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

/**
 * Loading fallback
 */
function ClientsPageSkeleton() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Завантаження клієнтів...
        </p>
      </div>
    </div>
  );
}

/**
 * Сторінка клієнтів
 * 
 * TODO: Реалізувати функціонал:
 * - Список клієнтів (фізичні особи)
 * - Список компаній (юридичні особи)
 * - Фільтрація та пошук
 * - Створення нових записів
 * - Детальні картки клієнтів
 */
export default function ClientsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<ClientsPageSkeleton />}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-2xl font-bold mb-2">Клієнти</h2>
            <p className="text-muted-foreground">
              База клієнтів (фізичні та юридичні особи)
            </p>
            <div className="mt-4 p-8 border rounded-lg bg-muted/50">
              <p className="text-center text-sm text-muted-foreground">
                Функціонал в розробці
              </p>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
