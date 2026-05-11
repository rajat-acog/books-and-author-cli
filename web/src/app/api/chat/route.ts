import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
    getChatPromptInstructions,
    getUserPreferences,
    savePreferenceFromChatMessage,
} from "@/lib/preferences";

function getLastUserMessage(messages: UIMessage[]) {
    const lastUserMessage = [...messages]
        .reverse()
        .find((message) => message.role === "user");

    if (!lastUserMessage) return "";

    return lastUserMessage.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("\n");
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const messages = body.messages;

        if (!Array.isArray(messages)) {
            return Response.json(
                { error: "Invalid chat request. messages must be an array." },
                { status: 400 }
            );
        }

        const userMessage = getLastUserMessage(messages);

        if (userMessage) {
            await savePreferenceFromChatMessage(userMessage);
        }

        const preferences = await getUserPreferences();
        const chatInstructions = getChatPromptInstructions(preferences);

        const instructionText = chatInstructions.length
            ? chatInstructions.map((item) => `- ${item}`).join("\n")
            : "";

        const result = streamText({
            model: google("gemini-2.5-flash-lite"),
            system: `
You are Bookflix Assistant.

CRITICAL RULES (STRICTLY FOLLOW):

1. Language rule has HIGHEST PRIORITY.
2. If user wants Hindi → ALL replies MUST be ONLY in Hindi.
3. Do NOT use English unless explicitly asked.

4. Style rule comes SECOND:
   - If pirate style is requested → apply pirate tone in Hindi.

5. NEVER ignore user saved instructions.

User saved instructions:
${instructionText || "None"}

Behavior examples:
- Hindi + pirate → Hindi language with pirate tone
- Hindi only → pure Hindi
- Pirate only → pirate English

Violation of language rule is NOT allowed.

Keep replies short and helpful.
`,
            messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse();
    } catch (err) {
        console.error("CHAT_API_ERROR", err);

        return Response.json(
            { error: "Chat failed. Check GEMINI_API_KEY or server logs." },
            { status: 500 }
        );
    }
}