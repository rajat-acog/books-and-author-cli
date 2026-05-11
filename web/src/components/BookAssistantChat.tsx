"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";

type ChatActionPayload = {
    title?: string;
    author?: string;
};

type BookAssistantChatProps = {
    onSearch: (payload: ChatActionPayload) => void | Promise<void>;
    onSummarize: (payload: ChatActionPayload) => void | Promise<void>;
    onMoodSearch: (mood: string) => void | Promise<void>;
};

function getMessageText(message: any) {
    if (typeof message.content === "string") return message.content;

    if (Array.isArray(message.parts)) {
        return message.parts
            .filter((part: any) => part.type === "text")
            .map((part: any) => part.text)
            .join("");
    }

    return "";
}

function parseChatAction(message: string) {
    const text = message.trim();

    const summarizeMatch = text.match(
        /summari[sz]e\s+["']?(.+?)["']?\s+by\s+["']?(.+?)["']?$/i
    );

    if (summarizeMatch) {
        return {
            action: "summarize" as const,
            title: summarizeMatch[1].trim(),
            author: summarizeMatch[2].trim(),
        };
    }

    const searchBooksByAuthorMatch = text.match(
        /(show|search|find|get)\s+(me\s+)?books\s+by\s+["']?(.+?)["']?$/i
    );

    if (searchBooksByAuthorMatch) {
        return {
            action: "search" as const,
            author: searchBooksByAuthorMatch[3].trim(),
        };
    }

    const searchTitleMatch = text.match(
        /(show|search|find|get)\s+(me\s+)?(book|books)\s+(called|named|titled)?\s*["']?(.+?)["']?$/i
    );

    if (searchTitleMatch) {
        return {
            action: "search" as const,
            title: searchTitleMatch[5].trim(),
        };
    }

    const exactTitleAuthorMatch = text.match(
        /(show|search|find|get)\s+(me\s+)?["']?(.+?)["']?\s+by\s+["']?(.+?)["']?$/i
    );

    if (exactTitleAuthorMatch) {
        return {
            action: "search" as const,
            title: exactTitleAuthorMatch[3].trim(),
            author: exactTitleAuthorMatch[4].trim(),
        };
    }

    const moodSearchMatch =
        text.match(/^(suggest|recommend)\s+(me\s+)?(.+?)$/i) ||
        text.match(/^i want\s+(.+?)$/i) ||
        text.match(/^find\s+(me\s+)?(.+?)\s+(books|novels)$/i);

    if (moodSearchMatch) {
        return {
            action: "mood-search" as const,
            mood: text,
        };
    }

    return null;
}

export function BookAssistantChat({
    onSearch,
    onSummarize,
    onMoodSearch,
}: BookAssistantChatProps) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
        }),
    });

    const loading = status === "streaming" || status === "submitted";

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages, actionMessage]);

    async function runUiAction(message: string) {
        const parsed = parseChatAction(message);

        if (!parsed) return;

        if (parsed.action === "search") {
            setActionMessage("Running search on dashboard...");

            await onSearch({
                title: parsed.title,
                author: parsed.author,
            });

            setActionMessage("Dashboard search updated.");
        }

        if (parsed.action === "summarize") {
            setActionMessage("Generating summary on dashboard...");

            await onSummarize({
                title: parsed.title,
                author: parsed.author,
            });

            setActionMessage("Dashboard summary updated.");
        }

        if (parsed.action === "mood-search") {
            setActionMessage("Finding mood-based recommendations...");

            await onMoodSearch(parsed.mood);

            setActionMessage("Mood search updated on dashboard.");
        }
    }

    async function submitMessage(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const cleanInput = input.trim();

        if (!cleanInput || loading) return;

        setInput("");

        await runUiAction(cleanInput);

        sendMessage({
            text: cleanInput,
        });
    }

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {open && (
                <section className="mb-4 flex h-[480px] w-[min(92vw,400px)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/70">
                    <header className="border-b border-white/10 bg-gradient-to-r from-red-700 to-red-950 p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-red-100">
                                    Bookflix AI
                                </p>
                                <h2 className="mt-1 text-xl font-black text-white">
                                    Reading Assistant
                                </h2>
                                <p className="mt-1 text-sm text-red-100/80">
                                    Ask, search, summarize, or save preferences.
                                </p>
                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-full bg-black/30 px-3 py-1 text-sm font-bold text-white hover:bg-black/50"
                            >
                                ✕
                            </button>
                        </div>
                    </header>

                    <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
                        {messages.length === 0 && (
                            <div className="rounded-2xl bg-white/5 p-4 text-sm leading-6 text-neutral-300">
                                Try:
                                <div className="mt-3 space-y-2">
                                    {[
                                        "Show books by William Gay",
                                        "Search book titled Home",
                                        "Show Twilight by William Gay",
                                        "Summarize Twilight by William Gay",
                                        "From now on, give summaries in bullet points",
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setInput(suggestion)}
                                            className="block w-full rounded-xl bg-neutral-900 px-3 py-2 text-left text-neutral-200 hover:bg-neutral-800"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {actionMessage && (
                            <div className="rounded-2xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
                                {actionMessage}
                            </div>
                        )}

                        {messages.map((message) => {
                            const isUser = message.role === "user";
                            const text = getMessageText(message);

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${isUser
                                            ? "bg-red-600 text-white"
                                            : "bg-neutral-900 text-neutral-100"
                                            }`}
                                    >
                                        {text}
                                    </div>
                                </div>
                            );
                        })}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl bg-neutral-900 px-4 py-3 text-sm text-neutral-400">
                                    Thinking...
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                                Chat failed. Check server logs.
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={submitMessage}
                        className="border-t border-white/10 bg-black/40 p-3"
                    >
                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask Bookflix AI..."
                                className="h-12 min-w-0 flex-1 rounded-2xl border border-white/10 bg-neutral-900 px-4 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-red-600"
                            />

                            <button
                                disabled={!input.trim() || loading}
                                className="h-12 rounded-2xl bg-red-600 px-5 text-sm font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <button
                onClick={() => setOpen((value) => !value)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-2xl shadow-2xl shadow-red-950/70 transition hover:scale-105 hover:bg-red-700"
            >
                {open ? "×" : "💬"}
            </button>
        </div>
    );
}