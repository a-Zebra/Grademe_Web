"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PenaltyToggle } from "@/components/ui/PenaltyToggle";

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
      <h1 className="text-2xl font-semibold">Grademe Web</h1>
      <p className="text-neutral-400 mt-2">Select a subject to begin.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {exams.map((exam) => (
          <ButtonLink key={exam} href={`/exam/${exam}`}>
            {exam}
          </ButtonLink>
        ))}
        {exams.length === 0 && (
          <p className="text-neutral-400">
            No exams found. Ensure the Grademe repo is available locally and set{" "}
            <code>GRADEME_PATH</code> or place it next to <code>web/</code>.
          </p>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-neutral-800">
        <PenaltyToggle />
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
    </main>
  );
}
