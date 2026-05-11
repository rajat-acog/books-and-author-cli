#!/usr/bin/env node

import { Command } from "commander";
import { searchCommand } from "./commands/search";
import { summaryCommand } from "./commands/summary";
import { randomCommand } from "./commands/random";
import { generateCommand } from "./commands/generate";

const program = new Command();

program
  .name("book-cli")
  .description("📚 CLI to search books and generate summaries")
  .version("1.0.0");

// 🔍 SEARCH
program
  .command("search")
  .alias("s")
  .description("Search books by author or title")
  .option("--author <name>", "Author name")
  .option("--title <title>", "Book title")
  .option("--limit <number>", "Limit number of results", "5")
  .option("--json", "Output in JSON format")
  .action(searchCommand);

// 📖 SUMMARY
program
  .command("summary").alias("sum")
  .description("Get summary of a specific book")
  .requiredOption("--title <title>", "Book title")
  .option("--author <name>", "Author name")
  .option("--style <style>", "Summary style (funny, pirate, haiku, etc.)")
  .option("--json", "Output in JSON format")
  .action(summaryCommand);

// 🎲 RANDOM
program
  .command("random").alias("r")
  .description("Get a random book and its summary")
  .requiredOption("--author <name>", "Author name")
  .option("--style <style>", "Summary style")
  .action(randomCommand);

program
  .command("generate")
  .alias("g")
  .description(
    "Generate author projects"
  )
  .requiredOption("--author <name>", "Author name")
  .requiredOption("--format <format>", "Output format (markdown, docx, ppt, astro)")
  .action(generateCommand);

program.addHelpText(
  "after",
  `
📌 All Commands & Options:

🔍 search
  --author <name>       Author name
  --limit <number>      Limit results
  --json                JSON output

📖 summary
  --title <title>       Book title
  --author <name>       Author name
  --style <style>       funny | pirate | haiku
  --json                JSON output
  
🎲 random
  --author <name>       Author name
  --style <style>       Summary style

📌 Examples:
  $ book-cli search --author "Rowling"
  $ book-cli summary --title "Harry Potter"
`
);

program.parse();
