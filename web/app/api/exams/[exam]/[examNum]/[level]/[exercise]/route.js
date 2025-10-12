import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { findSubjectsRoot } from "@/lib/grademe-path";

export const dynamic = "force-dynamic";

async function readSubjectFile(dir) {
  const attachmentDir = path.join(dir, "attachment");
  try {
    const files = await fs.readdir(attachmentDir);
    const subjectFile = files.find(
      (f) => f.endsWith(".txt") || f.endsWith(".md")
    );
    if (!subjectFile) return null;
    const content = await fs.readFile(
      path.join(attachmentDir, subjectFile),
      "utf8"
    );
    return content;
  } catch {
    return null;
  }
}

export async function GET(_req, { params }) {
  const root = await findSubjectsRoot();
  if (!root)
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });

  const exercisePath = path.join(
    root,
    params.exam,
    params.examNum,
    params.level,
    params.exercise
  );

  const content = await readSubjectFile(exercisePath);
  if (!content)
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });

  return NextResponse.json({
    examType: params.exam,
    examNum: params.examNum,
    level: params.level,
    exercise: params.exercise,
    content,
  });
}
