import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getCachedUser,
  getUserWorkspaces,
} from "@/frontend/shared/lib/auth/get-user-data";
import { UserSidebar } from "@/frontend/widgets/user/sidebar/ui/UserSidebar";
import { WorkspaceStoreSync } from "@/frontend/shared/components/providers/workspace-store-sync";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Кабінет | Justio",
  description: "Керування профілем та воркспейсами",
};

/**
 * Layout для user-роутів.
 * Забезпечує автентифікацію та загальну структуру для всіх user-сторінок.
 */
export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, workspaces] = await Promise.all([
    getCachedUser(),
    getUserWorkspaces(),
  ]);

  // Редірект неавтентифікованих користувачів
  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <WorkspaceStoreSync workspaces={workspaces} />
      <div className="container flex flex-1 py-6">
        <div className="hidden md:flex">
          <UserSidebar />
        </div>
        <main className="flex-1 md:pl-6">{children}</main>
      </div>
    </div>
  );
}
