"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookCard } from "../../components/BookCard";
import { BookAssistantChat } from "../../components/BookAssistantChat";

type Book = {
    title: string;
    key: string;
    year?: number;
    authorNames?: string[];
    coverUrl?: string;
    description?: string;
};

type SummaryResult = {
    title: string;
    author?: string;
    authors?: string[];
    year?: number;
    coverUrl?: string;
    description?: string;
    summary: string;
};

type SearchPayload = {
    title?: string;
    author?: string;
};

type SearchMode =
    | "author"
    | "title"
    | "exact-title-author"
    | "mood"
    | null;

const summaryStyles = [
    "simple",
    "funny",
    "pirate",
    "haiku",
    "shashi tharoor",
    "drseuss",
];

function uniqueHistory(nextAuthor: string, oldHistory: string[]) {
    const cleanAuthor = nextAuthor.trim();

    if (!cleanAuthor) return oldHistory;

    return [
        cleanAuthor,
        ...oldHistory.filter(
            (item) => item.toLowerCase().trim() !== cleanAuthor.toLowerCase()
        ),
    ].slice(0, 6);
}

function normalizeSearchText(value: string) {
    return value.toLowerCase().trim();
}

function splitExactAndSimilarBooks(books: Book[], searchTitle: string) {
    const normalizedTitle = normalizeSearchText(searchTitle);

    const exactBooks = books.filter(
        (book) => normalizeSearchText(book.title) === normalizedTitle
    );

    const similarBooks = books.filter(
        (book) => normalizeSearchText(book.title) !== normalizedTitle
    );

    return { exactBooks, similarBooks };
}

