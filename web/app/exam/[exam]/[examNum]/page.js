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
    <main className="p-6 max-w-5xl mx-auto flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full text-center">
        <Link
          href={`/exam/${params.exam}`}
          className="text-sm text-neutral-400 hover:text-neutral-200 inline-block mb-6"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-semibold mb-2">{params.exam}</h1>
        <h2 className="text-xl text-neutral-400 mb-8">{params.examNum}</h2>
        <p className="text-neutral-300 mb-8">
          Ready to start? The system will randomly select exercises starting
          from level 0. Complete each exercise to progress to the next level.
        </p>
        <button
          onClick={handleStartExam}
          disabled={isStarting}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-lg font-medium transition-colors"
        >
          {isStarting ? "Starting..." : "examshell"}
        </button>
      </div>
    </main>
  );
}
