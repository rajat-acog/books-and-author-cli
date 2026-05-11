import { NextRequest, NextResponse } from "next/server";
import { summarizeBook } from "@/lib/services/llm";
import { findBookByTitleAndAuthor } from "@/lib/services/books";
import {
  getSummaryPromptInstructions,
  getUserPreferences,
} from "@/lib/preferences";

export async function POST(req: NextRequest) {
  try {
    const { title, author, style, length, format } = await req.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Book title is required" },
        { status: 400 }
      );
    }

    const preferences = await getUserPreferences();
    const summaryInstructions = getSummaryPromptInstructions(preferences);

    if (author && typeof author === "string") {
      const book = await findBookByTitleAndAuthor(title, author);

      if (!book) {
        return NextResponse.json(
          {
            error: `No book found with title "${title}" by author "${author}"`,
          },
          { status: 404 }
        );
      }

      const summary = await summarizeBook(
        book.title,
        style,
        {
          length,
          format,
          sourceDescription: book.description,
          userPreferences: summaryInstructions,
        },
        author
      );

      return NextResponse.json({
        title: book.title,
        author,
        authors: book.authorNames,
        year: book.year,
        coverUrl: book.coverUrl,
        description: book.description,
        summary,
      });
    }

    const summary = await summarizeBook(title, style, {
      length,
      format,
      userPreferences: summaryInstructions,
    });

    return NextResponse.json({
      title,
      summary,
    });
  } catch (err) {
    console.error("SUMMARY_API_ERROR", err);

    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}