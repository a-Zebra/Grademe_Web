import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import { findSubjectsRoot } from "@/lib/grademe-path";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = await findSubjectsRoot();
  if (!base)
    return NextResponse.json({
      exams: [],
      warning:
        "No .subjects found. Set GRADEME_PATH or place the repo alongside web/",
    });
  const entries = await fs.readdir(base, { withFileTypes: true });
  const exams = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  return NextResponse.json({ exams });
}
