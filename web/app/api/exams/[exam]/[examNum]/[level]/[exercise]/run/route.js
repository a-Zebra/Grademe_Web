import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { findSubjectsRoot } from "@/lib/grademe-path";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        error: "Code execution not supported on Vercel runtime.",
      },
      { status: 501 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.code !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { exam, examNum, level, exercise } = params;
  const programArgs = body.args || "";

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
  const exercisePath = path.join(subjectsRoot, exam, examNum, level, exercise);

  const files = await fs.readdir(exercisePath).catch(() => []);
  const sourceFile = files.find((f) => f.endsWith(".c") || f.endsWith(".cpp"));

  if (!sourceFile) {
    return NextResponse.json(
      { error: "No source file template found" },
      { status: 404 }
    );
  }

  const fileExt = path.extname(sourceFile);

  // Create temporary run directory: .system/run/{exercise}/
  const runPath = path.join(grademeRoot, ".system", "run", exercise);
  await fs.mkdir(runPath, { recursive: true });

  // Write user's code to run path with a simple name
  await fs.writeFile(
    path.join(runPath, `user_code${fileExt}`),
    body.code,
    "utf8"
  );

  // Determine compilation command based on file extension
  const compiler = fileExt === ".cpp" ? "g++" : "gcc";
  const executableName = "a.out";
  const executablePath = path.join(runPath, executableName);

  // Compile just the user's code (no exercise files)
  const compileResult = await compileCode(
    compiler,
    [`user_code${fileExt}`],
    executableName,
    runPath
  );

  if (!compileResult.success) {
    // Compilation failed
    await fs.rm(runPath, { recursive: true, force: true }).catch(() => {});
    return NextResponse.json({
      output: `🔨 COMPILATION FAILED\n\n${compileResult.output}`,
      success: false,
    });
  }

  // Compilation succeeded, try to run the executable
  const runResult = await runExecutable(executablePath, runPath, programArgs);

  // Clean up
  await fs.rm(runPath, { recursive: true, force: true }).catch(() => {});

  // Format output
  let result = "";

  if (runResult.output && runResult.output.trim()) {
    result = runResult.output;
  } else {
    result = "(No output produced)";
  }

  if (runResult.error) {
    result += "\n\n⚠️ Runtime Error:\n" + runResult.error;
  }

  return NextResponse.json({
    output: result,
    success: true,
  });
}

function compileCode(compiler, sourceFiles, outputName, cwd) {
  return new Promise((resolve) => {
    // Use relaxed flags for Run mode - allow warnings
    const args = [...sourceFiles, "-o", outputName];
    const child = spawn(compiler, args, { cwd, timeout: 10000 });
    let out = "";
    let err = "";

    child.stdout.on("data", (d) => {
      out += d.toString();
    });
    child.stderr.on("data", (d) => {
      err += d.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        // Show warnings if any, but mark as success
        const warnings = err.trim();
        resolve({
          success: true,
          output: warnings ? `⚠️ Warnings:\n${warnings}` : out,
        });
      } else {
        resolve({ success: false, output: err || out || "Compilation failed" });
      }
    });

    child.on("error", (error) => {
      resolve({
        success: false,
        output: `Failed to run compiler: ${error.message}`,
      });
    });
  });
}

function runExecutable(executablePath, cwd, argsString) {
  return new Promise((resolve) => {
    // Parse arguments from string - simple shell-like parsing
    // Handles: "hello world" 123 'test' -> ["hello world", "123", "test"]
    const args = parseArgs(argsString);

    const child = spawn(executablePath, args, { cwd, timeout: 5000 });
    let out = "";
    let err = "";

    child.stdout.on("data", (d) => {
      out += d.toString();
    });
    child.stderr.on("data", (d) => {
      err += d.toString();
    });

    child.on("close", (code) => {
      resolve({
        output: out,
        error: code !== 0 ? err || `Process exited with code ${code}` : null,
      });
    });

    child.on("error", (error) => {
      resolve({
        output: out,
        error: `Failed to execute: ${error.message}`,
      });
    });
  });
}

function parseArgs(argsString) {
  if (!argsString || !argsString.trim()) {
    return [];
  }

  const args = [];
  let current = "";
  let inQuote = null;

  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];

    if (inQuote) {
      if (char === inQuote) {
        inQuote = null;
      } else {
        current += char;
      }
    } else if (char === '"' || char === "'") {
      inQuote = char;
    } else if (char === " " || char === "\t") {
      if (current) {
        args.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }

  if (current) {
    args.push(current);
  }

  return args;
}
