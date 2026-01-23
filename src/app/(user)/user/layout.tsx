import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/shared/supabase/server";

export const metadata: Metadata = {
  title: "Налаштування | CRM4SMB",
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
      {/* Можна додати спільний header для user-сторінок */}
      <div className="container py-6">{children}</div>
    </div>
  );
}
