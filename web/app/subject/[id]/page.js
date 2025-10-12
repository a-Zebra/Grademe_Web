import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function getSubject(id) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/subjects/${id}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function SubjectPage({ params }) {
  const subject = await getSubject(params.id);
  return (
    <main className="h-[100svh] grid grid-cols-1 md:grid-cols-2">
      <section className="p-4 overflow-auto border-r border-neutral-800">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Subject</h1>
          <Link
            href="/"
            className="text-sm text-neutral-400 hover:text-neutral-200"
          >
            Back
          </Link>
        </div>
        <Suspense fallback={<p className="mt-4 text-neutral-400">Loading…</p>}>
          <article className="prose prose-invert max-w-none mt-4">
            {subject?.markdown ? (
              <div dangerouslySetInnerHTML={{ __html: subject.markdown }} />
            ) : (
              <p className="text-neutral-400">No subject found.</p>
            )}
          </article>
        </Suspense>
      </section>
      <section className="p-4 overflow-hidden">
        {/* Client editor */}
        <ClientEditor subjectId={params.id} />
      </section>
    </main>
  );
}

function ClientEditor({ subjectId }) {
  // dynamic import avoids server code in client tree
  // eslint-disable-next-line no-unused-vars
  const Editor = require("../../../components/Editor/CodeEditor").CodeEditor;
  return <EditorShell subjectId={subjectId} Editor={Editor} />;
}

function EditorShell({ subjectId, Editor }) {
  // client wrapper
  return (
    <div className="h-full flex flex-col gap-3">
      <form
        action={`/api/grade`}
        method="post"
        className="contents"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-400">Subject: {subjectId}</p>
          <button
            type="button"
            id="submitBtn"
            className="px-3 py-1.5 bg-emerald-600 rounded hover:bg-emerald-500 text-sm"
          >
            Submit
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <Editor value={"/* write your code here */\n"} onChange={() => {}} />
        </div>
      </form>
      <div
        className="h-40 overflow-auto bg-neutral-900 rounded p-2 text-xs text-neutral-300"
        id="output"
      >
        Grader output will appear here (local dev only).
      </div>
    </div>
  );
}
