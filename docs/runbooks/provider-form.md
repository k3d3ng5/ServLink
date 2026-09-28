# Provider intake — Google Form (overflow) + import SOP

**Position:** the bot `/provider` flow is the primary intake (writes straight to
`provider_applications`). This Form exists only as overflow — e.g. sharing in
WhatsApp groups where people won't open Telegram. Sunset it once the bot flow
carries 80%+ of applications for two consecutive weeks.

## Form spec (mirror these exactly — the importer maps by header)

Create at forms.google.com, one section, all required except photo:

| # | Question | Type | Values / note |
|---|---|---|---|
| 1 | Full name | Short answer | — |
| 2 | Phone (WhatsApp) | Short answer | validate: number-ish, min 5 chars |
| 3 | Services you offer (pick all) | Checkboxes | plumbing, electrical, ac-hvac, cleaning, generator-solar, handyman, moving, auto-assistance |
| 4 | Areas you serve (pick all) | Checkboxes | gwarinpa, wuse-2, jabi, maitama, asokoro |
| 5 | Experience / past work | Paragraph | skill note |
| 6 | Photo of past work (optional) | File upload | stored in Drive; paste link into console at review |

Share setting: "Anyone with the link". Responses → Sheets.

## Import SOP (weekly, ~10 min)

1. Open responses Sheet → File → Download → **CSV**.
2. Flatten multi-selects: Sheets exports checkbox answers comma-separated in one
   cell — replace `, ` with `;` in the services and areas columns.
   Final headers must be: `name,phone,categories,zones,skillNote`
   (`categories`/`zones`: `;`-separated ids from the tables above.)
3. Run (API must be up):
   ```powershell
   npm.cmd run import:providers --workspace=services/core-api -- C:\path\to\responses.csv
   ```
4. Review + approve in console inbox (Phase 6) or `POST /providers/provider-applications/:id/review`.
5. Mark imported rows in the Sheet (add an `imported` column) — never import twice.

## Sunset rule

When bot-originated applications ≥80% for two weeks running: set the Form to
"Not accepting responses", link it to the bot, delete this doc's SOP section.
Per the ServLink Rule: the Form earns its keep only while it creates supply.
