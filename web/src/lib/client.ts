import { getBooksByAuthor } from "../../../src/services/books";
import { summarizeBook } from "../../../src/services/llm";

export async function getBooksWithSummary(author: string, style: string) {
  const books = await getBooksByAuthor(author);

  const results = [];

  for (const book of books) {
    const summary = await summarizeBook(
      `${book.title} in ${style} style`
    );

    results.push({
      title: book.title,
      summary,
    });
  }

  return results;
}