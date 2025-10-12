import { getServerBaseUrl } from "@/lib/base-url";
import Link from "next/link";

async function getExercises(examType, examNum) {
  const base = getServerBaseUrl();
  const res = await fetch(
    `${base}/api/exams/${examType}/${examNum}/exercises`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.exercises || [];
}

export default async function ExamNumberPage({ params }) {
  const exercises = await getExercises(params.exam, params.examNum);
  return (
    <main className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/exam/${params.exam}`}
          className="text-neutral-400 hover:text-neutral-200"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold">
          {params.exam} / {params.examNum}
        </h1>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {exercises.map((ex) => (
          <Link
            key={ex.path}
            href={`/exam/${params.exam}/${params.examNum}/${ex.level}/${ex.name}`}
            className="inline-flex flex-col items-start justify-center rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-100 px-4 py-3 transition-colors border border-neutral-700"
          >
            <span className="text-xs text-neutral-400">Level {ex.level}</span>
            <span>{ex.name}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
