import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import gfm from 'remark-gfm'

const docsDirectory = path.join(process.cwd(), 'docs')

export function getDocSlugs() {
  const allDirents = fs.readdirSync(docsDirectory, { withFileTypes: true });
  return allDirents
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

export function getDocBySlug(slug: string) {
  if (!slug) {
    return null;
  }
  const fullPath = path.join(docsDirectory, slug, 'README.md');
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Extract title from the first line of markdown
  const title = matterResult.content.match(/^# (.*)/)?.[1] || slug;

  return {
    slug,
    title,
    content: matterResult.content,
  };
}

export async function getDocHtml(slug: string) {
    const doc = getDocBySlug(slug);

    if (!doc) {
        return {
            contentHtml: ''
        }
    }

    const processedContent = await remark()
        .use(html)
        .use(gfm)
        .process(doc.content);
    const contentHtml = processedContent.toString();

    return {
        ...doc,
        contentHtml
    }
}

export function getAllDocs() {
  const slugs = getDocSlugs();
  const docs = slugs
    .map(slug => getDocBySlug(slug))
    .filter((doc): doc is { slug: string; title: string; content: string; } => doc !== null)
    // sort posts by date in descending order
    .sort((doc1, doc2) => (doc1.slug > doc2.slug ? 1 : -1));
  return docs;
}
