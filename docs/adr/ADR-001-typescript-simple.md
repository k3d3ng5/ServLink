# ADR-001 — TypeScript end-to-end, beginner-simple frameworks

- Status: Accepted
- Context: Solo beginner founder; App (TS), bot, API, console must share types.
- Decision: Express + Zod API, grammY bot, Expo App, Next.js console. Shared `core-domain`.
- Consequences: Less magic than NestJS/RN-CLI; revisit only if outgrown.
