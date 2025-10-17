import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { findSubjectsRoot } from "@/lib/grademe-path";

export const dynamic = "force-dynamic";

async function findSolutionFile(dir, exerciseName) {
  try {
    const files = await fs.readdir(dir);
    // Look for files matching the exercise name with common C/C++ extensions
    const solutionFile = files.find(
      (f) =>
        f === `${exerciseName}.c` ||
        f === `${exerciseName}.cpp` ||
        f === `${exerciseName}.h` ||
        f === `${exerciseName}.hpp`
    );

    if (!solutionFile) return null;

    const content = await fs.readFile(path.join(dir, solutionFile), "utf8");
    return { content, filename: solutionFile };
  } catch {
    return null;
  }
}

export async function GET(_req, { params }) {
  const root = await findSubjectsRoot();
  if (!root)
    return NextResponse.json({ error: "Solution not found" }, { status: 404 });

  // Solution path follows the pattern: /stud_part/exam_02/0/first_word/
  const solutionPath = path.join(
    root,
    params.exam,
    params.examNum,
    params.level,
    params.exercise
  );

  const solution = await findSolutionFile(solutionPath, params.exercise);
  if (!solution)
    return NextResponse.json({ error: "Solution not found" }, { status: 404 });

  return NextResponse.json({
    examType: params.exam,
    examNum: params.examNum,
    level: params.level,
    exercise: params.exercise,
    filename: solution.filename,
    content: solution.content,
  });
}
