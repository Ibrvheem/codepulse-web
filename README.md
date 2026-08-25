 # WriteLogs (codepulse-web)

Focus on code, not log sheets. The dashboard for [writelogs-api](../writelogs-api) — a thin client over the REST API. The backend owns all state; the only config this app needs is `NEXT_PUBLIC_API_URL`.

## Stack

- **Next.js 15** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4** + **shadcn/ui**
- **TanStack Query** for server state — no other state libraries
- **react-hook-form + Zod** for forms and validation
- **Framer Motion** for entrance animations, **sonner** for toasts

## Getting started

```bash
pnpm install
cp .env.example .env   # NEXT_PUBLIC_API_URL, dev default http://localhost:9308
pnpm dev
```

The backend's live Swagger docs are at `${NEXT_PUBLIC_API_URL}/docs`.

## Auth model

All auth lives in `lib/api-client.ts` — the single API module:

- `POST /auth/signup` → email OTP → `POST /auth/verify-otp` (logs the user in)
- Access token (15 min) is kept **in memory only**; refresh token (90 days) in
  `localStorage`, rotated on every refresh
- On 401 the client calls `POST /auth/refresh` once (single-flight) and retries
- Unverified signin returns 403 → the UI routes to `/verify` with a 60s resend cooldown
- Every success response is the envelope `{ success, status_code, message, data, meta? }`;
  NestJS error responses are unenveloped `{ message, error, statusCode }` — the client
  normalizes both into `ApiError` so UIs always show the backend's message

## Screens

```
/                     landing (public)
/signin /signup       auth
/verify?email=…       OTP verification (60s resend cooldown)
/dashboard            projects grid — create needs name + timezone (browser default)
/dashboard/[id]       project detail — Summaries · Activity · Keys tabs
                      · Summaries: list + "Summarize today" (include_today: true)
                      · Activity: paginated log table, commit rows get a badge + message
                      · Keys: list, revoke, and the new-key modal (token shown ONCE,
                        copy + 3-step VS Code setup)
/dashboard/[id]/summary/[summaryId]
                      full summary + tasks — "Copy as standup" → clipboard
```

## Structure & conventions

Every feature is `app/(section)/[feature]/` with:

- `page.tsx` — server component (never `"use client"`), plus `loading.tsx` skeleton
- `types.ts` — Zod schemas + inferred types
- `_components/` and `_hooks/` — co-located client components and form/mutation hooks

Shared pieces:

```
lib/
  api-client.ts    THE api module: tokens, refresh-and-retry, all endpoints
  types.ts         Zod schemas for API entities
  schemas.ts       envelope/meta helpers
  config.ts        app branding
components/
  ui/              shadcn components
  molecules/       Controlled* form fields (react-hook-form)
  motion/          FadeIn + StaggerReveal entrance animations
```

Quality bar (enforced by `.claude/skills/`): every screen has loading / empty /
error states; buttons show in-flight state via the `<Button loading>` prop; errors
surface the API's message; motion is subtle ease-out under 300ms; light + dark mode.

## Out of scope on purpose

Billing, teams, charts, profile pictures, settings pages.


Hello world!