// Builds tokens.json -> tokens.ts + tokens.css. Run: npm run build --workspace=@servlink/design-tokens
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(dir, "tokens.json"), "utf8"));
const colors = tokens.color ?? {};

const ts = `// Generated from tokens.json — do not edit by hand.\nexport const colors = ${JSON.stringify(colors, null, 2)} as const;\n`;
let css = ":root {\n";
for (const [group, shades] of Object.entries(colors)) {
  for (const [shade, value] of Object.entries(shades)) {
    const name = shade === "DEFAULT" ? `--color-${group}` : `--color-${group}-${shade}`;
    css += `  ${name}: ${value};\n`;
  }
}
css += "}\n";

writeFileSync(join(dir, "tokens.ts"), ts);
writeFileSync(join(dir, "tokens.css"), css);
console.log("tokens built: tokens.ts + tokens.css");
