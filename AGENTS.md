# Agent rules

This repo follows the conventions of the `frontend-v2` Next.js template. The
enforced rules live in `.claude/skills/design-rules`, the how-to reference in
`.claude/skills/forms-and-services`, and the review checklist in
`.claude/skills/code-review`. The visual system is documented in `DESIGN.md`.

- **Next.js 15 (App Router, Turbopack)** — verify APIs against the version in
  `package.json` before writing code; don't assume conventions from other
  Next.js majors (e.g. `middleware.ts` is correct here, not `proxy.ts`).
- Every feature lives at `app/(section)/[feature]/` with `page.tsx` (server
  component), `loading.tsx`, `service.ts` (`"use server"`), `types.ts` (Zod),
  and co-located `_components/` + `_hooks/`.
- Forms always go through the `Controlled*` molecules in `components/molecules/`
  with a react-hook-form + zodResolver hook — never raw `register()`.
- All backend calls go through `api` from `@/lib/api` — never raw `fetch`.
- Animation work should lean on the Emil Kowalski skills in `.claude/skills/`
  (`animate`, `review-animations`, `improve-animations`, etc.).
