import { Bot } from "grammy";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN ?? "");

// Phase 0 stub — full parity flows land in Phase 5.
bot.command("start", (ctx) =>
  ctx.reply(
    "Welcome to ServLink. Tell me what you need done and where (e.g. 'Kitchen sink leaking, Gwarinpa'). Full booking flows arrive in Phase 5."
  )
);

bot.start();
