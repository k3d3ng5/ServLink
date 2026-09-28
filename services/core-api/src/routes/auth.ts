import { Router } from "express";
import { z } from "zod";
import { auth } from "../auth.js";
import { db } from "../db.js";

export const authRoutes = Router();

// POST /auth/link-telegram { telegramChatId } — Authorization: Bearer <better-auth session token>
// Links a verified login to a Telegram chat. Bot access requires the link.
authRoutes.post("/link-telegram", async (req, res, next) => {
  try {
    const { telegramChatId } = z.object({ telegramChatId: z.string().min(1) }).parse(req.body);
    const header = req.headers.authorization ?? "";
    const session = await auth.api.getSession({ headers: new Headers({ authorization: header }) });
    if (!session?.user?.email) return res.status(401).json({ error: "invalid session" });

    const customer = await db.customer.upsert({
      where: { email: session.user.email },
      update: { telegramChatId, handle: telegramChatId, channel: "telegram" },
      create: {
        email: session.user.email,
        name: session.user.name ?? undefined,
        telegramChatId,
        handle: telegramChatId,
        channel: "telegram",
      },
    });
    res.json({ linked: true, customerId: customer.id, email: session.user.email });
  } catch (err) {
    next(err);
  }
});

// GET /auth/check-telegram?chatId= — gate for bot menus.
authRoutes.get("/check-telegram", async (req, res, next) => {
  try {
    const chatId = req.query.chatId as string;
    if (!chatId) return res.status(400).json({ error: "chatId required" });
    const customer = await db.customer.findFirst({ where: { telegramChatId: chatId } });
    const provider = customer
      ? null
      : await db.provider.findFirst({ where: { telegramChatId: chatId } });
    res.json({
      loggedIn: Boolean(customer),
      email: customer?.email ?? null,
      isProvider: Boolean(
        customer
          ? await db.provider.findFirst({ where: { telegramChatId: chatId } })
          : provider
      ),
    });
  } catch (err) {
    next(err);
  }
});
