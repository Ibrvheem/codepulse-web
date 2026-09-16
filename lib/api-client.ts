/**
 * The single API client for the WriteLogs backend.
 *
 * - Access token lives in memory only (15 min TTL).
 * - Refresh token lives in localStorage (90 days) and rotates on refresh.
 * - Authed requests get one automatic refresh + retry on 401.
 * - Every response uses the envelope { success, status_code, message, data }
 *   (lists add `meta`). Failures throw ApiError carrying the envelope message.
 */
import {
  type AuthTokens,
  type Billing,
  type BillingCheckout,
  type CreatedPatKey,
  type FeedbackCategory,
  type FeedbackComment,
  type FeedbackMe,
  type FeedbackPost,
  type FeedbackSort,
  type FeedbackStatus,
  type FeedbackVoteResult,
  type PlanLimits,
  type ShareLink,
  type SharedSummary,
  type SummaryList,
  type UpdateUsage,
  type GenerateSummaryResponse,
  type LogEntry,
  type Paginated,
  type PatKey,
  type Project,
  type Recap,
  type SharedRecap,
  type SigninResponse,
  type Summary,
  type SummaryVoice,
  type User,
} from "./types";
import type { Meta } from "./schemas";
import { identifyUser, resetAnalytics } from "./analytics";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9308";

const REFRESH_TOKEN_KEY = "writelogs.refresh_token";
const USER_KEY = "writelogs.user";

export const SESSION_EXPIRED_MESSAGE = "Your session has expired. Sign in again.";
const UNREACHABLE_MESSAGE =
  "Can't reach the WriteLogs API. Check your connection and try again.";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type Envelope<T> = {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  meta?: Meta;
  /** Summaries list only: count hidden by the plan's history window. */
  locked?: number;
  limits?: PlanLimits;
};

