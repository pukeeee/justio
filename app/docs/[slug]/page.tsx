import { getDocSlugs, getDocHtml } from "@/lib/docs";

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
  params: { slug: string };
}) {
  const resolvedParams = await params;
  const doc = await getDocHtml(resolvedParams.slug);

  return (
    <main
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
    />
  );
}
