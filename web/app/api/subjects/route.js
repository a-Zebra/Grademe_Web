import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const base = path.resolve(process.cwd(), "..", "grademe", ".subjects");
    const entries = await fs.readdir(base, { withFileTypes: true });
    const ids = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    return NextResponse.json({ ids });
  } catch (err) {
    return NextResponse.json(
      { error: "Subjects unavailable" },
      { status: 500 }
    );
  }
}
