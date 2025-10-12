import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { findSubjectsRoot } from "@/lib/grademe-path";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const root = await findSubjectsRoot();
  if (!root)
    return NextResponse.json({ error: "No exercises found" }, { status: 404 });

  const base = path.join(root, params.exam, params.examNum);

  // Get all exercises from level 0
  const level0Path = path.join(base, "0");
  const exerciseDirs = await fs
    .readdir(level0Path, { withFileTypes: true })
    .catch(() => []);

  const exercises = exerciseDirs
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  if (exercises.length === 0) {
    return NextResponse.json({ error: "No exercises found" }, { status: 404 });
  }

  // Pick a random exercise from level 0
  const randomExercise =
    exercises[Math.floor(Math.random() * exercises.length)];

  return NextResponse.json({
    level: "0",
    exercise: randomExercise,
  });
}
