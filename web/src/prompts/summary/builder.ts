import { summaryStyles } from "./styles";

import { buildPreferencesPrompt } from "../shared/preferences";

type SummaryOptions = {
    length?: "short" | "medium" | "long";
    format?: "paragraph" | "bullet" | "points";
    sourceDescription?: string;
    userPreferences?: string[];
};

export function buildSummaryPrompt(
    title: string,
    style?: string,
    options?: SummaryOptions,
    author?: string
) {
    const bookRef = author
        ? `"${title}" by ${author}`
        : `"${title}"`;

    const styleTemplate =
        summaryStyles[style || ""] ||
        summaryStyles.default;

    let prompt = styleTemplate.replace(
        "{bookRef}",
        bookRef
    );

    prompt += `

If multiple books exist with the same title,
summarize ONLY the version written by the specified author.
Never summarize a different book with the same title.
`;

    if (options?.sourceDescription) {
        prompt += `

Use this verified book description as the source of truth.

Verified description:
${options.sourceDescription}
`;
    }

    if (options?.userPreferences?.length) {
        prompt += `

${buildPreferencesPrompt(
            options.userPreferences
        )}

Apply these preferences while generating the summary.
`;
    }

    if (options?.length) {
        switch (options.length) {
            case "short":
                prompt += `
Keep the summary very concise.
`;
                break;

            case "medium":
                prompt += `
Keep the summary moderately detailed.
`;
                break;

            case "long":
                prompt += `
Provide a detailed summary.
`;
                break;
        }
    }

    if (options?.format) {
        switch (options.format) {
            case "bullet":
                prompt += `
Format the output as bullet points.
`;
                break;

            case "points":
                prompt += `
Format the output as numbered points.
`;
                break;

            case "paragraph":
                prompt += `
Format the output as a paragraph.
`;
                break;
        }
    }

    return prompt;
}