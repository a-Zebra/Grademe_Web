import { getServerBaseUrl } from "@/lib/base-url";
import Link from "next/link";

async function getExamNumbers(examType) {
  const base = getServerBaseUrl();
  const res = await fetch(`${base}/api/exams/${examType}/numbers`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.examNumbers || [];
}

export default async function ExamTypePage({ params }) {
  const examNumbers = await getExamNumbers(params.exam);
  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-neutral-400 hover:text-neutral-200">
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold">{params.exam}</h1>
      </div>
      <div className="mt-4 flex flex-col gap-2 max-w-xs">
        {examNumbers.map((examNum) => (
          <Link
            key={examNum}
            href={`/exam/${params.exam}/${examNum}`}
            className="inline-flex items-center justify-center rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-100 px-6 py-4 transition-colors border border-neutral-700"
          >
            {examNum}
          </Link>
        ))}
      </div>
    </main>
  );
}
