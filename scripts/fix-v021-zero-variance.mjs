import { readFile, writeFile } from "node:fs/promises";

const file = "src/tracking/tracking-model.js";
let content = await readFile(file, "utf8");
content = content.replace(
  `function percentVariance(variance, plan) {\n  if (variance == null || !Number.isFinite(plan) || Math.abs(plan) < 1e-9) return null;\n  return variance / Math.abs(plan);\n}`,
  `function percentVariance(variance, plan) {\n  if (variance == null || !Number.isFinite(plan)) return null;\n  if (Math.abs(plan) < 1e-9) return Math.abs(variance) < 1e-9 ? 0 : null;\n  return variance / Math.abs(plan);\n}`,
);
await writeFile(file, content, "utf8");
console.log("Sıfır plan ve sıfır gerçekleşen yüzde 0 sapma olarak sınıflandırıldı.");
