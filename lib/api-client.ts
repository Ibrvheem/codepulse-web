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
  type CreatedPatKey,
  type GenerateSummaryResponse,
  type LogEntry,
  type Paginated,
  type PatKey,
  type Project,
  type SigninResponse,
  type Summary,
  type User,
} from "./types";
import type { Meta } from "./schemas";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9308";

const REFRESH_TOKEN_KEY = "writelogs.refresh_token";
const USER_KEY = "writelogs.user";

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
};

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
  try {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // storage unavailable — the session just won't survive a reload
  }
}

export function clearSession() {
  accessToken = null;
  try {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
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
    throw new ApiError(
      "Can't reach the WriteLogs API. Check your connection and try again.",
      0,
    );
  }
  const body = await parseEnvelope<T>(res);
  if (!res.ok || !body.success) throw new ApiError(body.message, res.status);
  return body;
}

// Single-flight refresh so concurrent 401s trigger exactly one refresh call.
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refresh_token = getRefreshToken();
      if (!refresh_token) return false;
      try {
        const body = await publicRequest<AuthTokens>("/auth/refresh", {
          method: "POST",
          body: JSON.stringify({ refresh_token }),
        });
        storeSession(body.data);
        return true;
      } catch {
        clearSession();
        return false;
      }
    })().finally(() => {
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
  if (!accessToken && getRefreshToken()) await refreshAccessToken();
  if (!accessToken) throw new ApiError("Your session has expired. Sign in again.", 401);

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
    throw new ApiError(
      "Can't reach the WriteLogs API. Check your connection and try again.",
      0,
    );
  }

  if (res.status === 401 && !isRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(path, init, true);
    throw new ApiError("Your session has expired. Sign in again.", 401);
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

  resendOtp: async (payload: { email: string }) =>
    (await publicRequest<Record<string, never>>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(payload),
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
    repo_url?: string;
  }) =>
    (await request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    })).data,

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
};

export const summaries = {
  listByProject: async (
    projectId: string,
    params?: { page?: number; limit?: number },
  ) => {
    const body = await request<Summary[]>(
      `/summaries/project/${projectId}${paginated(params)}`,
    );
    return { data: body.data, meta: body.meta! } satisfies Paginated<Summary>;
  },

  get: async (id: string) => (await request<Summary>(`/summaries/${id}`)).data,

  standup: async (id: string) =>
    (await request<{ text: string }>(`/summaries/${id}/standup`)).data.text,

  generate: async (payload: { project_id: string; include_today?: boolean }) =>
    (await request<GenerateSummaryResponse>("/summaries/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    })).data,
};