/** 402 = the plan doesn't allow this; the message is the upgrade prompt. */
export function isUpgradeRequired(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 402;
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

let accessToken: string | null = null;

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeSession(tokens: AuthTokens, user?: User) {
  accessToken = tokens.access_token;
  if (user) identifyUser(user); // link analytics to the DB user id
  try {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // storage unavailable — the session just won't survive a reload
  }
}

export function clearSession() {
  // Reset before wiping the session so the next sign-in on this browser
  // doesn't inherit this user's analytics identity.
  resetAnalytics();
  accessToken = null;
  try {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

/**
 * Hand the current session to another window of this origin. Used by the Meet
 * add-on: its iframe on meet.google.com gets partitioned storage, so it cannot
 * see the dashboard's session and has to be given one explicitly.
 */
/**
 * Mints a SEPARATE session to hand to the Meet panel.
 *
 * Never pass this session's own refresh token along: tokens rotate on use and
 * the API revokes every session for the user when one is reused, so two
 * clients sharing a token sign each other out.
 */
export async function createHandoffSession(): Promise<{
  refresh_token: string;
  user: User | null;
} | null> {
  if (!getRefreshToken()) return null;
  const body = await request<AuthTokens>("/auth/companion-session", {
    method: "POST",
  });
  return { refresh_token: body.data.refresh_token, user: getStoredUser() };
}

/** Accept a session handed over by exportSessionForHandoff. */
export function adoptSession(refresh_token: string, user?: User | null) {
  accessToken = null;
  try {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // storage unavailable — the session just won't survive a reload
  }
  if (user) identifyUser(user);
}

export function isAuthenticated(): boolean {
  return getRefreshToken() !== null;
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

async function parseEnvelope<T>(res: Response): Promise<Envelope<T>> {
  const body = (await res.json().catch(() => null)) as
    | (Partial<Envelope<T>> & { message?: string | string[] })
    | null;

  if (body && typeof body === "object" && "success" in body) {
    return body as Envelope<T>;
  }

  // NestJS exception responses skip the envelope: { message, error, statusCode }.
  // `message` is an array for validation errors.
  const message = Array.isArray(body?.message)
    ? body.message.join(". ")
    : body?.message;
  throw new ApiError(
    message ||
      (res.ok
        ? "The server returned an unexpected response."
        : `Request failed (${res.status})`),
    res.status,
  );
}

/** Unauthenticated call — no token attached, no refresh/retry. */
async function publicRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<Envelope<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(UNREACHABLE_MESSAGE, 0);
  }
  const body = await parseEnvelope<T>(res);
  if (!res.ok || !body.success) throw new ApiError(body.message, res.status);
  return body;
}

type RefreshResult = "refreshed" | "rejected" | "unreachable";

// Single-flight refresh so concurrent 401s in this tab trigger one call.
let refreshPromise: Promise<RefreshResult> | null = null;

/**
 * Runs the refresh under a lock shared by every tab on this origin.
 *
 * The refresh token lives in localStorage, shared by all tabs, but each tab
 * refreshes on its own (every page load does it up front). Unserialised, two
 * tabs present the same token at once and race its rotation. The server now
 * tolerates that, but taking turns means each tab reads the token the previous
 * one just stored instead of spending a stale one.
 */
function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  // request() resolves with whatever the callback resolves with; its typings
  // just don't unwrap a promise-returning callback.
  return locks
    ? (locks.request("writelogs-refresh", fn) as Promise<Awaited<T>> as Promise<T>)
    : fn();
}

async function refreshAccessToken(): Promise<RefreshResult> {
  if (!refreshPromise) {
    refreshPromise = withRefreshLock(async (): Promise<RefreshResult> => {
      // Read inside the lock: another tab may have rotated it while we waited.
      const refresh_token = getRefreshToken();
      if (!refresh_token) return "rejected";
      try {
        const body = await publicRequest<AuthTokens>("/auth/refresh", {
          method: "POST",
          body: JSON.stringify({ refresh_token }),
        });
        storeSession(body.data);
        return "refreshed";
      } catch (err) {
        // Only the API refusing the token ends the session. A dropped
        // connection, a 5xx or rate limiting says nothing about the session,
        // and signing someone out for it is how offline blips became logouts.
        const status = err instanceof ApiError ? err.status : 0;
        if (status >= 400 && status < 500 && status !== 429) {
          clearSession();
          return "rejected";
        }
        return "unreachable";
      }
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/** Authenticated call — attaches the access token, refreshes once on 401. */
async function request<T>(
  path: string,
  init?: RequestInit,
  isRetry = false,
): Promise<Envelope<T>> {
  // After a reload the access token is gone but the refresh token survives —
  // mint a new access token up front instead of eating a guaranteed 401.
  if (!accessToken && getRefreshToken()) {
    if ((await refreshAccessToken()) === "unreachable") {
      throw new ApiError(UNREACHABLE_MESSAGE, 0);
    }
  }
  if (!accessToken) throw new ApiError(SESSION_EXPIRED_MESSAGE, 401);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(UNREACHABLE_MESSAGE, 0);
  }

  if (res.status === 401 && !isRetry) {
    const result = await refreshAccessToken();
    if (result === "refreshed") return request<T>(path, init, true);
    if (result === "unreachable") throw new ApiError(UNREACHABLE_MESSAGE, 0);
    throw new ApiError(SESSION_EXPIRED_MESSAGE, 401);
  }

  const body = await parseEnvelope<T>(res);
  if (!res.ok || !body.success) throw new ApiError(body.message, res.status);
  return body;
}

function paginated(params?: { page?: number; limit?: number }): string {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const auth = {
  signup: async (payload: {
    email: string;
    full_name: string;
    password: string;
  }) => (await publicRequest<Record<string, never>>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  })).message,

  signin: async (payload: { email: string; password: string }) => {
    const body = await publicRequest<SigninResponse>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    storeSession(body.data, body.data.user);
    return body.data;
  },

  verifyOtp: async (payload: { email: string; otp: string }) => {
    const body = await publicRequest<SigninResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    // Verifying logs the user in — the response carries tokens + user.
    if (body.data?.access_token) storeSession(body.data, body.data.user);
    return body.data;
  },

  /** Trades the single-use code from an OAuth redirect for a session. */
  oauthExchange: async (code: string) => {
    const body = await publicRequest<SigninResponse>("/auth/oauth/exchange", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    storeSession(body.data, body.data.user);
    return body.data;
  },

  resendOtp: async (payload: { email: string }) =>
    (await publicRequest<Record<string, never>>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    })).message,

  forgotPassword: async (payload: { email: string }) =>
    (await publicRequest<Record<string, never>>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    })).message,

  verifyResetOtp: async (payload: { email: string; otp: string }) =>
    (await publicRequest<{ reset_token: string }>("/auth/verify-reset-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    })).data,

  // Authenticated by the short-lived reset token from verifyResetOtp, not the
  // session — so it goes through publicRequest with an explicit header.
  resetPassword: async (payload: { reset_token: string; new_password: string }) =>
    (await publicRequest<Record<string, never>>("/auth/reset-password", {
      method: "POST",
      headers: { Authorization: `Bearer ${payload.reset_token}` },
      body: JSON.stringify({ new_password: payload.new_password }),
    })).message,

  logout: async () => {
    const refresh_token = getRefreshToken();
    clearSession();
    if (refresh_token) {
      await publicRequest("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token }),
      }).catch(() => undefined); // local session is gone either way
    }
  },
};

export const projects = {
  list: async (params?: { page?: number; limit?: number }) => {
    const body = await request<Project[]>(`/projects${paginated(params)}`);
    return { data: body.data, meta: body.meta! } satisfies Paginated<Project>;
  },

  get: async (id: string) => (await request<Project>(`/projects/${id}`)).data,

  create: async (payload: {
    name: string;
    timezone: string;
    summary_time?: string;
    repo_url?: string;
  }) =>
    (await request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    })).data,

  update: async (
    id: string,
    payload: {
      summary_voice?: SummaryVoice;
      summary_time?: string;
      name?: string;
    },
  ) =>
    (await request<Project>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })).data,

  remove: async (id: string) =>
    (await request<Record<string, never>>(`/projects/${id}`, {
      method: "DELETE",
    })).message,

  logs: async (id: string, params?: { page?: number; limit?: number }) => {
    const body = await request<LogEntry[]>(
      `/projects/${id}/logs${paginated(params)}`,
    );
    return { data: body.data, meta: body.meta! } satisfies Paginated<LogEntry>;
  },
};

