import { EditorPane } from "@/components/Exam/EditorPane";
import { getServerBaseUrl } from "@/lib/base-url";

export const dynamic = "force-dynamic";

async function getSubject(exam, id) {
  const base = getServerBaseUrl();
  const res = await fetch(`${base}/api/exams/${exam}/subjects/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function SubjectPage({ params }) {
  const subject = await getSubject(params.exam, params.id);
  return (
    <main className="h-[100svh] grid grid-cols-1 md:grid-cols-2">
      <section className="p-4 overflow-auto border-r border-neutral-800">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Subject</h1>
          <a
            href={`/exam/${params.exam}`}
            className="text-sm text-neutral-400 hover:text-neutral-200"
          >
            Back
          </a>
        </div>
        <article className="prose prose-invert max-w-none mt-4">
          {subject?.markdown ? (
            <div dangerouslySetInnerHTML={{ __html: subject.markdown }} />
          ) : (
            <p className="text-neutral-400">No subject found.</p>
          )}
        </article>
      </section>
      <section className="p-4 overflow-hidden">
        <EditorPane examId={params.exam} subjectId={params.id} />
      </section>
    </main>
  );
}
