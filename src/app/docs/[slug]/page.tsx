import { getDocSlugs, getDocHtml } from "@/frontend/shared/utils/docs";

// Generate static paths for all docs
export async function generateStaticParams() {
  const slugs = getDocSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const doc = await getDocHtml(resolvedParams.slug);

  if (!doc) {
    return (
      <main className="prose max-w-none">
        <h1>Document not found.</h1>
      </main>
    );
  }

  return (
    <main
      className="prose max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
    />
  );
}
