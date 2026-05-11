import debug from "@aganitha/atk-debug";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { getPrompt } from "@/prompts/registry";

import { buildSummaryPrompt } from "@/prompts/summary/builder";

const log = debug("book-cli:llm");

type SummaryOptions = {
  length?: "short" | "medium" | "long";
  format?: "paragraph" | "bullet" | "points";
  sourceDescription?: string;
  userPreferences?: string[];
};

const MODEL_NAME = "gemini-2.5-flash-lite";

export async function summarizeBook(
  title: string,
  style?: string,
  options?: SummaryOptions,
  author?: string
) {
  log(
    "Summarizing book %s with style %s and options %O",
    title,
    style,
    options
  );

  try {
    const systemPrompt = getPrompt(
      "summary",
      MODEL_NAME
    );

    const prompt =
      buildSummaryPrompt(
        title,
        style,
        options,
        author
      );

    const result = await generateText({
      model: google(MODEL_NAME),

      system: systemPrompt,

      prompt,
    });

    return result.text;
  } catch (err) {
    log("LLM error %O", err);

    return `"${title}" is a notable literary work.`;
  }
}