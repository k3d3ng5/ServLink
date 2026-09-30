import Groq from "groq-sdk";
import { db } from "./db.js";
import { nearestZone } from "./geo.js";
import { notifyAdmins } from "./notify.js";

const MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-20b";

const SYSTEM = `You are ServLink, a friendly home-service assistant in Abuja, Nigeria. Plain Nigerian-English, short messages, one question at a time.
You collect four things, strictly in order, never moving on until each is answered: (1) what needs doing (description), (2) category — one of: plumbing, electrical, ac-hvac, cleaning, generator-solar, handyman, moving, auto-assistance, (3) street address or landmark, (4) phone number.
Rules: NEVER call any tool until all four are known AND the user has confirmed with YES. If anything is missing, ask for the next missing item in plain text with no tool call. GPS coordinates may already be provided — never ask for location twice if present. Never ask for area/zone — the system assigns it.
After YES with all four slots, summarize once more, then call submit_request exactly once. If the user wants to cancel, acknowledge and stop. Keep every reply under 40 words.`;

const SUBMIT_TOOL = {
  type: "function" as const,
  function: {
    name: "submit_request",
    description: "Create the service request once description, category, address and phone are all known and the user said YES.",
    parameters: {
      type: "object",
      properties: {
        description: { type: "string" },
        categoryId: {
          type: "string",
          enum: ["plumbing", "electrical", "ac-hvac", "cleaning", "generator-solar", "handyman", "moving", "auto-assistance"],
        },
        address: { type: "string" },
        phone: { type: "string" },
      },
      required: ["description", "categoryId", "address", "phone"],
    },
  },
};

export interface ChatResult {
  sessionId: string;
  reply: string;
  quickReplies: string[];
  requestId: string | null;
  done: boolean;
}

