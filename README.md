# WriteLogs (codepulse-web)

Focus on code, not log sheets. Built on the [frontend-v2](https://github.com/Ibrvheem/frontend-v2) Next.js template conventions — shadcn/ui, cookie-based JWT auth, and strong conventions for forms, services, and folder structure.

## Stack

- **Next.js 15** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4** + **shadcn/ui** (`components.json` configured, components live in `components/ui/`)
- **react-hook-form + Zod** for forms and validation
- **Framer Motion** for entrance animations, **sonner** for toasts
- Cookie-based JWT auth (access + refresh) via `middleware.ts` and `lib/api.ts`

## Getting started

```bash
pnpm install
# point BASE_URL in .env at your backend
pnpm dev
```

Branding lives in `lib/config.ts` (`APP_NAME`, `APP_DESCRIPTION`, `COMPANY_NAME`).

## Structure & conventions

```
app/
  (landing)/       public landing page — hero, pricing, waitlist dialog
  (waitlist)/      waitlist signup flow
  (auth)/          signin, signup
  (dashboard)/     authenticated app — sidebar chrome in layout.tsx
components/
  ui/              shadcn components (design tokens)
  molecules/       reusable app components — Controlled* form fields
  motion/          StaggerReveal entrance animation
  animate-ui/      animated radix primitives
lib/
  config.ts        app name/branding — single place to rebrand
  api.ts           HTTP client — attaches Bearer token from cookies
  auth.ts          cookie token helpers (get/set/clear, decode)
  schemas.ts       apiResponse / paginatedApiResponse Zod envelope helpers
middleware.ts      route protection
```

Every feature follows the same shape — `app/(section)/[feature]/` with:

- `page.tsx` — server component (never `"use client"`), plus `loading.tsx` skeleton
- `service.ts` — `"use server"` actions calling `api.*`, wrapped in try/catch
- `types.ts` — Zod schemas + inferred types
- `_components/` and `_hooks/` — co-located client components and form/mutation hooks

Forms always use the `Controlled*` molecules with a `use-[feature]` hook (react-hook-form + zodResolver) — never raw `register()`.

The full ruleset lives in `DESIGN.md` and the Claude Code skills in `.claude/skills/`, wired in via `CLAUDE.md` / `AGENTS.md`:

- `design-rules` — the enforced conventions (server components, no `useEffect`, skeletons, service/hook rules)
- `forms-and-services` — usage guide: the `Controlled*` form component reference, form/mutation hook templates, `lib/api` + `service.ts`/`types.ts` patterns, full worked example
- `code-review` — review checklist for all of the above
- Animation & design-engineering skills from [emilkowalski/skills](https://github.com/emilkowalski/skills) (MIT): `animate`, `animation-vocabulary`, `apple-design`, `ask-sonner`, `emil-design-eng`, `find-animation-opportunities`, `improve-animations`, `pick-ui-library`, `prototype`, `review-animations`

## Backend contract

The API client expects a backend that:

- Accepts `Authorization: Bearer <access_token>` and returns the envelope `{ success, status_code, message, data, meta? }`
- Exposes the auth endpoints used by `app/(auth)/*/service.ts`

Set `BASE_URL` in `.env` to the backend origin.

## Adding shadcn components

```bash
pnpm dlx shadcn@latest add <component>
```

`components.json` is already configured (style, aliases, Tailwind v4 CSS variables).
