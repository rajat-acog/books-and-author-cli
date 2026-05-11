type Book = {
    title: string;
    key: string;
    year?: number;
    authorNames?: string[];
    coverUrl?: string;
    description?: string;
};

type BookCardProps = {
    book: Book;
    fallbackAuthor: string;
    onSummarize: (title: string, author: string) => void;
};

export function BookCard({ book, fallbackAuthor, onSummarize }: BookCardProps) {
    const author = book.authorNames?.[0] || fallbackAuthor;

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-950/40">
            <div className="h-[280px] w-full bg-neutral-800">
                {book.coverUrl ? (
                    <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="grid h-full place-items-center text-sm text-neutral-500">
                        No Cover
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-3">
                <div>
                    <h3 className="line-clamp-2 min-h-[44px] font-bold leading-snug">
                        {book.title}
                    </h3>

                    <p className="mt-2 line-clamp-1 text-sm text-neutral-400">
                        {author || "Author not available"}
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                        {book.year || "Unknown year"}
                    </p>
                </div>

                <button
                    onClick={() => onSummarize(book.title, author)}
                    className="mt-auto w-full rounded-xl bg-white px-3 py-2 text-sm font-black text-black transition hover:bg-red-600 hover:text-white"
                >
                    Summarize
                </button>
            </div>
        </article>
    );
}