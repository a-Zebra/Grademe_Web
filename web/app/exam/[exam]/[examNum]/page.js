"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function ExamNumberPage({ params }) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  async function handleStartExam() {
    setIsStarting(true);
    try {
      // Store exam start time
      const startTime = Date.now();
      sessionStorage.setItem(
        `exam_${params.exam}_${params.examNum}_start`,
        startTime.toString()
      );

      const res = await fetch(
        `/api/exams/${params.exam}/${params.examNum}/start`
      );
      const data = await res.json();

      if (data.level && data.exercise) {
        router.push(
          `/exam/${params.exam}/${params.examNum}/${data.level}/${data.exercise}`
        );
      } else {
        alert("No exercises available");
        setIsStarting(false);
      }
    } catch (err) {
      alert("Failed to start exam: " + err.message);
      setIsStarting(false);
    }
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="w-full max-w-2xl mx-auto">
        <Link
          href={`/exam/${params.exam}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>

        <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-xl shadow-2xl px-6 py-10 md:px-12 md:py-14 text-center">
          {/* decorative glow */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-20 left-1/2 h-56 w-[38rem] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(16,185,129,0.12),transparent)]" />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            {params.exam}
          </h1>
          <div className="mb-8 mt-4">
            <span className="inline-flex items-center rounded-full border border-emerald-700/30 bg-emerald-900/15 px-3 py-1 text-sm font-medium text-emerald-300">
              {params.examNum}
            </span>
          </div>

          <p className="mx-auto max-w-xl text-neutral-300 mb-8 leading-relaxed">
            Ready to start? The system will randomly select exercises starting
            from level 0. Complete each exercise to progress to the next level.
          </p>

          <div className="flex items-center justify-center">
            <button
              onClick={handleStartExam}
              disabled={isStarting}
              aria-busy={isStarting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 transition-colors"
            >
              {isStarting && (
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {isStarting ? "Starting..." : "examshell"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
