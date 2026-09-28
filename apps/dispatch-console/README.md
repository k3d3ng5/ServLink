# dispatch-console (concierge UI, Next.js)

Full scaffold lands in Phase 6:

```powershell
cd apps/dispatch-console
npx create-next-app@latest . --typescript --tailwind --app
```

Uncomment the `dispatch-console` block in `infra/docker-compose.yml` afterwards.
Pages: inbound queue → suggest panel → job board → follow-up inbox → rework queue.
