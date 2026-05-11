import debug from "@aganitha/atk-debug";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { config } from "../config";

const log = debug("book-cli:llm");

// create Gemini provider via AI SDK
const google = createGoogleGenerativeAI({
  apiKey: config.get("geminiApiKey"),
});

export async function summarizeBook(title: string) {
  log("Summarizing book %s", title);

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash-lite"), // ✅ working free model
      prompt: `Summarize the book "${title}" in 5 lines.`,
    });

    log("LLM response %s", text);

    return text || "No summary generated.";
  } catch (err) {
    log("LLM error %O", err);

    return `📖 ${title} is a notable literary work.`;
  }
}