import { api } from "@/lib/api";
import { ReviewButtons } from "./ReviewButtons";

export default async function ApplicationsPage() {
  const { applications } = await api.applications();
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Provider applications ({applications.length})</h1>
      {applications.length === 0 && <p className="text-neutral-500">Inbox clear.</p>}
      <ul className="space-y-3">
        {applications.map((a) => (
          <li key={a.id} className="rounded border bg-white p-4">
            <p className="font-medium">
              {a.name} · {a.phone}
            </p>
            <p className="text-sm text-neutral-500">
              {(JSON.parse(a.categories || "[]") as string[]).join(", ")} —{" "}
              {(JSON.parse(a.zones || "[]") as string[]).join(", ")}
            </p>
            {a.skillNote && <p className="mt-1 text-sm">{a.skillNote}</p>}
            <ReviewButtons id={a.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
