"use client";

// PostHog user identification. The client is initialized once in
// instrumentation-client.ts — this module only attaches/detaches identity.
// Every call is guarded: PostHog may be uninitialized (no key in local dev)
// or blocked by an ad blocker, and analytics must never break auth flows.

import posthog from "posthog-js";
import type { User } from "./types";

// Idempotence across renders/route changes; posthog.identify is cheap but
// the task is to fire once per user, not once per render.
let identifiedUserId: string | null = null;

function ready(): boolean {
  return typeof window !== "undefined" && posthog.__loaded;
}

/**
 * Link this browser's events to our own database user id (the primary key —
 * that's what makes PostHog rows joinable to the DB). Person properties stay
 * limited to email + name; nothing else leaves the auth payload.
 */
export function identifyUser(user: User): void {
  if (!user?.id || identifiedUserId === user.id) return;
  try {
    if (!ready()) return;
    posthog.identify(user.id, {
      email: user.email,
      name: user.full_name,
    });
    identifiedUserId = user.id;
  } catch {
    // analytics must never throw into the login flow
  }
}

/** Person-property enrichment for data that arrives after login (plan tier). */
export function setAnalyticsPlan(plan: string): void {
  try {
    if (!ready() || !identifiedUserId) return;
    posthog.setPersonProperties({ plan });
  } catch {
    // ignore
  }
}

/**
 * Called on logout BEFORE the session is cleared — without it the next
 * person to sign in on this browser inherits the previous identity.
 */
export function resetAnalytics(): void {
  identifiedUserId = null;
  try {
    if (!ready()) return;
    posthog.reset();
  } catch {
    // ignore
  }
}
