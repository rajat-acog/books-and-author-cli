import {
  getBooksByAuthor,
  getBookDetails,
  getAuthorDetails,
} from "@/lib/services/books";

import { summarizeBook } from "@/lib/services/llm";

import type {
  GeneratedAuthorProject,
  GeneratedBook,
} from "./types";

export async function buildAuthorProject(
  authorName: string
): Promise<GeneratedAuthorProject> {
  const books =
    await getBooksByAuthor(authorName);

  const topBooks = books
    .filter((b) => b.title)
    .slice(0, 5);

  const generatedBooks: GeneratedBook[] =
    [];

  for (const book of topBooks) {
    const detailed =
      await getBookDetails(book);

    const summary =
      await summarizeBook(
        detailed.title,
        detailed.description,
        {
          sourceDescription:
            detailed.description,
        },
        authorName
      );

    generatedBooks.push({
      title: detailed.title,
      author: authorName,
      year: detailed.year,
      description:
        detailed.description,
      summary,
      coverUrl: detailed.coverUrl,
    });
  }

  const authorDetails =
    await getAuthorDetails(authorName);

  return {
    author: {
      name: authorName,
      bio:
        authorDetails.bio ||
        `${authorName} is a notable author.`,
    },

    books: generatedBooks,
  };
}