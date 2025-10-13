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
      <Link
        href="/"
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
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
          {params.exam}
        </h1>
        <p className="mx-auto max-w-xl text-neutral-300 mb-8 leading-relaxed">
          Choose an exam session number to begin.
        </p>

        <div className="mx-auto grid max-w-md grid-cols-1 gap-3">
          {examNumbers.map((examNum) => (
            <Link
              key={examNum}
              href={`/exam/${params.exam}/${examNum}`}
              className="group relative overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 transition-colors px-6 py-4 shadow-lg flex items-center justify-between"
            >
              <span className="text-base font-medium">{examNum}</span>
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
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
