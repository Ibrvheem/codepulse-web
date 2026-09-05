# Feedback board — frontend note

Backend is done and typed in `writelogs-api/src/feedback`. Swagger at `/docs` → tag **Feedback**.
This note is everything the dashboard needs. Follow the existing dashboard patterns
(`app/(dashboard)/dashboard/_components/projects-view.tsx`, `_hooks/use-projects.ts`,
`_hooks/use-create-project.ts`), not the older `service.ts` pattern in the skills docs —
the dashboard uses `lib/api-client.ts` + react-query on the client.

## What it is

Signed-in users post feature requests / bugs / improvements, upvote each other's,
and comment. Ibrahim (admin, via `ADMIN_EMAILS` on the API) moves posts through a
status. The author gets an email when their post becomes Planned / In progress / Done.

Route: `/dashboard/feedback` (list) and `/dashboard/feedback/[id]` (post + comments).
Add a "Feedback" link in the topbar account dropdown (`app/(dashboard)/_components/topbar.tsx`)
and, optionally, a small "Have an idea?" link near the Projects header.

## Enums

```ts
category: "FEATURE" | "BUG" | "IMPROVEMENT"
status:   "OPEN" | "PLANNED" | "IN_PROGRESS" | "DONE" | "DECLINED"
sort:     "top" | "new"        // top = most votes, then newest
```

Suggested badge tokens (from `DESIGN.md` semantic colours, `/10` bg + `/20` border):

| status      | label       | class base            |
|-------------|-------------|-----------------------|
| OPEN        | Open        | `text-muted-foreground` (neutral) |
| PLANNED     | Planned     | `text-social`         |
| IN_PROGRESS | In progress | `text-gold`           |
| DONE        | Done        | `text-win`            |
| DECLINED    | Declined    | `text-loss`           |

Category chips: FEATURE = "Feature", BUG = "Bug", IMPROVEMENT = "Improvement". Keep neutral.

## Endpoints (all JWT, standard envelope)

| Method | Path | Body / query | Returns |
|---|---|---|---|
| GET | `/feedback/me` | – | `{ is_admin, categories[], statuses[] }` |
| GET | `/feedback` | `?page&limit&status&category&sort=top\|new&mine=true` | paginated `FeedbackPost[]` |
| POST | `/feedback` | `{ title, body, category? }` | `FeedbackPost` (201) |
| GET | `/feedback/:id` | – | `FeedbackPost` |
| PATCH | `/feedback/:id` | `{ title?, body?, category? }` author only | `FeedbackPost` |
| DELETE | `/feedback/:id` | author or admin | `{ id }` |
| POST | `/feedback/:id/vote` | idempotent | `{ id, vote_count, has_voted: true }` |
| DELETE | `/feedback/:id/vote` | idempotent | `{ id, vote_count, has_voted: false }` |
| GET | `/feedback/:id/comments` | `?page&limit` (oldest first) | paginated `FeedbackComment[]` |
| POST | `/feedback/:id/comments` | `{ body }` | `FeedbackComment` (201) |
| DELETE | `/feedback/:id/comments/:commentId` | author or admin | `{ id }` |
| PATCH | `/feedback/:id/status` | `{ status, note? }` **admin only** | `FeedbackPost` |

Limits: title ≤ 120, body ≤ 2000, comment ≤ 1000, note ≤ 500. Creating posts and
comments is throttled to 20/hour per user (429 → toast the message).
403 on PATCH status / delete means "not yours" or "not admin". 404 = deleted or unknown.

## Types → `lib/types.ts`

