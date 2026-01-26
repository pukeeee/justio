/**
 * @file page.tsx (/dashboard/[slug]/documents)
 * @description Сторінка управління документами
 */

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function DocumentsPageSkeleton() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Завантаження документів...
        </p>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<DocumentsPageSkeleton />}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-2xl font-bold mb-2">Документи</h2>
            <p className="text-muted-foreground">
              Договори, позови, рішення суду, додаткові матеріали
            </p>
            <div className="mt-4 p-8 border rounded-lg bg-muted/50">
              <p className="text-center text-sm text-muted-foreground">
                Система документообігу в розробці
              </p>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
