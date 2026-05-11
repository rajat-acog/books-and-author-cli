import fs from "node:fs";
import path from "node:path";

import type { GeneratedAuthorProject } from "./types";

function parseFrontmatter(frontmatter: string): any {
  const lines = frontmatter.trim().split('\n');
  const data: any = {};
  let currentKey = '';
  let inBooks = false;
  let currentBook: any = {};

  for (const line of lines) {
    if (line.startsWith('name:')) {
      data.name = line.substring(5).trim();
    } else if (line.startsWith('bio:')) {
      data.bio = line.substring(4).trim();
    } else if (line.startsWith('books:')) {
      data.books = [];
      inBooks = true;
    } else if (inBooks && line.startsWith('  - title:')) {
      if (Object.keys(currentBook).length > 0) {
        data.books.push(currentBook);
      }
      currentBook = { title: line.substring(11).trim().replace(/^"|"$/g, '') };
    } else if (inBooks && line.startsWith('    year:')) {
      currentBook.year = parseInt(line.substring(9).trim()) || undefined;
    } else if (inBooks && line.startsWith('    summary:')) {
      currentBook.summary = line.substring(12).trim().replace(/^"|"$/g, '');
    } else if (inBooks && line.startsWith('    coverUrl:')) {
      currentBook.coverUrl = line.substring(13).trim().replace(/^"|"$/g, '') || undefined;
    }
  }
  if (Object.keys(currentBook).length > 0) {
    data.books.push(currentBook);
  }
  return data;
}

export function readAuthorMarkdown(filePath: string): GeneratedAuthorProject {
  const content = fs.readFileSync(filePath, "utf-8");
  const parts = content.split('---');
  if (parts.length < 3) {
    throw new Error('Invalid markdown format');
  }
  const frontmatter = parts[1];
  const data = parseFrontmatter(frontmatter);

  return {
    author: {
      name: data.name,
      bio: data.bio,
    },
    books: data.books || [],
  };
}

export function findAuthorMarkdown(authorName: string): string | null {
  const slug = authorName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const authorsDir = path.join(
    process.cwd(),
    "content/authors"
  );

  const filePath = path.join(authorsDir, `${slug}.md`);

  if (fs.existsSync(filePath)) {
    return filePath;
  }

  return null;
}