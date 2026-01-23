"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/shared/lib/utils/utils";
import { LANDING_CONTENT } from "@/shared/lib/config/landing";
import { AuthenticatedUser } from "@/widgets/landing/header/ui/AuthenticatedUser";
import type { User } from "@supabase/supabase-js";

interface UserHeaderClientProps {
  user: User | null;
}

/**
 * Клієнтський компонент хедера кабінету користувача.
 * Відповідає за візуальну частину та ефекти (наприклад, скрол).
 */
export function UserHeaderClient({ user }: UserHeaderClientProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Користувач гарантовано є, оскільки layout робить редірект
  if (!user) {
    return null; // Або можна показати якийсь скелетон/заглушку
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-lg shadow-sm"
          : "bg-background/95 backdrop-blur-md",
      )}
    >
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Логотип */}
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-xl font-bold gradient-text">
              {LANDING_CONTENT.header.logo}
            </span>
          </Link>

          {/* Блок аутентифікованого користувача */}
          <div className="flex items-center gap-2">
            <AuthenticatedUser user={user} showDashboardButton={false} />
          </div>
        </div>
      </div>
    </header>
  );
}
