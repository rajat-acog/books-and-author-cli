import debug from "@aganitha/atk-debug";

const log = debug("book-cli:books");

export type Book = {
  title: string;
  key: string;
  year?: number;
  authorNames: string[];
  coverId?: number;
  coverUrl?: string;
  description?: string;
};

type OpenLibraryDoc = {
  title: string;
  key: string;
  first_publish_year?: number;
  author_name?: string[];
  cover_i?: number;
};

type OpenLibraryResponse = {
  docs: OpenLibraryDoc[];
};

type OpenLibraryWorkResponse = {
  description?: string | { value: string };
};

function getCoverUrl(coverId?: number) {
  if (!coverId) return undefined;

  return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
}

function normalizeDescription(description?: string | { value: string }) {
  if (!description) return undefined;

  if (typeof description === "string") {
    return description;
  }

  return description.value;
}

function trimText(text?: string, maxLength = 300) {
  if (!text) return undefined;

  if (text.length <= maxLength) {
    return text;
  }

  const sliced = text.slice(0, maxLength);
  const lastPeriod = sliced.lastIndexOf(".");

  if (lastPeriod > 100) {
    return sliced.slice(0, lastPeriod + 1);
  }

  return sliced.trim() + "...";
}

export async function getBooksByAuthor(author: string): Promise<Book[]> {
  log("Fetching books for %s", author);

  const res = await fetch(
    `https://openlibrary.org/search.json?author=${encodeURIComponent(author)}`
  );

  const data = (await res.json()) as OpenLibraryResponse;

  const books: Book[] = data.docs.map((b) => ({
    title: b.title,
    key: b.key,
    year: b.first_publish_year,
    authorNames: b.author_name ?? [],
    coverId: b.cover_i,
    coverUrl: getCoverUrl(b.cover_i),
  }));

  log("Books fetched %O", books);

  return books;
}

export async function getBookDetails(book: Book): Promise<Book> {
  const res = await fetch(`https://openlibrary.org${book.key}.json`);

  if (!res.ok) {
    return book;
  }

  const data = (await res.json()) as OpenLibraryWorkResponse;

  const fullDescription = normalizeDescription(data.description);

  return {
    ...book,
    description: trimText(fullDescription, 300),
  };
}

export async function findBookByTitleAndAuthor(
  title: string,
  author: string
): Promise<Book | null> {
  const books = await getBooksByAuthor(author);

  const normalizedTitle = title.toLowerCase().trim();
  const normalizedAuthor = author.toLowerCase().trim();

  const book = books.find(
    (b) =>
      b.title.toLowerCase().trim() === normalizedTitle &&
      b.authorNames.some(
        (a) => a.toLowerCase().trim() === normalizedAuthor
      )
  );

  if (!book) return null;

  return getBookDetails(book);
}

export async function getBooksByTitle(title: string): Promise<Book[]> {
  log("Fetching books for title %s", title);

  const res = await fetch(
    `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`
  );

  const data = (await res.json()) as OpenLibraryResponse;

  const books: Book[] = data.docs.map((b) => ({
    title: b.title,
    key: b.key,
    year: b.first_publish_year,
    authorNames: b.author_name ?? [],
    coverId: b.cover_i,
    coverUrl: getCoverUrl(b.cover_i),
  }));

  log("Books fetched by title %O", books);

  return books;
}