import ora from "ora";

import { buildAuthorProject } from "@/generators/shared/build-author-project";

import { generateDocx } from "@/generators/docx/generate-docx";

import { generatePpt } from "@/generators/ppt/generate-ppt";

import { generateAuthorMarkdownFiles } from "@/generators/markdown/author";

import { generateAstroSite } from "@/generators/astro/generate-site";

import { findAuthorMarkdown, readAuthorMarkdown } from "@/generators/shared/markdown-reader";

type GenerateOptions = {
    author: string;
    format: "docx" | "ppt" | "astro" | "markdown";
};

export async function generateCommand(
    options: GenerateOptions
) {
    const spinner =
        ora("Generating project...").start();

    try {
        let project;
        let mdPath = findAuthorMarkdown(options.author);

        if (mdPath) {
            project = readAuthorMarkdown(mdPath);
        } else {
            project = await buildAuthorProject(options.author);
            mdPath = await generateAuthorMarkdownFiles(project);
        }

        if (options.format === "markdown") {
            // If the caller asked for markdown, return the persisted file path.
            console.log(mdPath);
            spinner.succeed("Generated successfully");
            return;
        }

        // safety checks
        if (!project?.author?.name) {
            throw new Error(
                "Author data could not be generated"
            );
        }

        if (
            !project?.books ||
            !Array.isArray(project.books)
        ) {
            throw new Error(
                "Books data missing"
            );
        }

        let output = "";

        switch (options.format) {
            case "markdown":
                output =
                    await generateAuthorMarkdownFiles(
                        project
                    );
                break;

            case "docx":
                output =
                    await generateDocx(project);
                break;

            case "ppt":
                output =
                    await generatePpt(project);
                break;

            case "astro":
                output =
                    await generateAstroSite(
                        project
                    );
                break;

            default:
                throw new Error(
                    "Unsupported format"
                );
        }

        spinner.succeed(
            "Generated successfully"
        );

        console.log(output);
    } catch (err) {
        spinner.fail("Generation failed");

        console.error(err);
    }
}