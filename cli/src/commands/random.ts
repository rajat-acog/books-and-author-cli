import { getBooksByAuthor } from "../services/books";
import { summarizeBook } from "../services/llm";

export async function randomCommand(options: any) {
    const { author, style } = options;

    const books = await getBooksByAuthor(author);

    if (!books.length) {
        console.log("No books found");
        return;
    }

    const randomBook =
        books[Math.floor(Math.random() * books.length)];

    console.log(`📖 ${randomBook.title}`);

    const summary = await summarizeBook(
        randomBook.title,
        style
    );

    console.log(summary);
}