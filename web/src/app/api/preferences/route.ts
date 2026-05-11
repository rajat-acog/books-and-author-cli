import { NextRequest, NextResponse } from "next/server";
import {
  getUserPreferences,
  saveUserPreferences,
  type UserPreferences,
} from "@/lib/preferences";

function uniqueHistory(history: unknown) {
  if (!Array.isArray(history)) return undefined;

  const clean = history
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return Array.from(
    new Map(clean.map((item) => [item.toLowerCase(), item])).values()
  ).slice(0, 6);
}

export async function GET() {
  const preferences = await getUserPreferences();

  return NextResponse.json(preferences);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<UserPreferences>;
  const current = await getUserPreferences();

  const nextPreferences: UserPreferences = {
    ...current,

    style: body.style ?? current.style,
    limit: body.limit ?? current.limit,
    history: uniqueHistory(body.history) ?? current.history ?? [],

    globalInstructions:
      body.globalInstructions ?? current.globalInstructions ?? [],

    chatInstructions:
      body.chatInstructions ?? current.chatInstructions ?? [],

    summaryInstructions:
      body.summaryInstructions ?? current.summaryInstructions ?? [],
  };

  await saveUserPreferences(nextPreferences);

  return NextResponse.json(nextPreferences);
}