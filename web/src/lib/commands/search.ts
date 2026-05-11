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

export async function searchCommand(
  options: SearchCommandOptions
) {
  const { author, title, limit, json } = options;

  if (!author && !title) {
    console.log(
      "Please provide either --author or --title"
    );

    return;
  }

  const spinner = ora("Fetching books...").start();

  try {
    let books = [];

    // ✅ EXACT MATCH
    if (title && author) {
      const exactBook =
        await findBookByTitleAndAuthor(
          title,
          author
        );

      books = exactBook ? [exactBook] : [];
    }

    // ✅ TITLE SEARCH
    else if (title) {
      books = await getBooksByTitle(title);
    }

    // ✅ AUTHOR SEARCH
    else {
      books = await getBooksByAuthor(author!);
    }

    spinner.succeed("Books loaded");

    if (!books.length) {
      console.log(
        `No exact match found for "${title}" by "${author}".`
      );

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