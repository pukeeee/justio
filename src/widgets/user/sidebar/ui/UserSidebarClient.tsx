"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { USER_PAGES } from "@/shared/lib/config/user-pages";
import { cn } from "@/shared/lib/utils/utils";
import { Button } from "@/shared/components/ui/button";

/**
 * Клієнтська частина сайдбару з логікою підсвічування активних посилань.
 */
export function UserSidebarClient() {
  const pathname = usePathname();

  return (
    <aside className="h-full w-64 flex-col border-r">
      <nav className="flex flex-col gap-2 p-8">
        {USER_PAGES.map((page) => (
          <Button
            key={page.href}
            asChild
            variant="ghost"
            className={cn(
              "justify-start",
              pathname === page.href && "bg-accent text-accent-foreground",
            )}
          >
            <Link href={page.href}>{page.label}</Link>
          </Button>
        ))}
      </nav>
    </aside>
  );
}
