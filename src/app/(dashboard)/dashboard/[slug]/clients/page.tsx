/**
 * @file page.tsx (/dashboard/[slug]/clients)
 * @description Сторінка управління контактами
 */

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getClientsAction } from "@/frontend/features/client/get-clients/actions/get-clients.action";
import { getUserWorkspaces } from "@/frontend/shared/lib/auth/get-user-data";
import { ClientsList } from "@/frontend/widgets/dashboard/clients/clients-list/ui/ClientsList";
import { notFound } from "next/navigation";
import { CreateClientDialog } from "@/frontend/features/client/create-client/ui/CreateClientDialog";

/**
 * Loading fallback
 */
function ClientsPageSkeleton() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Завантаження клієнтів...
        </p>
      </div>
    </div>
  );
}

async function ClientsContent({ slug }: { slug: string }) {
  // 1. Отримуємо воркспейси користувача
  const workspaces = await getUserWorkspaces();
  const currentWorkspace = workspaces.find((w) => w.slug === slug);

  if (!currentWorkspace) {
    notFound();
  }

  // 2. Отримуємо контакти
  const response = await getClientsAction({
    workspaceId: currentWorkspace.id,
    limit: 100,
    offset: 0,
    onlyDeleted: false,
  });

  if (!response.success || response.error) {
    return (
      <div className="p-8 border rounded-lg bg-destructive/10 text-destructive text-center">
        {response.error?.message || "Не вдалося завантажити список клієнтів"}
      </div>
    );
  }

  const clients = response.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Клієнти</h1>
          <p className="text-muted-foreground">
            Управління базою фізичних та юридичних осіб
          </p>
        </div>
        <CreateClientDialog workspaceId={currentWorkspace.id} />
      </div>

      <ClientsList clients={clients} />
    </div>
  );
}

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 pt-0">
      <Suspense fallback={<ClientsPageSkeleton />}>
        <ClientsContent slug={slug} />
      </Suspense>
    </div>
  );
}
