import type {
  GeneratedAuthorProject,
} from "../shared/types";

export function generateAuthorMarkdown(
  data: GeneratedAuthorProject
) {
  const booksYaml = data.books
    .map(
      (book) => `  - title: "${book.title.replace(/"/g, '\\"')}"
    year: ${book.year || "null"}
    summary: "${book.summary.replace(/"/g, '\\"')}"
    coverUrl: "${book.coverUrl || ""}"`
    )
    .join("\n");

  return `---
name: ${data.author.name}
bio: ${data.author.bio}
books:
${booksYaml}
---

# ${data.author.name}

## Biography

${data.author.bio}

${data.books
  .map(
    (book) => `
---

## ${book.title}

**Year:** ${book.year || "Unknown"}

**Summary:** ${book.summary}

**Description:** ${book.description || "No description available."}

**Cover:** ${book.coverUrl || ""}
`
  )
  .join("\n")}
`;
}