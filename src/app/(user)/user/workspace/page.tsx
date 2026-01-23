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
 * Async компонент що завантажує дані
 */
async function WorkspaceContent() {
  const workspaces = await getWorkspaces();
  return <WorkspaceClientPage initialWorkspaces={workspaces ?? []} />;
}

/**
 * Серверний компонент сторінки воркспейсів.
 * Використовує Suspense для правильної гідратації.
 */
export default function WorkspacePage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <WorkspaceContent />
    </Suspense>
  );
}
