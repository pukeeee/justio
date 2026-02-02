import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/shared/supabase/server";
import { UserSidebar } from "@/frontend/widgets/user/sidebar/ui/UserSidebar";

export const metadata: Metadata = {
  title: "Кабінет | CRM4SMB",
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
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Редірект неавтентифікованих користувачів
  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="container flex flex-1 py-6">
        <div className="hidden md:flex">
          <UserSidebar />
        </div>
        <main className="flex-1 md:pl-6">{children}</main>
      </div>
    </div>
  );
}
