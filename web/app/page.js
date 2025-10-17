"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PenaltyToggle } from "@/components/ui/PenaltyToggle";
import { SolutionToggle } from "@/components/ui/SolutionToggle";

export default function Page() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    async function loadExams() {
      try {
        const res = await fetch("/api/exams");
        if (res.ok) {
          const data = await res.json();
          setExams(data.exams || []);
        }
      } catch (err) {
        console.error("Failed to load exams:", err);
      }
    }
    loadExams();
  }, []);

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-xl shadow-2xl px-6 py-10 md:px-12 md:py-14 mt-10">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Grademe Web
          </h1>
          <p className="text-neutral-300 mt-3 max-w-2xl mx-auto">
            Select a subject to begin. Practice the 42 exams with a modern,
            focused interface.
          </p>
        </div>

        {/* Grid */}
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <a
              key={exam}
              href={`/exam/${exam}`}
              className="group relative overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 transition-colors px-6 py-6 shadow-lg"
            >
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-neutral-600/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-60" />
              <div className="relative flex items-center justify-between">
                <span className="text-lg font-semibold">{exam}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="h-5 w-5 text-neutral-400 group-hover:text-neutral-200 transition-colors"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </a>
          ))}
          {exams.length === 0 && (
            <p className="text-neutral-400">
              No exams found. Ensure the Grademe repo is available locally and
              set <code>GRADEME_PATH</code> or place it next to{" "}
              <code>web/</code>.
            </p>
          )}
        </div>

        {/* Settings + attribution, separated by a line */}
        <div className="mt-12 pt-6 border-t border-neutral-800">
          <div className="space-y-3">
            <PenaltyToggle />
            <SolutionToggle />
          </div>
          <div className="mt-4 text-xs text-neutral-500">
            Powered by{" "}
            <a
              href="https://github.com/Seraph919/Grademe-edu"
              className="underline hover:text-neutral-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              grademe
            </a>{" "}
            - created by{" "}
            <a
              href="https://github.com/JCluzet"
              className="underline hover:text-neutral-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              @JCluzet
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
