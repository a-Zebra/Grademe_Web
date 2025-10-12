import fs from "node:fs/promises";
import path from "node:path";

export async function findSubjectsRoot() {
  const candidates = [
    process.env.GRADEME_PATH &&
      path.join(process.env.GRADEME_PATH, ".subjects"),
    path.resolve(process.cwd(), "..", "grademe", ".subjects"),
    path.resolve(process.cwd(), "..", "Grademe-edu", ".subjects"),
    path.resolve(process.cwd(), "grademe", ".subjects"),
    path.resolve(process.cwd(), "Grademe-edu", ".subjects"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat && stat.isDirectory()) return candidate;
    } catch (_) {}
  }
  return null;
}
