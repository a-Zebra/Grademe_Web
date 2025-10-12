import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { findSubjectsRoot } from "@/lib/grademe-path";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const root = await findSubjectsRoot();
  if (!root) return NextResponse.json({ examNumbers: [] });
  const base = path.join(root, params.exam);
  const entries = await fs
    .readdir(base, { withFileTypes: true })
    .catch(() => []);
  const examNumbers = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  return NextResponse.json({ examType: params.exam, examNumbers });
}
