import { getAllDocs } from "@/frontend/shared/utils/docs";
import { redirect } from "next/navigation";

export default function DocsPage() {
  const allDocs = getAllDocs();
  const firstDoc = allDocs[0];
  if (firstDoc) {
    redirect(`/docs/${firstDoc.slug}`);
  }

  // Handle the case where there are no docs
  return (
    <main className="prose max-w-none dark:prose-invert">
      <h1>No documentation found.</h1>
    </main>
  );
}
