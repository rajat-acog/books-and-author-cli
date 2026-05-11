import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const authors = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/authors",
  }),

  schema: z.object({
    name: z.string(),

    bio: z.string(),

    books: z.array(
      z.object({
        title: z.string(),

        year: z.number().optional(),

        summary: z.string(),

        coverUrl: z.string().optional(),
      }),
    ),
  }),
});

const books = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/books",
  }),

  schema: z.object({
    title: z.string(),
    author: z.string(),
    summary: z.string(),
    year: z.number().optional(),
    coverUrl: z.string().optional(),
  }),
});

export const collections = {
  authors,
  books,
};