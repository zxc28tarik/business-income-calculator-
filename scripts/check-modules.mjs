import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(path));
    else if (entry.isFile() && entry.name.endsWith(".js") && !path.endsWith(`${resolve("src", "app.js")}`)) files.push(path);
  }
  return files;
}

const files = await collect("src");
for (const file of files.sort()) await import(pathToFileURL(file).href);
console.log(`${files.length} kaynak modülü doğrulandı.`);
