import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/shared/supabase/server";
import { UserHeader } from "@/widgets/user/header/ui/UserHeader";

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
    <div className="min-h-screen bg-background">
      <UserHeader />
      <main className="container py-6">{children}</main>
    </div>
  );
}
