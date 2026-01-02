import { ScrollToTop } from "@/shared/components/ScrollToTop";
import { getAllDocs } from "@/shared/lib/docs";
import { DocsLayoutClient } from "./DocsLayoutClient";
import React from "react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allDocs = getAllDocs();
  return (
    <div className="container mx-auto flex items-start gap-10 px-4 py-8">
      <DocsLayoutClient allDocs={allDocs}>{children}</DocsLayoutClient>
      <ScrollToTop />
    </div>
  );
}
