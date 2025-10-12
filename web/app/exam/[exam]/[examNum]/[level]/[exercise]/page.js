import { EditorPane } from "@/components/Exam/EditorPane";
import { HorizontalSplit } from "@/components/ui/HorizontalSplit";
import { getServerBaseUrl } from "@/lib/base-url";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getExercise(examType, examNum, level, exercise) {
  const base = getServerBaseUrl();
  const res = await fetch(
    `${base}/api/exams/${examType}/${examNum}/${level}/${exercise}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function ExercisePage({ params }) {
  const exercise = await getExercise(
    params.exam,
    params.examNum,
    params.level,
    params.exercise
  );

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
