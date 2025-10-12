import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { findSubjectsRoot } from "@/lib/grademe-path";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  const currentLevel = searchParams.get("level");
  const currentExercise = searchParams.get("exercise");

  const root = await findSubjectsRoot();
  if (!root) return NextResponse.json({ nextExercise: null });

  const base = path.join(root, params.exam, params.examNum);
  const levelDirs = await fs
    .readdir(base, { withFileTypes: true })
    .catch(() => []);

  // Get all exercises sorted by level
  const allExercises = [];
  for (const levelDir of levelDirs.filter((e) => e.isDirectory())) {
    const levelPath = path.join(base, levelDir.name);
    const exerciseDirs = await fs
      .readdir(levelPath, { withFileTypes: true })
      .catch(() => []);

    for (const exerciseDir of exerciseDirs.filter((e) => e.isDirectory())) {
      allExercises.push({
        level: levelDir.name,
        name: exerciseDir.name,
        levelNum: parseInt(levelDir.name, 10) || 0,
      });
    }
  }

  // Sort by level number
  allExercises.sort((a, b) => a.levelNum - b.levelNum);

  // Find current exercise index
  const currentIndex = allExercises.findIndex(
    (ex) => ex.level === currentLevel && ex.name === currentExercise
  );

  if (currentIndex === -1) {
    // Current exercise not found, return first of next level
    const nextLevelNum = parseInt(currentLevel, 10) + 1;
    const nextLevelExercises = allExercises.filter(
      (ex) => ex.levelNum === nextLevelNum
    );
    if (nextLevelExercises.length > 0) {
      return NextResponse.json({ nextExercise: nextLevelExercises[0] });
    }
    return NextResponse.json({ nextExercise: null });
  }

  // Find next level exercises
  const currentLevelNum = allExercises[currentIndex].levelNum;
  const nextLevelNum = currentLevelNum + 1;
  const nextLevelExercises = allExercises.filter(
    (ex) => ex.levelNum === nextLevelNum
  );

  if (nextLevelExercises.length > 0) {
    // Pick a random exercise from next level
    const randomExercise =
      nextLevelExercises[Math.floor(Math.random() * nextLevelExercises.length)];
    return NextResponse.json({ nextExercise: randomExercise });
  }

  // No more exercises
  return NextResponse.json({ nextExercise: null });
}
