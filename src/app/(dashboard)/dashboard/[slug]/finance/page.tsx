import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function FinancePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin" /></div>}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-2xl font-bold mb-2">Фінанси</h2>
          <p className="text-muted-foreground">Рахунки, платежі, гонорари</p>
          <div className="mt-4 p-8 border rounded-lg bg-muted/50">
            <p className="text-center text-sm text-muted-foreground">
              В розробці
            </p>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
