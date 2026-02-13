/**
 * @file layout.tsx (dashboard)
 * @description Layout для сторінок дашборду з ініціалізацією воркспейсів
 */

import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/frontend/shared/components/ui/sidebar";
import { Separator } from "@/frontend/shared/components/ui/separator";
import { AppSidebar } from "@/frontend/widgets/dashboard/sidebar/ui/Sidebar";
import { DynamicBreadcrumbs } from "@/frontend/shared/components/DynamicBreadcrumbs";
import { WorkspaceStoreSync } from "@/frontend/shared/components/providers/workspace-store-sync";
import {
  getUserWorkspaces,
  getCachedUser,
} from "@/frontend/shared/lib/auth/get-user-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Дашборд | Justio",
  description: "Управління воркспейсом",
};

export default async function DashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;

  // Отримуємо користувача та воркспейси (кешовано, без дублювання запитів)
  const [user, workspaces] = await Promise.all([
    getCachedUser(),
    getUserWorkspaces(),
  ]);

  if (!user) {
    redirect("/");
  }

  // Знаходимо поточний воркспейс.
  // Це критично для безпеки: якщо воркспейс не знайдено серед доступних користувачу,
  // значить він або не існує, або користувач не має до нього доступу.
  const currentWorkspace = workspaces.find((w) => w.slug === slug);

  if (!currentWorkspace) {
    notFound();
  }

  return (
    <SidebarProvider>
      <WorkspaceStoreSync workspaces={workspaces} currentSlug={slug} />
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-8"
            />
            <DynamicBreadcrumbs
              workspaceName={currentWorkspace.name}
              workspaceSlug={slug}
            />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
