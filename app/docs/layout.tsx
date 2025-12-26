import { ScrollToTop } from "@/components/ScrollToTop";
import { getAllDocs } from "@/lib/docs";
import { DocsLayoutClient } from "./DocsLayoutClient";

export default function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug?: string };
}) {
  const allDocs = getAllDocs();
  return (
    <div className="container mx-auto flex items-start gap-10 px-4 py-8">
      <DocsLayoutClient allDocs={allDocs}>{children}</DocsLayoutClient>
      <ScrollToTop />
    </div>
  );
}
