"use client";

import { EditorPane } from "@/components/Exam/EditorPane";
import { HorizontalSplit } from "@/components/ui/HorizontalSplit";
import Link from "next/link";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

export default function ExercisePage({ params }) {
  const [exercise, setExercise] = useState(null);

  useEffect(() => {
    // Load exercise content
    async function loadExercise() {
      try {
        const res = await fetch(
          `/api/exams/${params.exam}/${params.examNum}/${params.level}/${params.exercise}`
        );
        if (res.ok) {
          const data = await res.json();
          setExercise(data);
        }
      } catch (err) {
        console.error("Failed to load exercise:", err);
      }
    }

    loadExercise();
  }, [params.exam, params.examNum, params.level, params.exercise]);

  return (
    <main className="h-[100svh]">
      <HorizontalSplit initial={0.5} min={0.25} max={0.75}>
        <section className="p-4 overflow-auto h-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link
                href={`/exam/${params.exam}/${params.examNum}`}
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                ← Back to {params.examNum}
              </Link>
              <h1 className="text-xl font-semibold mt-2">{params.exercise}</h1>
              <p className="text-sm text-neutral-400">Level {params.level}</p>
            </div>
          </div>
          <article className="prose prose-invert max-w-none">
            {exercise?.content ? (
              <pre className="whitespace-pre-wrap text-sm">
                {exercise.content}
              </pre>
            ) : (
              <p className="text-neutral-400">No subject found.</p>
            )}
          </article>
        </section>
        <section className="p-4 overflow-hidden h-full">
          <EditorPane
            examId={params.exam}
            subjectId={`${params.examNum}/${params.level}/${params.exercise}`}
            examNum={params.examNum}
            currentLevel={params.level}
            currentExercise={params.exercise}
          />
        </section>
      </HorizontalSplit>
    </main>
  );
}
