import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Pilot target is Postgres (ADR-003); swap this adapter for @prisma/adapter-pg
// and the datasource provider when the session/Docker issue is resolved.
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

export const db = new PrismaClient({ adapter });