export async function chat(input: {
  sessionId?: string;
  email?: string;
  channel?: string;
  message: string;
  latitude?: number;
  longitude?: number;
}): Promise<ChatResult> {
  let session = input.sessionId
    ? await db.chatSession.findUnique({ where: { id: input.sessionId }, include: { messages: { orderBy: { createdAt: "asc" } } } })
    : null;
  if (!session) {
    session = await db.chatSession.create({
      data: { email: input.email, channel: input.channel ?? "app", state: "{}" },
      include: { messages: true },
    });
  }

  if (!process.env.GROQ_API_KEY) {
    return {
      sessionId: session.id,
      reply: "Chat is waking up — the assistant key isn't set yet. Meanwhile, use New service request above and I'll take it step by step.",
      quickReplies: [],
      requestId: null,
      done: false,
    };
  }

  const slots = JSON.parse(session.state || "{}") as Record<string, unknown>;
  if (input.latitude !== undefined) {
    slots.latitude = input.latitude;
    slots.longitude = input.longitude;
    await db.chatSession.update({ where: { id: session.id }, data: { state: JSON.stringify(slots) } });
  }

  await db.chatMessage.create({ data: { sessionId: session.id, role: "user", content: input.message } });

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const history = (await db.chatMessage.findMany({ where: { sessionId: session.id }, orderBy: { createdAt: "asc" }, take: 20 }))
    .map((m) => ({ role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant", content: m.content }));

  let msg;
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM }, ...history],
      tools: [SUBMIT_TOOL],
      tool_choice: "auto",
      temperature: 0.3,
      max_tokens: 200,
    });
    msg = completion.choices[0]?.message;
  } catch (e) {
    // Eager/invalid tool calls (e.g. empty args) fall back to plain chat.
    const retry = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM }, ...history],
      temperature: 0.3,
      max_tokens: 200,
    });
    msg = retry.choices[0]?.message;
    console.log("[assistant] tool retry:", (e as Error).message?.slice(0, 120));
  }
  const call = msg?.tool_calls?.[0];
  if (call && "function" in call) {
    const args = JSON.parse(call.function.arguments || "{}") as Record<string, string>;
    // Server-side slot validation — small models hallucinate; never trust blindly.
    const validCategory = [
      "plumbing", "electrical", "ac-hvac", "cleaning",
      "generator-solar", "handyman", "moving", "auto-assistance",
    ].includes(args.categoryId);
    const have = {
      description: typeof args.description === "string" && args.description.trim().length >= 3,
      categoryId: validCategory,
      address: typeof args.address === "string" && args.address.trim().length >= 3,
      phone: typeof args.phone === "string" && args.phone.replace(/\D/g, "").length >= 5,
    };
    const lastUser = [...history].reverse().find((h) => h.role === "user")?.content ?? "";
    const saidYes = /^yes\b/i.test(lastUser.trim());
    if (!have.description || !have.categoryId || !have.address || !have.phone || !saidYes) {
      // Park what we got, ask for what's missing — deterministic, not model-driven.
      await db.chatSession.update({
        where: { id: session.id },
        data: { state: JSON.stringify({ ...slots, ...args }) },
      });
      const ask = !have.description
        ? "What needs doing? Describe it briefly."
        : !have.categoryId
          ? "What kind of work is it? Plumbing, Electrical, AC / HVAC, Cleaning, Generator / Solar, Handyman, Moving, or Auto assistance?"
          : !have.address
            ? "What street address or landmark?"
            : !have.phone
              ? "What phone number should the provider call?"
              : `Got it: ${args.description} (${args.categoryId}) at ${args.address}, ${args.phone}. Reply YES to confirm.`;
      await db.chatMessage.create({ data: { sessionId: session.id, role: "assistant", content: ask } });
      return {
        sessionId: session.id,
        reply: ask,
        quickReplies: !have.categoryId
          ? ["Plumbing", "Electrical", "AC / HVAC", "Cleaning", "Generator / Solar", "Handyman", "Moving", "Auto assistance"]
          : [],
        requestId: session.requestId,
        done: false,
      };
    }
    const zoneId =
      slots.latitude !== undefined
        ? nearestZone({ latitude: slots.latitude as number, longitude: slots.longitude as number })
        : "general";
    const email = input.email ?? session.email ?? undefined;
    const customer = await db.customer.upsert({
      where: email ? { email } : { phone: `__${session.channel}:${session.id}` },
      update: { name: args.phone },
      create: {
        phone: email ? undefined : `__${session.channel}:${session.id}`,
        email,
        name: args.phone,
        channel: session.channel,
        handle: email ?? session.id,
      },
    });
    const request = await db.serviceRequest.create({
      data: {
        customerId: customer.id,
        categoryId: args.categoryId,
        zoneId,
        address: args.address,
        latitude: (slots.latitude as number) ?? undefined,
        longitude: (slots.longitude as number) ?? undefined,
        description: args.description,
        sourceChannel: session.channel,
        status: "REQUESTED",
      },
    });
    await db.statusEvent.create({
      data: { requestId: request.id, fromStatus: "REQUESTED", toStatus: "REQUESTED", actor: `chat:${session.channel}`, note: "assistant intake" },
    });
    await db.chatSession.update({ where: { id: session.id }, data: { requestId: request.id } });
    await notifyAdmins(`🆕 Chat request \`${request.id.slice(0, 8)}\` (${zoneId}): ${args.description.slice(0, 100)}`);
    const { dispatchNext } = await import("./dispatch.js");
    dispatchNext(request.id).catch((e) => console.error("[dispatch]", e));
    const reply = `✅ Done! Request \`${request.id.slice(0, 8)}\` is in — I'll message you the moment your provider is assigned.`;
    await db.chatMessage.create({ data: { sessionId: session.id, role: "assistant", content: reply } });
    return { sessionId: session.id, reply, quickReplies: [], requestId: request.id, done: true };
  }

  const reply = msg?.content?.trim() || "Got it — tell me a little more.";
  await db.chatMessage.create({ data: { sessionId: session.id, role: "assistant", content: reply } });
  const quickReplies = /categor|kind of work/i.test(reply)
    ? ["Plumbing", "Electrical", "AC / HVAC", "Cleaning", "Generator / Solar", "Handyman", "Moving", "Auto assistance"]
    : [];
  return { sessionId: session.id, reply, quickReplies, requestId: session.requestId, done: false };
}
