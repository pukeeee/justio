/**
 * @file layout.tsx (dashboard)
 * @description Layout для сторінок дашборду з ініціалізацією воркспейсів
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { AppSidebar } from "@/widgets/dashboard/sidebar/ui/Sidebar";
import { DynamicBreadcrumbs } from "@/shared/components/DynamicBreadcrumbs";
import { getUserWorkspaces, getCachedUser } from "@/shared/lib/auth/get-user-data";

export const metadata: Metadata = {
  title: "Дашборд | CRM4SMB",
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
    getUserWorkspaces()
  ]);

  if (!user) {
    redirect("/");
  }

  // Знаходимо поточний воркспейс для хлібних крихт
  const currentWorkspace = workspaces.find(w => w.slug === slug);

  return (
    <SidebarProvider>
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
              workspaceName={currentWorkspace?.name || "Воркспейс"}
              workspaceSlug={slug}
            />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
