#!/usr/bin/env bun

import { Command } from "commander";
import debug from "@aganitha/atk-debug";
import { logger } from "./logger";
import { getBooksByAuthor } from "./services/books";
import { summarizeBook } from "./services/llm";

const log = debug("book-cli:cli");

const program = new Command();

program
  .name("book-cli")
  .description("Search books and summarize them");

program
  .command("books")
  .option("--author <name>", "Author name")
  .action(async (opts) => {
    try {
      log("CLI started %O", opts);

      if (!opts.author) {
        logger.error("Author is required");
        return;
      }

      const books = await getBooksByAuthor(opts.author);

      logger.info(
        { count: books.length, author: opts.author },
        "Books fetched"
      );

      for (const book of books) {
        log("Processing book %O", book);

        try {
          const summary = await summarizeBook(book.title);

          console.log("\n📖", book.title);
          console.log(summary);
        } catch (err) {
          logger.error({ err, title: book.title }, "Failed to summarize book");
        }
      }

      logger.info("Done");
    } catch (err) {
      logger.error({ err }, "CLI execution failed");
    }
  });

program.parse();