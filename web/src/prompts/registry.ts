type PromptCategory =
    | "summary"
    | "chat"
    | "recommendation";

type PromptRegistry = {
    default: string;
    gemini?: string;
};

import { summaryDefaultPrompt } from "./summary/default";
import { summaryGeminiPrompt } from "./summary/gemini";

import { chatDefaultPrompt } from "./chat/default";
import { chatGeminiPrompt } from "./chat/gemini";

import { recommendationDefaultPrompt } from "./recommendation/default";
import { recommendationGeminiPrompt } from "./recommendation/gemini";

const registry: Record<PromptCategory, PromptRegistry> = {
    summary: {
        default: summaryDefaultPrompt,
        gemini: summaryGeminiPrompt,
    },

    chat: {
        default: chatDefaultPrompt,
        gemini: chatGeminiPrompt,
    },

    recommendation: {
        default: recommendationDefaultPrompt,
        gemini: recommendationGeminiPrompt,
    },
};

export function getPrompt(
    category: PromptCategory,
    model: string
) {
    const prompts = registry[category];

    if (model.includes("gemini") && prompts.gemini) {
        return prompts.gemini;
    }

    return prompts.default;
}