export default function DashboardPage() {
    const { status, data: session } = useSession();
    const router = useRouter();

    const [author, setAuthor] = useState("");
    const [title, setTitle] = useState("");
    const [limit, setLimit] = useState(8);
    const [style, setStyle] = useState("simple");
    const [moodQuery, setMoodQuery] = useState("");

    const [books, setBooks] = useState<Book[]>([]);
    const [exactBooks, setExactBooks] = useState<Book[]>([]);
    const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
    const [searchMode, setSearchMode] = useState<SearchMode>(null);

    const [result, setResult] = useState<SummaryResult | null>(null);
    const [history, setHistory] = useState<string[]>([]);

    const [searching, setSearching] = useState(false);
    const [summarizing, setSummarizing] = useState(false);
    const [error, setError] = useState("");

    const searchButtonText = title.trim() && author.trim()
        ? "Search Exact Book"
        : title.trim()
            ? "Search Book"
            : "Search Author";

    const canSearch = useMemo(
        () => title.trim().length > 0 || author.trim().length > 0,
        [title, author]
    );

    const canSummarize = useMemo(() => title.trim().length > 0, [title]);

    const heroImage = result?.coverUrl || books[0]?.coverUrl;

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [status, router]);

    useEffect(() => {
        async function loadPreferences() {
            const res = await fetch("/api/preferences", {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) return;

            const data = await res.json();

            if (data.style) setStyle(data.style);
            if (data.limit) setLimit(data.limit);

            if (Array.isArray(data.history)) {
                const cleanHistory: string[] = data.history
                    .filter((item: unknown): item is string => typeof item === "string")
                    .map((item: string) => item.trim())
                    .filter((item: string) => item.length > 0);

                const historyMap = new Map<string, string>();

                cleanHistory.forEach((item: string) => {
                    historyMap.set(item.toLowerCase(), item);
                });

                setHistory(Array.from(historyMap.values()));
            }
        }

        if (status === "authenticated") {
            loadPreferences();
        }
    }, [status]);

    async function savePreferences(nextHistory: string[], nextStyle = style) {
        setHistory(nextHistory);

        await fetch("/api/preferences", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                style: nextStyle,
                limit,
                history: nextHistory,
            }),
        });
    }

    async function searchBooks(payload?: SearchPayload) {
        const isFromChatbot = payload !== undefined;

        const finalAuthor = isFromChatbot
            ? payload.author ?? ""
            : author;

        const finalTitle = isFromChatbot
            ? payload.title ?? ""
            : title;

        if (!finalAuthor.trim() && !finalTitle.trim()) return;

        setSearching(true);
        setError("");
        setResult(null);
        setBooks([]);
        setExactBooks([]);
        setSimilarBooks([]);
        setSearchMode(null);

        try {
            const res = await fetch("/api/books", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: finalTitle.trim() || undefined,
                    author: finalAuthor.trim() || undefined,
                    limit,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to search books");
            }

            setTitle(finalTitle);
            setAuthor(finalAuthor);

            const fetchedBooks: Book[] = Array.isArray(data.books) ? data.books : [];

            const mode: SearchMode =
                data.mode ??
                (finalTitle.trim() && finalAuthor.trim()
                    ? "exact-title-author"
                    : finalTitle.trim()
                        ? "title"
                        : "author");

            setBooks(fetchedBooks);
            setSearchMode(mode);

            if (mode === "title") {
                const grouped =
                    Array.isArray(data.exactBooks) || Array.isArray(data.similarBooks)
                        ? {
                            exactBooks: Array.isArray(data.exactBooks)
                                ? data.exactBooks
                                : [],
                            similarBooks: Array.isArray(data.similarBooks)
                                ? data.similarBooks
                                : [],
                        }
                        : splitExactAndSimilarBooks(fetchedBooks, finalTitle);

                setExactBooks(grouped.exactBooks);
                setSimilarBooks(grouped.similarBooks);
            }

            if (mode === "exact-title-author") {
                setExactBooks(fetchedBooks);
                setSimilarBooks([]);
            }

            if (finalAuthor.trim()) {
                const nextHistory = uniqueHistory(finalAuthor, history);
                await savePreferences(nextHistory);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSearching(false);
        }
    }

    async function runMoodSearch(mood: string) {
        const cleanMood = mood.trim();

        if (!cleanMood) return;

        setSearching(true);
        setError("");
        setResult(null);
        setBooks([]);
        setExactBooks([]);
        setSimilarBooks([]);
        setSearchMode(null);
        setMoodQuery(cleanMood);

        try {
            const res = await fetch("/api/mood-search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mood: cleanMood,
                    limit,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to run mood search");
            }

            const fetchedBooks: Book[] = Array.isArray(data.books)
                ? data.books
                : [];

            setTitle("");
            setAuthor("");
            setBooks(fetchedBooks);
            setExactBooks([]);
            setSimilarBooks([]);
            setSearchMode("mood");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSearching(false);
        }
    }

    async function handleChatMoodSearch(mood: string) {
        await runMoodSearch(mood);
    }

    async function getSummary(bookTitle?: string, bookAuthor?: string) {
        const finalTitle = bookTitle || title;
        const finalAuthor = bookAuthor || author;

        if (!finalTitle.trim()) return;

        setSummarizing(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch("/api/summary", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: finalTitle,
                    author: finalAuthor || undefined,
                    style,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to summarize book");
            }

            setTitle(finalTitle);
            setAuthor(finalAuthor || "");

            setResult({
                ...data,
                author: data.author || finalAuthor,
            });

            if (finalAuthor) {
                const nextHistory = uniqueHistory(finalAuthor, history);
                await savePreferences(nextHistory);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSummarizing(false);
        }
    }

    async function handleChatSearch(payload: SearchPayload) {
        await searchBooks(payload);
    }

    async function handleChatSummarize(payload: SearchPayload) {
        if (!payload.title) return;

        await getSummary(payload.title, payload.author || author);
    }

    async function removeHistory(item: string) {
        const nextHistory = history.filter(
            (h) => h.toLowerCase().trim() !== item.toLowerCase().trim()
        );

        await savePreferences(nextHistory);
    }

    if (status === "loading") {
        return (
            <main className="grid min-h-screen place-items-center bg-neutral-950 text-white">
                <p className="text-neutral-400">Checking session...</p>
            </main>
        );
    }

    if (status === "unauthenticated") return null;

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <section className="relative overflow-hidden">
                {heroImage && (
                    <img
                        src={heroImage}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-20 blur-sm"
                    />
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-neutral-950/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />

                <div className="relative mx-auto flex min-h-[70vh] w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h1 className="text-3xl font-black tracking-widest text-red-600 sm:text-4xl">
                            BOOKAI
                        </h1>

                        <div className="flex flex-col gap-3 text-sm text-neutral-300 sm:flex-row sm:items-center">
                            <span>{session?.user?.email}</span>

                            <button
                                onClick={async () => {
                                    await signOut({ redirect: false });
                                    window.location.href = "/login";
                                }}
                                className="rounded-full bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </div>
                    </header>

                    <div className="flex flex-1 items-center py-12">
                        <div className="w-full max-w-5xl">
                            <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-red-500">
                                AI Book Dashboard
                            </p>

                            <h2 className="max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
                                Search books and generate summaries.
                            </h2>

                            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
                                Use title and author together to find the correct book, fetch
                                cover image, description, and generate an exact AI summary.
                            </p>

                            <div className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-black/50 p-4 shadow-2xl backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-[1fr_1fr_100px_180px]">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase text-neutral-400">
                                        Book title
                                    </label>
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder='Example: "Twilight"'
                                        className="h-12 w-full rounded-xl border border-white/10 bg-neutral-950 px-4 text-white outline-none focus:border-red-600"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase text-neutral-400">
                                        Author
                                    </label>
                                    <input
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        placeholder='Example: "William Gay"'
                                        className="h-12 w-full rounded-xl border border-white/10 bg-neutral-950 px-4 text-white outline-none focus:border-red-600"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase text-neutral-400">
                                        Limit
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={limit}
                                        onChange={(e) => setLimit(Number(e.target.value))}
                                        className="h-12 w-full rounded-xl border border-white/10 bg-neutral-950 px-4 text-white outline-none focus:border-red-600"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase text-neutral-400">
                                        Style
                                    </label>

                                    <div className="relative">
                                        <select
                                            value={style}
                                            onChange={async (e) => {
                                                const nextStyle = e.target.value;
                                                setStyle(nextStyle);
                                                await savePreferences(history, nextStyle);
                                            }}
                                            className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-neutral-950 px-4 pr-10 text-white outline-none focus:border-red-600"
                                        >
                                            {summaryStyles.map((item) => (
                                                <option
                                                    key={item}
                                                    value={item}
                                                    className="bg-neutral-950 text-white"
                                                >
                                                    {item}
                                                </option>
                                            ))}
                                        </select>

                                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                                            ▼
                                        </span>
                                    </div>
                                </div>

                                <button
                                    disabled={!canSummarize || summarizing}
                                    onClick={() => getSummary()}
                                    className="h-12 rounded-xl bg-red-600 px-5 font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-1 lg:col-span-2"
                                >
                                    {summarizing ? "Summarizing..." : "Get Summary"}
                                </button>

                                <button
                                    disabled={!canSearch || searching}
                                    onClick={() => searchBooks()}
                                    className="h-12 rounded-xl bg-white px-5 font-black text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-1 lg:col-span-2"
                                >
                                    {searching ? "Searching..." : searchButtonText}
                                </button>
                            </div>

                            {error && (
                                <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-red-200">
                                    {error}
                                </div>
                            )}

                            {history.length > 0 && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {history.map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => searchBooks({ author: item })}
                                            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
                                        >
                                            {item}
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeHistory(item);
                                                }}
                                                className="ml-3 text-red-400"
                                            >
                                                ×
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:px-8">
                <div>
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-black sm:text-3xl">
                                {searchMode === "mood" ? "Mood Recommendations" : "Author Library"}
                            </h2>
                            <p className="text-neutral-400">
                                {searchMode === "mood"
                                    ? `AI recommendations for: ${moodQuery}`
                                    : books.length
                                        ? `${books.length} books found`
                                        : "Search an author or title to load books"}
                            </p>
                        </div>
                    </div>

                    {searching && (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {Array.from({ length: limit }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-[430px] animate-pulse rounded-2xl bg-neutral-900"
                                />
                            ))}
                        </div>
                    )}

                    {!searching && searchMode === "title" && (
                        <div className="space-y-10">
                            {exactBooks.length > 0 && (
                                <div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-xl font-black text-white">
                                            Exact Matches
                                        </h3>
                                        <span className="rounded-full bg-red-600/20 px-3 py-1 text-sm text-red-200">
                                            {exactBooks.length}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                        {exactBooks.map((book) => (
                                            <BookCard
                                                key={book.key}
                                                book={book}
                                                fallbackAuthor={author}
                                                onSummarize={getSummary}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {similarBooks.length > 0 && (
                                <div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-xl font-black text-white">
                                            Similar Results
                                        </h3>
                                        <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-neutral-300">
                                            {similarBooks.length}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                        {similarBooks.map((book) => (
                                            <BookCard
                                                key={book.key}
                                                book={book}
                                                fallbackAuthor={author}
                                                onSummarize={getSummary}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!searching && searchMode !== "title" && (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {books.map((book) => (
                                <BookCard
                                    key={book.key}
                                    book={book}
                                    fallbackAuthor={author}
                                    onSummarize={getSummary}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <aside className="max-h-[calc(100vh-3rem)] overflow-y-auto rounded-3xl border border-white/10 bg-neutral-900/80 p-5 shadow-2xl lg:sticky lg:top-6">
                    <h2 className="text-2xl font-black">Featured Summary</h2>

                    {summarizing && (
                        <div className="mt-5 h-96 animate-pulse rounded-2xl bg-neutral-800" />
                    )}

                    {!summarizing && !result && (
                        <p className="mt-5 leading-7 text-neutral-400">
                            Your generated book summary will appear here.
                        </p>
                    )}

                    {!summarizing && result && (
                        <div className="mt-5 space-y-5">
                            {result.coverUrl && (
                                <img
                                    src={result.coverUrl}
                                    alt={result.title}
                                    className="h-72 w-full rounded-2xl object-cover"
                                />
                            )}

                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">
                                    Selected Book
                                </p>

                                <h3 className="mt-2 text-3xl font-black">{result.title}</h3>

                                <p className="mt-2 text-neutral-400">
                                    {result.author ||
                                        result.authors?.join(", ") ||
                                        "Author not available"}
                                    {result.year ? ` • ${result.year}` : ""}
                                </p>
                            </div>

                            {result.description && (
                                <p className="rounded-2xl bg-white/5 p-4 leading-7 text-neutral-300">
                                    {result.description}
                                </p>
                            )}

                            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 leading-8 text-neutral-100">
                                {result.summary}
                            </div>
                        </div>
                    )}
                </aside>
            </section>

            <BookAssistantChat
                onSearch={handleChatSearch}
                onSummarize={handleChatSummarize}
                onMoodSearch={handleChatMoodSearch}
            />
        </main>
    );
}