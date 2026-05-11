import debug from "@aganitha/atk-debug";

const log = debug("book-cli:books");

type Book = {
  title: string;
  key: string;
};

export async function getBooksByAuthor(author: string): Promise<Book[]> {
  log("Fetching books for %s", author);

  const url = `https://openlibrary.org/search.json?author=${encodeURIComponent(author)}`;

  const res = await fetch(url);
  const data = await res.json();

  const books: Book[] = data.docs.slice(0, 5).map((b: any) => ({
    title: b.title,
    key: b.key,
  }));

  log("Books fetched %O", books);

  return books;
}