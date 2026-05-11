import debug from "@aganitha/atk-debug";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

const log = debug("book-cli:llm");

type SummaryOptions = {
  length?: "short" | "medium" | "long";
  format?: "paragraph" | "bullet" | "points";
  sourceDescription?: string;
  userPreferences?: string[];
};

function buildPrompt(
  title: string,
  style?: string,
  options?: SummaryOptions,
  author?: string
) {
  let basePrompt = "";

  const bookRef = author ? `"${title}" by ${author}` : `"${title}"`;

  switch (style) {
    case "pirate":
      basePrompt = `Summarize the book ${bookRef} like a pirate speaking. Make it fun and dramatic.`;
      break;

    case "haiku":
      basePrompt = `Summarize the book ${bookRef} as a haiku.`;
      break;

    case "shashi tharoor":
      basePrompt = `Summarize the book ${bookRef} in an eloquent and sophisticated style.`;
      break;

    case "drseuss":
      basePrompt = `Summarize the book ${bookRef} in a playful rhyming style.`;
      break;

    case "funny":
      basePrompt = `Summarize the book ${bookRef} in a humorous and witty way.`;
      break;

    default:
      basePrompt = `Summarize the book ${bookRef} in simple language.`;
  }

  basePrompt +=
    " If multiple books have this title, summarize only the one written by the specified author.";

  if (options?.sourceDescription) {
    basePrompt += `

Use this verified book description as the source of truth.
Do not summarize a different book with the same title.

Verified description:
${options.sourceDescription}
`;
  }

  if (options?.userPreferences?.length) {
    basePrompt += `

User saved summary instructions:
${options.userPreferences.map((item) => `- ${item}`).join("\n")}

Follow these instructions while writing the summary.
`;
  }

  if (options?.length) {
    switch (options.length) {
      case "short":
        basePrompt += " Keep it very concise.";
        break;
      case "medium":
        basePrompt += " Keep it moderately detailed.";
        break;
      case "long":
        basePrompt += " Provide a detailed summary.";
        break;
    }
  } else {
    basePrompt += " Keep it around 3-4 lines unless user preferences say otherwise.";
  }

  if (options?.format) {
    switch (options.format) {
      case "bullet":
        basePrompt += " Format the output as bullet points.";
        break;
      case "points":
        basePrompt += " Format the output as numbered points.";
        break;
      case "paragraph":
        basePrompt += " Format the output as a paragraph.";
        break;
    }
  }

  return basePrompt;
}

export async function summarizeBook(
  title: string,
  style?: string,
  options?: SummaryOptions,
  author?: string
) {
  log("Summarizing book %s with style %s and options %O", title, style, options);

  try {
    const prompt = buildPrompt(title, style, options, author);

    const result = await generateText({
      model: google("gemini-2.5-flash-lite"),
      prompt,
    });

    return result.text;
  } catch (err) {
    log("LLM error %O", err);
    return `"${title}" is a notable literary work.`;
  }
}