```ts
export const feedbackCategorySchema = z.enum(["FEATURE", "BUG", "IMPROVEMENT"]);
export const feedbackStatusSchema = z.enum(["OPEN", "PLANNED", "IN_PROGRESS", "DONE", "DECLINED"]);
export type FeedbackCategory = z.infer<typeof feedbackCategorySchema>;
export type FeedbackStatus = z.infer<typeof feedbackStatusSchema>;

export const feedbackAuthorSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  profile_picture: z.string().nullish(),
});

export const feedbackPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  category: feedbackCategorySchema,
  status: feedbackStatusSchema,
  /** Admin's public note under the status ("Shipping in 2.3"). */
  status_note: z.string().nullish(),
  vote_count: z.number(),
  comment_count: z.number(),
  /** The caller has upvoted this post. */
  has_voted: z.boolean(),
  /** The caller wrote this post (show edit/delete). */
  is_mine: z.boolean(),
  author: feedbackAuthorSchema,
  created_at: z.string(),
  updated_at: z.string(),
});
export type FeedbackPost = z.infer<typeof feedbackPostSchema>;

export const feedbackCommentSchema = z.object({
  id: z.string(),
  body: z.string(),
  /** Official reply from WriteLogs — render with a small "Team" badge. */
  is_admin: z.boolean(),
  is_mine: z.boolean(),
  author: feedbackAuthorSchema,
  created_at: z.string(),
});
export type FeedbackComment = z.infer<typeof feedbackCommentSchema>;

export type FeedbackMe = {
  is_admin: boolean;
  categories: FeedbackCategory[];
  statuses: FeedbackStatus[];
};
export type FeedbackVoteResult = { id: string; vote_count: number; has_voted: boolean };
```

## Client → `lib/api-client.ts`

```ts
export const feedback = {
  me: async () => (await request<FeedbackMe>("/feedback/me")).data,

  list: async (params?: {
    page?: number; limit?: number;
    status?: FeedbackStatus; category?: FeedbackCategory;
    sort?: "top" | "new"; mine?: boolean;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.status) q.set("status", params.status);
    if (params?.category) q.set("category", params.category);
    if (params?.sort) q.set("sort", params.sort);
    if (params?.mine) q.set("mine", "true");
    const body = await request<FeedbackPost[]>(`/feedback${q.size ? `?${q}` : ""}`);
    return { data: body.data, meta: body.meta! } satisfies Paginated<FeedbackPost>;
  },

  get: async (id: string) => (await request<FeedbackPost>(`/feedback/${id}`)).data,

  create: async (payload: { title: string; body: string; category?: FeedbackCategory }) =>
    (await request<FeedbackPost>("/feedback", { method: "POST", body: JSON.stringify(payload) })).data,

  update: async (id: string, payload: { title?: string; body?: string; category?: FeedbackCategory }) =>
    (await request<FeedbackPost>(`/feedback/${id}`, { method: "PATCH", body: JSON.stringify(payload) })).data,

  remove: async (id: string) =>
    (await request<{ id: string }>(`/feedback/${id}`, { method: "DELETE" })).message,

  vote: async (id: string) =>
    (await request<FeedbackVoteResult>(`/feedback/${id}/vote`, { method: "POST" })).data,
  unvote: async (id: string) =>
    (await request<FeedbackVoteResult>(`/feedback/${id}/vote`, { method: "DELETE" })).data,

  comments: async (id: string, params?: { page?: number; limit?: number }) => {
    const body = await request<FeedbackComment[]>(`/feedback/${id}/comments${paginated(params)}`);
    return { data: body.data, meta: body.meta! } satisfies Paginated<FeedbackComment>;
  },
  addComment: async (id: string, payload: { body: string }) =>
    (await request<FeedbackComment>(`/feedback/${id}/comments`, { method: "POST", body: JSON.stringify(payload) })).data,
  removeComment: async (id: string, commentId: string) =>
    (await request<{ id: string }>(`/feedback/${id}/comments/${commentId}`, { method: "DELETE" })).message,

  // admin only
  setStatus: async (id: string, payload: { status: FeedbackStatus; note?: string }) =>
    (await request<FeedbackPost>(`/feedback/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) })).data,
};
```

## Files

```
app/(dashboard)/dashboard/feedback/
  page.tsx                      metadata + <FeedbackBoard />
  loading.tsx                   skeleton list (reuse Skeleton rows like projects-skeleton)
  types.ts                      createFeedbackPayloadSchema, commentPayloadSchema, STATUS_META, CATEGORY_META
  _components/feedback-board.tsx     header, filters, list, "New post" dialog trigger
  _components/feedback-filters.tsx   status tabs (All/Open/Planned/In progress/Done) + category select + sort toggle
  _components/feedback-card.tsx      vote button (left), title, body preview, badges, comment count, author + timeAgo
  _components/vote-button.tsx        pill with ▲ count; filled when has_voted; optimistic
  _components/status-badge.tsx       maps status → label + colour (table above)
  _components/new-feedback-dialog.tsx  Dialog + Form (ControlledInput title, ControlledSelect category, textarea body)
  _hooks/use-feedback-list.ts        useQuery(["feedback", filters])
  _hooks/use-feedback-me.ts          useQuery(["feedback","me"]) — gates admin UI
  _hooks/use-create-feedback.ts      form + mutation, invalidates ["feedback"]
  _hooks/use-vote.ts                 optimistic toggle (below)
  [id]/
    page.tsx, loading.tsx
    _components/feedback-detail.tsx  full post, vote, status + note, edit/delete if is_mine, admin status control
    _components/comment-list.tsx     oldest first, "Team" badge when is_admin, delete if is_mine or admin
    _components/comment-form.tsx     single textarea + button, clears on success
    _components/admin-status-control.tsx  Select status + optional note input + Save (only when me.is_admin)
    _hooks/use-feedback-post.ts, use-comments.ts, use-add-comment.ts, use-set-status.ts, use-delete-feedback.ts
