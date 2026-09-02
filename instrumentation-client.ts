// Sentry for the browser. Next 15.3+ loads this file on every page.
// No-ops when the DSN is unset (local dev).
import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: Number(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1,
    ),
    // replay on (Ibrahim's call, 2026-09-02): every errored session, 10% of
    // the rest — the free-tier replay quota is small and PostHog records all
    // sessions anyway. Text visible, inputs masked (passwords, wrlg_ keys).
    integrations: [
      Sentry.replayIntegration({ maskAllText: false, maskAllInputs: true }),
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// PostHog product analytics. No-ops when the key is unset (local dev).
// Key comes from the dedicated WriteLogs PostHog project, set in Vercel env.
if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    defaults: "2025-05-24",
    // recordings on (Ibrahim's call, 2026-09-02); inputs are masked so
    // passwords and project keys don't end up in replays
    session_recording: { maskAllInputs: true },
  });
}
