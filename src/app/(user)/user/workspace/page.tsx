import { getWorkspaces } from "@/features/workspace/actions/get-workspaces.action";
import { WorkspaceClientPage } from "@/widgets/workspace/ui/WorkspaceClientPage";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

/**
 * Loading fallback для Suspense
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
 * Асинхронний компонент, що завантажує дані.
 * ВИПРАВЛЕНО: Додано кешування для уникнення повторних запитів (через `cache` в `getWorkspaces`).
 */
async function WorkspaceContent() {
  // ВАЖЛИВО: Цей запит НЕ дублюється з AuthContext (після рефакторингу 23.01.2026).
  // Раніше AuthContext завантажував один "активний" воркспейс, що було неправильно.
  // Тепер AuthContext не завантажує воркспейси взагалі,
  // а ця сторінка коректно завантажує ВСІ воркспейси користувача.
  const workspaces = await getWorkspaces();
  return <WorkspaceClientPage initialWorkspaces={workspaces ?? []} />;
}

/**
 * Серверний компонент сторінки воркспейсів.
 * Використовує Suspense для правильної гідратації та поступового завантаження.
 *
 * ОПТИМІЗАЦІЯ:
 * - Використовуємо `React.cache` (всередині `getWorkspaces`) для уникнення дублюючих запитів.
 * - `Suspense` boundary запобігає блокуванню рендерингу всієї сторінки.
 */
export default function WorkspacePage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <WorkspaceContent />
    </Suspense>
  );
}
