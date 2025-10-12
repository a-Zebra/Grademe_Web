import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { findSubjectsRoot } from "@/lib/grademe-path";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const root = await findSubjectsRoot();
  if (!root) return NextResponse.json({ exam: params.exam, subjects: [] });
  const base = path.join(root, params.exam);
  const entries = await fs
    .readdir(base, { withFileTypes: true })
    .catch(() => []);
  const subjects = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  return NextResponse.json({ exam: params.exam, subjects });
}
