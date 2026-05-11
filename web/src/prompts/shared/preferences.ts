export function buildPreferencesPrompt(
    preferences: string[]
) {
    if (!preferences.length) {
        return "";
    }

    return `
User preferences:
${preferences.map((p) => `- ${p}`).join("\n")}
`;
}