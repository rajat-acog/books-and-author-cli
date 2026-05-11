import fs from "node:fs";
import path from "node:path";

export function ensureDir(dir: string) {
    fs.mkdirSync(dir, { recursive: true });
}

export function writeFile(
    filepath: string,
    content: string
) {
    ensureDir(path.dirname(filepath));

    fs.writeFileSync(filepath, content, "utf-8");
}