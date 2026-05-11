import fs from "node:fs";
import path from "node:path";

import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
} from "docx";

import type {
  GeneratedAuthorProject,
} from "../shared/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateDocx(
  data: GeneratedAuthorProject
) {
  const children = [
    new Paragraph({
      text: data.author.name,
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      text: data.author.bio,
    }),
  ];

  for (const book of data.books) {
    children.push(
      new Paragraph({
        text: book.title,
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Summary: ", bold: true }),
          new TextRun(book.summary || "No summary available."),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Year: ", bold: true }),
          new TextRun(book.year ? String(book.year) : "Unknown"),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Description: ", bold: true }),
          new TextRun(book.description || "No description available."),
        ],
      }),
    );
  }

  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  const outputPath = path.join(
    process.cwd(),
    "output/docx",
    `${slugify(data.author.name)}.docx`
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
}