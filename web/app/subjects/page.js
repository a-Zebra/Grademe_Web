import Link from "next/link";

export const dynamic = "force-dynamic";

async function getSubjects() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/subjects`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.ids || [];
}

export default async function SubjectsPage() {
  const ids = await getSubjects();
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Subjects</h1>
      <ul className="mt-4 grid gap-2">
        {ids.map((id) => (
          <li key={id}>
            <Link
              href={`/subject/${id}`}
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              {id}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