```

Query keys: `["feedback"]` prefix for all list/detail; `["feedback", "me"]`; `["feedback", id]`;
`["feedback", id, "comments"]`. Mutations invalidate `["feedback"]` (covers all).

## Vote toggle (optimistic)

```ts
export function useVote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; has_voted: boolean }) =>
      p.has_voted ? feedback.unvote(p.id) : feedback.vote(p.id),
    onMutate: async ({ id, has_voted }) => {
      await qc.cancelQueries({ queryKey: ["feedback"] });
      const delta = has_voted ? -1 : 1;
      const patch = (p: FeedbackPost) =>
        p.id === id ? { ...p, has_voted: !has_voted, vote_count: p.vote_count + delta } : p;
      qc.setQueriesData<Paginated<FeedbackPost>>({ queryKey: ["feedback"], exact: false }, (old) =>
        old && "data" in old && Array.isArray(old.data) ? { ...old, data: old.data.map(patch) } : old);
      qc.setQueryData<FeedbackPost>(["feedback", id], (old) => (old ? patch(old) : old));
    },
    onError: (e) => toast.error(e.message),
    onSettled: () => qc.invalidateQueries({ queryKey: ["feedback"] }),
  });
}
```

The vote button should not wait for the server; it flips instantly and the count
moves by one. Both endpoints are idempotent, so a double-click is safe.

## Behaviour notes

- Default list: `sort=top`, no status filter, `limit=20`. Show `PaginationControls` under the list.
- "New post" dialog: title (required, ≤120), category select (default Feature), body textarea
  (required, ≤2000). On success: toast "Posted — thanks!", invalidate, navigate to `/dashboard/feedback/{id}`.
- Post detail: show `status_note` under the status badge in muted text when present.
- Edit is inline or a dialog reusing the create form with defaults, only when `is_mine`.
- Delete: confirm ("Delete this post? Votes and comments go with it."), then back to list.
- Admin control appears only when `me.is_admin`. Changing status to Planned / In progress / Done
  emails the author automatically; the UI just calls PATCH status. Note is optional and public.
- Empty state (no posts): "Nothing here yet. Be the first to ask for something."
  Use `EmptyState` from `query-states.tsx`.
- Errors: `ErrorState` with retry, same as projects. 429 → toast the API message.
- Comments: "Team" badge (`text-primary bg-primary/10 border-primary/20`) when `is_admin`.
- Author display: initials avatar like the topbar (no `profile_picture` yet for most users).
- Keep the visual weight low: same `border rounded-lg p-4 bg-card` cards as projects; `CornerAccents` first child only on the post detail card.
