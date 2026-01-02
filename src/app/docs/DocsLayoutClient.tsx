"use client";

import { useState } from "react";
import { DocsSidebar } from "@/shared/components/DocsSidebar";
import { Menu } from "lucide-react";

export function DocsLayoutClient({
  allDocs,
  children,
}: {
  allDocs: { slug: string; title: string }[];
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <div className="fixed top-5 left-5 z-30 md:hidden">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-md p-2 text-primary"
        >
          <Menu />
        </button>
      </div>
      <DocsSidebar
        allDocs={allDocs}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed inset-y-0 left-0 z-50 h-full w-64 -translate-x-full transform bg-gray-900 p-4 transition-transform duration-300 ease-in-out md:relative md:inset-auto md:z-auto md:h-auto md:w-56 md:translate-x-0 md:bg-transparent md:p-0"
      />
      <div className="grow min-w-0">{children}</div>
    </>
  );
}
