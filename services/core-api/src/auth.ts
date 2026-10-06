import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { networkInterfaces } from "node:os";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const publicURL = process.env.PUBLIC_API_URL ?? "http://localhost:3001";
const extraOrigins = (process.env.TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
// Plus every LAN IPv4 of this machine — DHCP drift broke login three times,
// so trust follows the interfaces, not a hardcoded file.
const lanOrigins = Object.values(networkInterfaces())
  .flat()
  .filter((n) => n && n.family === "IPv4" && !n.internal)
  .map((n) => `http://${(n as { address: string }).address}:3001`);

export const auth = betterAuth({
  baseURL: publicURL,
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-change-me",
  // Bot + app call these endpoints server-to-server (no browser Origin),
  // so the API's own origins (localhost + LAN + explicit extras) must be trusted.
  trustedOrigins: [publicURL, ...lanOrigins, ...extraOrigins],
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  plugins: [
    bearer(), // token auth for bot + app (no cookies on those clients)
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const { sendMail } = await import("./mail.js");
        await sendMail(
          email,
          `Your ServLink code: ${otp}`,
          `Your ServLink login code is ${otp} (${type}). It expires in 10 minutes.`
        );
      },
    }),
  ],
});
