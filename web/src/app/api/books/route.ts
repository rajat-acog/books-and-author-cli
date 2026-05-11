import { NextRequest, NextResponse } from "next/server";
import {
    getBooksByAuthor,
    getBooksByTitle,
    findBookByTitleAndAuthor,
} from "@/lib/services/books";

type Book = {
    title: string;
    key: string;
    year?: number;
    authorNames: string[];
    coverUrl?: string;
    description?: string;
};

function normalize(value: string) {
    return value.toLowerCase().trim();
}

function splitExactAndSimilarBooks(books: Book[], title: string) {
    const normalizedTitle = normalize(title);

    const exactBooks = books.filter(
        (book) => normalize(book.title) === normalizedTitle
    );

    const similarBooks = books.filter(
        (book) => normalize(book.title) !== normalizedTitle
    );

    return {
        exactBooks,
        similarBooks,
        books: [...exactBooks, ...similarBooks],
    };
}

export async function POST(req: NextRequest) {
    try {
        const { author, title, limit } = await req.json();

        if (!author && !title) {
            return NextResponse.json(
                { error: "Please provide either author or title" },
                { status: 400 }
            );
        }

        if (title && author) {
            const book = await findBookByTitleAndAuthor(title, author);

            if (!book) {
                return NextResponse.json({
                    books: [],
                    exactBooks: [],
                    similarBooks: [],
                    mode: "exact-title-author",
                });
            }

            return NextResponse.json({
                books: [book],
                exactBooks: [book],
                similarBooks: [],
                mode: "exact-title-author",
            });
        }

        if (title) {
            const books = await getBooksByTitle(title);
            const grouped = splitExactAndSimilarBooks(books, title);

            return NextResponse.json({
                books: grouped.books.slice(0, Number(limit || 8)),
                exactBooks: grouped.exactBooks,
                similarBooks: grouped.similarBooks.slice(0, Number(limit || 8)),
                mode: "title",
            });
        }

        const books = await getBooksByAuthor(author);

        return NextResponse.json({
            books: books.slice(0, Number(limit || 8)),
            exactBooks: [],
            similarBooks: [],
            mode: "author",
        });
    } catch (err) {
        console.error("BOOKS_API_ERROR", err);

        return NextResponse.json(
            { error: "Failed to fetch books" },
            { status: 500 }
        );
    }
}