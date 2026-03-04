import { mkdir, readdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const sourceRoot = path.join(projectRoot, "src", "data");
const targetRoot = path.join(projectRoot, "build", "data");

async function collectDotfiles(directory, rootDirectory = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const childFiles = await collectDotfiles(absolutePath, rootDirectory);
      files.push(...childFiles);
      continue;
    }

    if (entry.isFile() && entry.name.startsWith(".")) {
      files.push(path.relative(rootDirectory, absolutePath));
    }
  }

  return files;
}

async function main() {
  const dotfiles = await collectDotfiles(sourceRoot);

  await Promise.all(
    dotfiles.map(async (relativePath) => {
      const sourceFilePath = path.join(sourceRoot, relativePath);
      const targetFilePath = path.join(targetRoot, relativePath);

      await mkdir(path.dirname(targetFilePath), { recursive: true });
      await copyFile(sourceFilePath, targetFilePath);
    }),
  );

  console.log(
    `Copied ${dotfiles.length} dotfile(s) from src/data to build/data.`,
  );
}

main().catch((error) => {
  console.error("Failed to copy data dotfiles:", error);
  process.exit(1);
});
