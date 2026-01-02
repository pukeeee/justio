"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { X } from "lucide-react";

export function DocsSidebar({
  allDocs,
  isOpen,
  toggleSidebar,
  className,
}: {
  allDocs: { slug: string; title: string }[];
  isOpen: boolean;
  toggleSidebar: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      <aside className={cn(className, isOpen && "translate-x-0")}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Документація</h2>
          <button onClick={toggleSidebar} className="md:hidden">
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        <nav className="mt-8 h-full">
          <ul className="space-y-2">
            <li>
              <Link
                href={`/`}
                onClick={toggleSidebar}
                className={cn(
                  "block w-full rounded-md px-3 py-2 text-sm font-medium",
                  pathname === "/"
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white",
                )}
              >
                Home
              </Link>
            </li>
            {allDocs.map((doc) => (
              <li key={doc.slug}>
                <Link
                  href={`/docs/${doc.slug}`}
                  onClick={toggleSidebar}
                  className={cn(
                    "block w-full rounded-md px-3 py-2 text-sm font-medium",
                    pathname === `/docs/${doc.slug}`
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white",
                  )}
                >
                  {doc.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
