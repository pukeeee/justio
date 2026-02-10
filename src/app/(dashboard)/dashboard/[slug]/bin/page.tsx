/**
 * @file page.tsx (/dashboard/[slug]/bin)
 * @description Сторінка кошика (видалені клієнти)
 */

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getDeletedClientsAction } from "@/frontend/features/client/get-clients/actions/get-deleted-clients.action";
import { getUserWorkspaces } from "@/frontend/shared/lib/auth/get-user-data";
import { notFound } from "next/navigation";
import { DeletedClientsList } from "@/frontend/widgets/dashboard/bin/ui/DeletedClientsList";

/**
 * Loading fallback
 */
function BinPageSkeleton() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Завантаження кошика...</p>
      </div>
    </div>
  );
}

async function BinContent({ slug }: { slug: string }) {
  // 1. Отримуємо воркспейси користувача
  const workspaces = await getUserWorkspaces();
  const currentWorkspace = workspaces.find((w) => w.slug === slug);

  if (!currentWorkspace) {
    notFound();
  }

  // 2. Отримуємо видалені клієнти
  const { clients, error } = await getDeletedClientsAction(currentWorkspace.id);

  if (error) {
    return (
      <div className="p-8 border rounded-lg bg-destructive/10 text-destructive text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Кошик
          </h1>
          <p className="text-muted-foreground">
            Клієнти, які були видалені. Ви можете їх відновити або видалити
            остаточно.
          </p>
        </div>
      </div>

      <DeletedClientsList
        initialClients={clients}
        workspaceId={currentWorkspace.id}
      />
    </div>
  );
}

export default async function BinPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 pt-0">
      <Suspense fallback={<BinPageSkeleton />}>
        <BinContent slug={slug} />
      </Suspense>
    </div>
  );
}
