// CSV importer for Google Form overflow (see docs/runbooks/provider-form.md).
// Usage: npm run import:providers -- <path-to-csv>
// Headers: name,phone,categories,zones,skillNote (categories/zones ;-separated ids)
import "dotenv/config";
import { readFileSync } from "node:fs";

const API = process.env.CORE_API_URL ?? "http://localhost:3001";

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur = "";
  let row: string[] = [];
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else quoted = false;
      } else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
    else if (c === "\r") { /* skip */ }
    else cur += c;
  }
  if (cur !== "" || row.length > 0) { row.push(cur); rows.push(row); }
  const [header, ...body] = rows;
  return body
    .filter((r) => r.some((v) => v.trim() !== ""))
    .map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("usage: import:providers -- <csv-file>");
  const records = parseCsv(readFileSync(file, "utf8"));
  let ok = 0;
  for (const r of records) {
    const res = await fetch(`${API}/providers/provider-applications`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: r.name,
        phone: r.phone,
        categories: (r.categories || "").split(";").map((s) => s.trim()).filter(Boolean),
        zones: (r.zones || "").split(";").map((s) => s.trim()).filter(Boolean),
        skillNote: r.skillNote || undefined,
      }),
    });
    if (!res.ok) console.error(`FAILED ${r.name}: ${await res.text()}`);
    else ok++;
  }
  console.log(`imported ${ok}/${records.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
