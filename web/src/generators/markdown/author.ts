import path from "node:path";

import {
  ensureDir,
  writeFile,
} from "../shared/filesystem";

import {
  generateAuthorMarkdown,
} from "./templates";

import type {
  GeneratedAuthorProject,
} from "../shared/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateAuthorMarkdownFiles(
  data: GeneratedAuthorProject
) {
  const outputDir = path.join(
    process.cwd(),
    "content/authors"
  );

  ensureDir(outputDir);

  const slug = slugify(
    data.author.name
  );

  const markdown =
    generateAuthorMarkdown(data);

  const outputPath = path.join(
    outputDir,
    `${slug}.md`
  );

  writeFile(outputPath, markdown);

  return outputPath;
}