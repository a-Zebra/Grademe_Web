import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { findSubjectsRoot } from "@/lib/grademe-path";

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        error: "Grading not supported on Vercel runtime. Use external runner.",
      },
      { status: 501 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.subjectId || typeof body.code !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Parse subjectId: "exam_01/0/aff_a" or similar
  const parts = body.subjectId.split("/");
  if (parts.length < 3) {
    return NextResponse.json({ error: "Invalid subject ID" }, { status: 400 });
  }

  const [examNum, level, exerciseName] = parts;

  // Find grademe root
  const subjectsRoot = await findSubjectsRoot();
  if (!subjectsRoot) {
    return NextResponse.json(
      { error: "Grademe system not found" },
      { status: 500 }
    );
  }

  const grademeRoot = path.dirname(subjectsRoot);

  // Get exercise details to find the correct file extension
  const exercisePath = path.join(
    subjectsRoot,
    body.examId,
    examNum,
    level,
    exerciseName
  );

  const files = await fs.readdir(exercisePath).catch(() => []);
  const sourceFile = files.find((f) => f.endsWith(".c") || f.endsWith(".cpp"));

  if (!sourceFile) {
    return NextResponse.json(
      { error: "No source file template found" },
      { status: 404 }
    );
  }

  const fileExt = path.extname(sourceFile);
  const outputFile = exerciseName + fileExt;

  // Create rendu directory structure: rendu/{exerciseName}/{file}
  const renduPath = path.join(grademeRoot, "rendu", exerciseName);
  await fs.mkdir(renduPath, { recursive: true });

  // Write user's code to rendu path
  const userFilePath = path.join(renduPath, outputFile);
  await fs.writeFile(userFilePath, body.code, "utf8");

  // Copy reference solution to .system/grading/
  const gradingPath = path.join(grademeRoot, ".system", "grading");
  await fs.mkdir(gradingPath, { recursive: true });

  const refSolutionSrc = path.join(exercisePath, sourceFile);
  const refSolutionDest = path.join(gradingPath, sourceFile);
  await fs.copyFile(refSolutionSrc, refSolutionDest);

  // Copy any additional files needed (like main.c)
  const additionalFiles = files.filter(
    (f) => f.endsWith(".c") || f.endsWith(".cpp") || f.endsWith(".h")
  );
  for (const file of additionalFiles) {
    if (file !== sourceFile) {
      const src = path.join(exercisePath, file);
      const dest = path.join(gradingPath, file);
      await fs.copyFile(src, dest).catch(() => {});
    }
  }

  // Run the tester script
  const testerScript = path.join(exercisePath, "tester.sh");
  const testerExists = await fs
    .access(testerScript)
    .then(() => true)
    .catch(() => false);

  if (!testerExists) {
    return NextResponse.json(
      { output: "✓ Code saved, but no tester available for this exercise." },
      { status: 200 }
    );
  }

  // Execute tester
  const output = await runTester(testerScript, grademeRoot);

  // Check if passed file exists (created only on success)
  const passedPath = path.join(grademeRoot, ".system", "grading", "passed");
  const passed = await fs
    .access(passedPath)
    .then(() => true)
    .catch(() => false);

  // Read traceback from root directory (tester moves it there)
  const tracebackPath = path.join(grademeRoot, "traceback");
  let traceback = await fs.readFile(tracebackPath, "utf8").catch(() => "");

  // Clean up temporary files
  await fs.unlink(passedPath).catch(() => {});
  await fs.unlink(tracebackPath).catch(() => {});

  // Clean up user's submitted code from rendu directory
  await fs.rm(renduPath, { recursive: true, force: true }).catch(() => {});

  // Clean up reference files from grading directory
  await fs.rm(gradingPath, { recursive: true, force: true }).catch(() => {});

  // Recreate grading directory for next use
  await fs.mkdir(gradingPath, { recursive: true }).catch(() => {});

  // Format output
  let result = "";
  if (passed) {
    result = "✅ SUCCESS! All tests passed.\n\n";
  } else {
    result = "❌ FAILED\n\n";
  }

  if (traceback && traceback.trim()) {
    result += "Test Results:\n" + traceback;
  } else if (output && output.trim()) {
    result += "Output:\n" + output;
  } else {
    result += "No detailed output available.";
  }

  return NextResponse.json({
    output: result,
    passed,
  });
}

function runTester(testerPath, cwd) {
  return new Promise((resolve) => {
    const child = spawn("bash", [testerPath], { cwd, timeout: 30000 });
    let out = "";
    child.stdout.on("data", (d) => {
      out += d.toString();
    });
    child.stderr.on("data", (d) => {
      out += d.toString();
    });
    child.on("close", () => resolve(out.trim()));
    child.on("error", (err) =>
      resolve(`Failed to execute grader: ${err.message}`)
    );
  });
}
