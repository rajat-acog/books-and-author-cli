import { cookies } from "next/headers";

const COOKIE_NAME = "bookflix_preferences";

const MAX_INSTRUCTIONS = 10;
const MAX_INSTRUCTION_LENGTH = 250;

export type UserPreferences = {
  style?: string;
  limit?: number;
  history?: string[];

  globalInstructions?: string[];
  chatInstructions?: string[];
  summaryInstructions?: string[];
};

type PreferenceTarget = "global" | "chat" | "summary";

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueStrings(items: string[], max = 10) {
  return Array.from(
    new Map(items.map((item) => [normalize(item), item])).values()
  ).slice(0, max);
}

function safeParsePreferences(value?: string): UserPreferences {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as UserPreferences;

    return {
      style: typeof parsed.style === "string" ? parsed.style : undefined,

      limit: typeof parsed.limit === "number" ? parsed.limit : undefined,

      history: uniqueStrings(cleanStringArray(parsed.history), 6),

      globalInstructions: uniqueStrings(
        cleanStringArray(parsed.globalInstructions),
        MAX_INSTRUCTIONS
      ),

      chatInstructions: uniqueStrings(
        cleanStringArray(parsed.chatInstructions),
        MAX_INSTRUCTIONS
      ),

      summaryInstructions: uniqueStrings(
        cleanStringArray(parsed.summaryInstructions),
        MAX_INSTRUCTIONS
      ),
    };
  } catch {
    return {};
  }
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;

  return safeParsePreferences(value);
}

export async function saveUserPreferences(preferences: UserPreferences) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, JSON.stringify(preferences), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

function isPreferenceMessage(message: string) {
  const text = normalize(message);

  const phrases = [
    "from now on",
    "always",
    "remember",
    "i prefer",
    "i want",
    "i don't want",
    "i do not want",
    "dont",
    "don't",
    "do not",
    "avoid",
    "keep",
    "make",
    "give me",
    "reply",
    "respond",
    "answer",
    "summaries should",
    "summary should",
  ];

  return phrases.some((phrase) => text.includes(phrase));
}

function getPreferenceTarget(message: string): PreferenceTarget {
  const text = normalize(message);

  const summaryWords = [
    "summary",
    "summaries",
    "book summary",
    "book summaries",
    "summarize",
  ];

  const chatWords = [
    "reply",
    "respond",
    "answer",
    "chat",
    "talk",
    "talk to me",
  ];

  const hasSummaryTarget = summaryWords.some((word) => text.includes(word));
  const hasChatTarget = chatWords.some((word) => text.includes(word));

  if (hasSummaryTarget && !hasChatTarget) return "summary";

  if (hasChatTarget && !hasSummaryTarget) return "chat";

  return "global";
}

function getPreferenceGroups(text: string) {
  const message = normalize(text);
  const groups = new Set<string>();

  if (
    message.includes("bullet") ||
    message.includes("points") ||
    message.includes("numbered") ||
    message.includes("list") ||
    message.includes("paragraph")
  ) {
    groups.add("format");
  }

  if (
    message.includes("short") ||
    message.includes("concise") ||
    message.includes("brief") ||
    message.includes("long") ||
    message.includes("detailed")
  ) {
    groups.add("length");
  }

  if (message.includes("word") || message.includes("words")) {
    groups.add("word_limit");
  }

  if (
    message.includes("funny") ||
    message.includes("pirate") ||
    message.includes("haiku") ||
    message.includes("drseuss") ||
    message.includes("shashi tharoor") ||
    message.includes("simple")
  ) {
    groups.add("style");
  }

  if (message.includes("spoiler") || message.includes("spoilers")) {
    groups.add("spoilers");
  }

  if (
    message.includes("hindi") ||
    message.includes("english") ||
    message.includes("kannada") ||
    message.includes("telugu") ||
    message.includes("language") ||
    message.includes("translate")
  ) {
    groups.add("language");
  }

  return groups;
}

function updateInstructions(existingInstructions: string[], message: string) {
  const cleanMessage = message.trim().slice(0, MAX_INSTRUCTION_LENGTH);

  if (!cleanMessage || !isPreferenceMessage(cleanMessage)) {
    return existingInstructions;
  }

  const newGroups = getPreferenceGroups(cleanMessage);

  const filtered = existingInstructions.filter((instruction) => {
    if (normalize(instruction) === normalize(cleanMessage)) {
      return false;
    }

    const oldGroups = getPreferenceGroups(instruction);

    for (const group of newGroups) {
      if (oldGroups.has(group)) {
        return false;
      }
    }

    return true;
  });

  return [cleanMessage, ...filtered].slice(0, MAX_INSTRUCTIONS);
}

export async function savePreferenceFromChatMessage(message: string) {
  const preferences = await getUserPreferences();

  if (!isPreferenceMessage(message)) {
    return {
      saved: false,
      target: null,
      preferences,
    };
  }

  const target = getPreferenceTarget(message);

  if (target === "summary") {
    const summaryInstructions = updateInstructions(
      preferences.summaryInstructions ?? [],
      message
    );

    const nextPreferences: UserPreferences = {
      ...preferences,
      summaryInstructions,
    };

    await saveUserPreferences(nextPreferences);

    return {
      saved: true,
      target,
      preferences: nextPreferences,
    };
  }

  if (target === "chat") {
    const chatInstructions = updateInstructions(
      preferences.chatInstructions ?? [],
      message
    );

    const nextPreferences: UserPreferences = {
      ...preferences,
      chatInstructions,
    };

    await saveUserPreferences(nextPreferences);

    return {
      saved: true,
      target,
      preferences: nextPreferences,
    };
  }

  const globalInstructions = updateInstructions(
    preferences.globalInstructions ?? [],
    message
  );

  const nextPreferences: UserPreferences = {
    ...preferences,
    globalInstructions,
  };

  await saveUserPreferences(nextPreferences);

  return {
    saved: true,
    target,
    preferences: nextPreferences,
  };
}

export function getChatPromptInstructions(preferences: UserPreferences) {
  return [
    ...(preferences.globalInstructions ?? []),
    ...(preferences.chatInstructions ?? []),
  ];
}

export function getSummaryPromptInstructions(preferences: UserPreferences) {
  return [
    ...(preferences.globalInstructions ?? []),
    ...(preferences.summaryInstructions ?? []),
  ];
}