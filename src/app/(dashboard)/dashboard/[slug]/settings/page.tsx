import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { container } from "@/backend/infrastructure/di/container";
import { IWorkspaceRepository } from "@/backend/application/interfaces/repositories/workspace.repository.interface";
import { DeleteWorkspaceButton } from "@/frontend/features/workspace/ui/DeleteWorkspaceButton";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Отримуємо воркспейс, щоб дізнатися його ID
  const workspaceRepo = container.resolve<IWorkspaceRepository>("IWorkspaceRepository");
  const workspace = await workspaceRepo.findBySlug(slug);

  if (!workspace) {
    return <div className="p-4">Воркспейс не знайдено</div>;
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin" /></div>}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-2xl font-bold mb-2">Налаштування</h2>
          <p className="text-muted-foreground">Параметри воркспейсу: {workspace.name}</p>
          
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold text-destructive mb-4">Небезпечна зона</h3>
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <p className="text-sm text-muted-foreground mb-4">
                Видалення воркспейсу призведе до втрати всіх пов'язаних даних. Цю дію можна буде скасувати лише через адміністратора.
              </p>
              
              <DeleteWorkspaceButton workspaceId={workspace.id} />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
