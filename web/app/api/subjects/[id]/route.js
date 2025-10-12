import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

async function readSubjectMarkdown(dir) {
  const files = await fs.readdir(dir);
  const md = files.find((f) => f.endsWith(".md") || f.endsWith(".txt"));
  if (!md) return null;
  const content = await fs.readFile(path.join(dir, md), "utf8");
  // naive markdown to HTML for now
  const html = content
    .split("\n")
    .map((l) =>
      l.startsWith("#") ? `<h3>${l.replace(/^#+\s*/, "")}</h3>` : `<p>${l}</p>`
    )
    .join("\n");
  return html;
}

export async function GET(_req, { params }) {
  try {
    const base = path.resolve(
      process.cwd(),
      "..",
      "grademe",
      ".subjects",
      params.id
    );
    const markdown = await readSubjectMarkdown(base);
    return NextResponse.json({ id: params.id, markdown });
  } catch (err) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }
}
