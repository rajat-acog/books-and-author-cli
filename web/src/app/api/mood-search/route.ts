import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import {
    findBookByTitleAndAuthor,
    getBooksByTitle,
} from "@/lib/services/books";

type Recommendation = {
    title: string;
    author: string;
    reason?: string;
};

function extractJsonArray(text: string) {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");

    if (start === -1 || end === -1) return [];

    try {
        return JSON.parse(text.slice(start, end + 1)) as Recommendation[];
    } catch {
        return [];
    }
}

export async function POST(req: NextRequest) {
    try {
        const { mood, limit } = await req.json();

        if (!mood || typeof mood !== "string") {
            return NextResponse.json(
                { error: "Mood query is required" },
                { status: 400 }
            );
        }

        const result = await generateText({
            model: google("gemini-2.5-flash-lite"),
            prompt: `
Suggest ${Number(limit || 8)} real books for this reader mood/request:

"${mood}"

Return ONLY valid JSON array.
No markdown.
No explanation.

Shape:
[
  {
    "title": "Book title",
    "author": "Author name",
    "reason": "short reason"
  }
]

Rules:
- Recommend real published books only.
- Prefer books likely available in OpenLibrary.
- Avoid duplicate titles.
`,
        });

        const recommendations = extractJsonArray(result.text).slice(
            0,
            Number(limit || 8)
        );

        const books = [];

        for (const item of recommendations) {
            if (!item.title || !item.author) continue;

            const exactBook = await findBookByTitleAndAuthor(
                item.title,
                item.author
            );

            if (exactBook) {
                books.push({
                    ...exactBook,
                    recommendationReason: item.reason,
                });

                continue;
            }

            const titleMatches = await getBooksByTitle(item.title);
            const fallbackBook = titleMatches.find(
                (book) =>
                    book.title.toLowerCase().trim() ===
                    item.title.toLowerCase().trim()
            );

            if (fallbackBook) {
                books.push({
                    ...fallbackBook,
                    recommendationReason: item.reason,
                });
            }
        }

        return NextResponse.json({
            mode: "mood",
            mood,
            books,
            recommendations,
        });
    } catch (err) {
        console.error("MOOD_SEARCH_ERROR", err);

        return NextResponse.json(
            { error: "Failed to run mood search" },
            { status: 500 }
        );
    }
}