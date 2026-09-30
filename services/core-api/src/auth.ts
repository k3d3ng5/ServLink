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
        if (process.env.RESEND_API_KEY) {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM ?? "ServLink <onboarding@resend.dev>",
              to: [email],
              subject: `Your ServLink code: ${otp}`,
              text: `Your ServLink login code is ${otp} (${type}). It expires in 10 minutes.`,
            }),
          });
          // Never log the OTP itself — status + Resend's error is enough to diagnose.
          console.log(`[otp] send to ${email} via resend: ${res.status}`);
          if (!res.ok) console.log(`[otp] resend error: ${(await res.text()).slice(0, 200)}`);
        } else {
          // No Resend key (dev): code goes to the server log, never to the client.
          console.log(`[otp] ${email} (${type}): ${otp}`);
        }
      },
    }),
  ],
});
