import fs from "node:fs";
import path from "node:path";

import PptxGenJS from "pptxgenjs";

import type {
  GeneratedAuthorProject,
} from "../shared/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generatePpt(
  data: GeneratedAuthorProject
) {
  const ppt = new PptxGenJS();

  const titleSlide = ppt.addSlide();
  titleSlide.addText(data.author.name, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 1,
    fontSize: 32,
    bold: true,
  });
  titleSlide.addText(data.author.bio, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 2,
    fontSize: 18,
  });

  for (const book of data.books) {
    const slide = ppt.addSlide();
    slide.addText(book.title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 1,
      fontSize: 26,
      bold: true,
    });
    slide.addText(`Year: ${book.year ?? "Unknown"}`, {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 0.5,
      fontSize: 16,
      color: "363636",
    });
    slide.addText(book.summary || "No summary available.", {
      x: 0.5,
      y: 2.1,
      w: 9,
      h: 4,
      fontSize: 16,
      color: "363636",
      wrap: true,
    });
  }

  const outputDir = path.join(process.cwd(), "output/ppt");
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(
    outputDir,
    `${slugify(data.author.name)}.pptx`
  );

  await ppt.writeFile({
    fileName: outputPath,
  });

  return outputPath;
}