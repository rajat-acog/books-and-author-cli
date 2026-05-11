import { loadConfig } from "@aganitha/atk-config";

export const config = await loadConfig({
  appName: "book-cli",

  schema: {
    geminiApiKey: {
      format: String,
      default: "",
      env: "GEMINI_API_KEY",
      sensitive: true,
    },

    maxBooks: {
      format: "nat",
      default: 5,
    },

    logLevel: {
      format: ["debug", "info", "warn", "error"] as const,
      default: "info",
    },
  },
});