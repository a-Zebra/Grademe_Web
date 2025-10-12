import { getServerBaseUrl } from "@/lib/base-url";
import { ButtonLink } from "@/components/ui/ButtonLink";

async function getExams() {
  const base = getServerBaseUrl();
  const res = await fetch(`${base}/api/exams`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.exams || [];
}

export default async function Page() {
  const exams = await getExams();
  return (
    <main className="p-6">
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
    </main>
  );
}
