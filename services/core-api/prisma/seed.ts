// Seed: 5 zones + 8 categories (PRD Sec 5). Run: npx prisma db seed
import { db as prisma } from "../src/db.js";

const zones: Record<string, string> = {
  gwarinpa: "Gwarinpa",
  "wuse-2": "Wuse 2",
  jabi: "Jabi",
  maitama: "Maitama",
  asokoro: "Asokoro",
};
const categories = [
  "plumbing",
  "electrical",
  "ac-hvac",
  "cleaning",
  "generator-solar",
  "handyman",
  "moving",
  "auto-assistance",
];

async function main() {
  for (const [id, name] of Object.entries(zones)) {
    await prisma.zone.upsert({ where: { id }, update: {}, create: { id, name } });
  }
  for (const id of categories) {
    await prisma.category.upsert({ where: { id }, update: {}, create: { id, name: id } });
  }
  console.log("seeded zones + categories");
}

main().finally(() => prisma.$disconnect());
