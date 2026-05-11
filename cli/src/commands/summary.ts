import { findBookByTitleAndAuthor } from "../services/books";
import { summarizeBook } from "../services/llm";
import { formatOutput } from "../utils/formatter";

type SummaryCommandOptions = {
    title: string;
    author?: string;
    style?: string;
    json?: boolean;
};

export async function summaryCommand(options: SummaryCommandOptions) {
    const { title, author, style, json } = options;

    if (author) {
        const book = await findBookByTitleAndAuthor(title, author);

        if (!book) {
            console.log(`No book found with title "${title}" by author "${author}"`);
            return;
        }

        const summary = await summarizeBook(
            book.title,
            style,
            undefined,
            author
        );

        formatOutput(
            {
                title: book.title,
                author,
                authors: book.authorNames,
                year: book.year,
                coverUrl: book.coverUrl,
                description: book.description,
                summary,
            },
            json
        );

        return;
    }

    const summary = await summarizeBook(title, style);

    formatOutput(
        {
            title,
            summary,
        },
        json
    );
}