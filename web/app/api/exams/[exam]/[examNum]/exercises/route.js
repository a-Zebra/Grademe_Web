import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { findSubjectsRoot } from "@/lib/grademe-path";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const root = await findSubjectsRoot();
  if (!root) return NextResponse.json({ exercises: [] });

  const base = path.join(root, params.exam, params.examNum);
  const levelDirs = await fs
    .readdir(base, { withFileTypes: true })
    .catch(() => []);

  const exercises = [];
  for (const levelDir of levelDirs.filter((e) => e.isDirectory())) {
    const levelPath = path.join(base, levelDir.name);
    const exerciseDirs = await fs
      .readdir(levelPath, { withFileTypes: true })
      .catch(() => []);

    for (const exerciseDir of exerciseDirs.filter((e) => e.isDirectory())) {
      exercises.push({
        level: levelDir.name,
        name: exerciseDir.name,
        path: `${levelDir.name}/${exerciseDir.name}`,
      });
    }
  }

  return NextResponse.json({ exercises });
}
