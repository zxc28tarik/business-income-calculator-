import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAllStandalone } from "./build-standalone.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const STANDALONE = path.join(ROOT, "standalone");

async function copyFile(relativePath) {
  const source = path.join(ROOT, relativePath);
  const target = path.join(DIST, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target);
}

export async function buildProduction(outputDir = DIST) {
  await buildAllStandalone(STANDALONE);
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  for (const file of ["index.html", "styles.css", "styles-advanced.css", "LICENSE"]) {
    const source = path.join(ROOT, file);
    const target = path.join(outputDir, file);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(source, target);
  }
  await cp(path.join(ROOT, "src"), path.join(outputDir, "src"), { recursive: true });
  await cp(STANDALONE, path.join(outputDir, "standalone"), { recursive: true });

  const indexHtml = await readFile(path.join(ROOT, "index.html"), "utf8");
  await writeFile(path.join(outputDir, "404.html"), indexHtml, "utf8");
  await writeFile(path.join(outputDir, ".nojekyll"), "", "utf8");
  await writeFile(path.join(outputDir, "build-info.json"), `${JSON.stringify({
    application: "business-income-calculator",
    version: "0.24.1",
    format: "static-es-modules",
    standaloneCalculators: 8,
  }, null, 2)}\n`, "utf8");

  return outputDir;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const output = await buildProduction();
  console.log(`Production site built at ${output}`);
}
