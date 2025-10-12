import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { findSubjectsRoot } from "@/lib/grademe-path";

export const dynamic = "force-dynamic";

async function readSubjectMarkdown(dir) {
  const files = await fs.readdir(dir);
  const md = files.find((f) => f.endsWith(".md") || f.endsWith(".txt"));
  if (!md) return null;
  const content = await fs.readFile(path.join(dir, md), "utf8");
  const html = content
    .split("\n")
    .map((l) =>
      l.startsWith("#") ? `<h3>${l.replace(/^#+\s*/, "")}</h3>` : `<p>${l}</p>`
    )
    .join("\n");
  return html;
}

export async function GET(_req, { params }) {
  const root = await findSubjectsRoot();
  if (!root)
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  const base = path.join(root, params.exam, params.id);
  const markdown = await readSubjectMarkdown(base).catch(() => null);
  if (!markdown)
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  return NextResponse.json({ exam: params.exam, id: params.id, markdown });
}
