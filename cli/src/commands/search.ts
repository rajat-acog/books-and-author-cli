import ora from "ora";
import {
  findBookByTitleAndAuthor,
  getBooksByAuthor,
  getBooksByTitle,
} from "../services/books";
import { formatOutput } from "../utils/formatter";

type SearchCommandOptions = {
  author?: string;
  title?: string;
  limit?: string;
  json?: boolean;
};

export async function searchCommand(options: SearchCommandOptions) {
  const { author, title, limit, json } = options;

  if (!author && !title) {
    console.log("Please provide either --author or --title");
    return;
  }

  const spinner = ora("Fetching books...").start();

  try {
    const books =
      title && author
        ? [await findBookByTitleAndAuthor(title, author)].filter(Boolean)
        : title
          ? await getBooksByTitle(title)
          : await getBooksByAuthor(author!);

    spinner.succeed("Books loaded");

    if (!books.length) {
      console.log(`No book found with title "${title}" by author "${author}"`);
      return;
    }

    const limited = limit
      ? books.slice(0, parseInt(limit, 10))
      : books;

    const result = limited.map((b) => ({
      title: b.title,
      authors: b.authorNames,
      year: b.year,
      coverUrl: b.coverUrl,
    }));

    formatOutput(result, json);
  } catch (err) {
    spinner.fail("Failed to fetch books");
    console.error(err);
  }
}