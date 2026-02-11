"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { USER_PAGES } from "@/shared/config/user-nav";
import { cn } from "@/frontend/shared/lib/utils";
import { Button } from "@/frontend/shared/components/ui/button";

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
            <Link href={page.href} className="flex items-center w-full">
              <page.icon className="mr-2 h-4 w-4" />
              <span>{page.label}</span>
            </Link>
          </Button>
        ))}
      </nav>
    </aside>
  );
}