export const pat = {
  list: async (projectId: string, params?: { page?: number; limit?: number }) => {
    const body = await request<PatKey[]>(
      `/pat/project/${projectId}${paginated(params)}`,
    );
    return { data: body.data, meta: body.meta! } satisfies Paginated<PatKey>;
  },

  create: async (payload: {
    project_id: string;
    name?: string;
    expires_in_days?: number;
  }) =>
    (await request<CreatedPatKey>("/pat", {
      method: "POST",
      body: JSON.stringify(payload),
    })).data,

  revoke: async (id: string) =>
    (await request<PatKey>(`/pat/${id}`, { method: "DELETE" })).data,

  /** Same key row, new secret (shown once); the old token dies immediately. */
  regenerate: async (id: string) =>
    (await request<CreatedPatKey>(`/pat/${id}/regenerate`, { method: "POST" }))
      .data,
};

export const billing = {
  get: async () => (await request<Billing>("/billing")).data,

  /** Throws ApiError 400 when billing isn't configured in this environment. */
  checkout: async () =>
    (await request<BillingCheckout>("/billing/checkout")).data,

  portal: async () =>
    (await request<{ url: string }>("/billing/portal", { method: "POST" }))
      .data.url,
};

export const summaries = {
  listByProject: async (
    projectId: string,
    params?: { page?: number; limit?: number },
  ) => {
    const body = await request<Summary[]>(
      `/summaries/project/${projectId}${paginated(params)}`,
    );
    return {
      data: body.data,
      meta: body.meta!,
      locked: body.locked ?? 0,
      limits: body.limits,
    } satisfies SummaryList;
  },

  get: async (id: string) => (await request<Summary>(`/summaries/${id}`)).data,

  /** Enable public sharing; returns the share token + public URL. */
  share: async (id: string) =>
    (await request<ShareLink>(`/summaries/${id}/share`, { method: "POST" }))
      .data,

  unshare: async (id: string) => {
    await request(`/summaries/${id}/share`, { method: "DELETE" });
  },

  /** Public, unauthenticated — used by the /s/[token] page and its OG image. */
  shared: async (token: string) =>
    (await publicRequest<SharedSummary>(`/summaries/shared/${token}`)).data,

  standup: async (id: string) =>
    (await request<{ text: string }>(`/summaries/${id}/standup`)).data.text,

  /** The project's shared daily budget — recap builds draw it down too. */
  usage: async (projectId: string) =>
    (await request<UpdateUsage>(`/summaries/project/${projectId}/usage`)).data,

  generate: async (payload: { project_id: string; include_today?: boolean }) =>
    (await request<GenerateSummaryResponse>("/summaries/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    })).data,
};

export const recaps = {
  listByProject: async (
    projectId: string,
    params?: { page?: number; limit?: number },
  ) => {
    const body = await request<Recap[]>(
      `/recaps/project/${projectId}${paginated(params)}`,
    );
    return { data: body.data, meta: body.meta! } satisfies Paginated<Recap>;
  },

  get: async (id: string) => (await request<Recap>(`/recaps/${id}`)).data,

  /**
   * Build the recap for a span of project days. Re-running the same span
   * rebuilds it in place, so the id and any share link survive.
   * Throws ApiError 402 on the free plan, 404 when the span has no day
   * summaries yet.
   */
  create: async (payload: {
    project_id: string;
    start_date: string;
    end_date: string;
  }) =>
    (await request<Recap>("/recaps", {
      method: "POST",
      body: JSON.stringify(payload),
    })).data,

  remove: async (id: string) => {
    await request(`/recaps/${id}`, { method: "DELETE" });
  },

  share: async (id: string) =>
    (await request<ShareLink>(`/recaps/${id}/share`, { method: "POST" })).data,

  unshare: async (id: string) => {
    await request(`/recaps/${id}/share`, { method: "DELETE" });
  },

  /** Public, unauthenticated — used by the /r/[token] page and its OG image. */
  shared: async (token: string) =>
    (await publicRequest<SharedRecap>(`/recaps/shared/${token}`)).data,

  standup: async (id: string) =>
    (await request<{ text: string }>(`/recaps/${id}/standup`)).data.text,
};

export const feedback = {
  /** Who am I on the board: admin flag plus the enum lists the API accepts. */
  me: async () => (await request<FeedbackMe>("/feedback/me")).data,

  list: async (params?: {
    page?: number;
    limit?: number;
    status?: FeedbackStatus;
    category?: FeedbackCategory;
    sort?: FeedbackSort;
    mine?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);
    if (params?.category) query.set("category", params.category);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.mine) query.set("mine", "true");
    const qs = query.toString();
    const body = await request<FeedbackPost[]>(`/feedback${qs ? `?${qs}` : ""}`);
    return { data: body.data, meta: body.meta! } satisfies Paginated<FeedbackPost>;
  },

  get: async (id: string) =>
    (await request<FeedbackPost>(`/feedback/${id}`)).data,

  create: async (payload: {
    title: string;
    body: string;
    category?: FeedbackCategory;
  }) =>
    (await request<FeedbackPost>("/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    })).data,

  update: async (
    id: string,
    payload: { title?: string; body?: string; category?: FeedbackCategory },
  ) =>
    (await request<FeedbackPost>(`/feedback/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })).data,

  remove: async (id: string) =>
    (await request<{ id: string }>(`/feedback/${id}`, { method: "DELETE" }))
      .message,

  // Both idempotent — a double-click lands on the same state.
  vote: async (id: string) =>
    (await request<FeedbackVoteResult>(`/feedback/${id}/vote`, {
      method: "POST",
    })).data,
  unvote: async (id: string) =>
    (await request<FeedbackVoteResult>(`/feedback/${id}/vote`, {
      method: "DELETE",
    })).data,

  /** Oldest first. */
  comments: async (id: string, params?: { page?: number; limit?: number }) => {
    const body = await request<FeedbackComment[]>(
      `/feedback/${id}/comments${paginated(params)}`,
    );
    return {
      data: body.data,
      meta: body.meta!,
    } satisfies Paginated<FeedbackComment>;
  },

  addComment: async (id: string, payload: { body: string }) =>
    (await request<FeedbackComment>(`/feedback/${id}/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    })).data,

  removeComment: async (id: string, commentId: string) =>
    (await request<{ id: string }>(
      `/feedback/${id}/comments/${commentId}`,
      { method: "DELETE" },
    )).message,

  /** Admin only. Planned / In progress / Done email the author server-side. */
  setStatus: async (
    id: string,
    payload: { status: FeedbackStatus; note?: string },
  ) =>
    (await request<FeedbackPost>(`/feedback/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })).data,
};
