import fs from "node:fs";
import path from "node:path";

import { exec } from "node:child_process";
import { promisify } from "node:util";

import { generateAuthorMarkdownFiles } from "../markdown/author";

const execAsync = promisify(exec);

import type { GeneratedAuthorProject } from "../shared/types";

function compareVersions(a: string, b: string) {
  const [aMajor, aMinor, aPatch] = a.split(".").map(Number);
  const [bMajor, bMinor, bPatch] = b.split(".").map(Number);

  if (aMajor !== bMajor) return aMajor - bMajor;
  if (aMinor !== bMinor) return aMinor - bMinor;
  return aPatch - bPatch;
}

export async function generateAstroSite(
  input: GeneratedAuthorProject,
) {
  // First, generate markdown files to content/authors
  await generateAuthorMarkdownFiles(input);

  const astroRoot = path.join(
    process.cwd(),
    "astro-site",
  );

  // Copy markdown files from content/authors to astro-site/src/content/authors
  const sourceAuthorsDir = path.join(
    process.cwd(),
    "content/authors"
  );
  
  const destAuthorsDir = path.join(
    astroRoot,
    "src/content/authors"
  );

  if (fs.existsSync(sourceAuthorsDir)) {
    if (!fs.existsSync(destAuthorsDir)) {
      fs.mkdirSync(destAuthorsDir, { recursive: true });
    }
    
    const files = fs.readdirSync(sourceAuthorsDir);
    for (const file of files) {
      const sourcePath = path.join(sourceAuthorsDir, file);
      const destPath = path.join(destAuthorsDir, file);
      fs.copyFileSync(sourcePath, destPath);
    }
  }

  const nodeVersionResult = await execAsync("node --version").catch(() => null);
  const nodeVersion = nodeVersionResult?.stdout
    ? nodeVersionResult.stdout.trim().replace(/^v/, "")
    : null;

  const astroDist = path.join(astroRoot, "dist");

  if (!nodeVersion || compareVersions(nodeVersion, "22.12.0") < 0) {
    return `Astro site content prepared at ${astroRoot}. Build skipped because Node.js ${nodeVersion ?? "unknown"} is unsupported.`;
  }

  const astroCli = path.join(
    astroRoot,
    "node_modules",
    ".bin",
    "astro",
  );

  await execAsync(
    `node ${astroCli} build`,
    {
      cwd: astroRoot,
    },
  );

  return astroDist;
}