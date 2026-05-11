import pino from "pino";
import { config } from "./config";

export const logger = pino({
  level: config.get("logLevel"),
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty" }
      : undefined,
});