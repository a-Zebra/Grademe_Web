import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { findSubjectsRoot } from "@/lib/grademe-path";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const subjectsRoot = await findSubjectsRoot();
    if (!subjectsRoot) {
      return NextResponse.json(
        { error: "Grademe system not found" },
        { status: 500 }
      );
    }

    const grademeRoot = path.dirname(subjectsRoot);

    // Clean up rendu directory
    const renduPath = path.join(grademeRoot, "rendu");
    await fs.rm(renduPath, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(renduPath, { recursive: true }).catch(() => {});

    // Clean up grading directory
    const gradingPath = path.join(grademeRoot, ".system", "grading");
    await fs.rm(gradingPath, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(gradingPath, { recursive: true }).catch(() => {});

    // Clean up traceback
    const tracebackPath = path.join(grademeRoot, "traceback");
    await fs.unlink(tracebackPath).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "All temporary data cleared successfully.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to cleanup data", details: err.message },
      { status: 500 }
    );
  }
}
