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
    // sessions anyway. Since 2026-09-03 inputs record too; only secrets are
    // masked: password fields plus anything tagged data-mask (wrlg_ key
    // reveals, OTP entry).
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        maskAllInputs: false,
        mask: ['input[type="password"]', '[data-mask]'],
      }),
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
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    defaults: "2025-05-24",
    // recordings on (Ibrahim's call, 2026-09-02); since 2026-09-03 inputs
    // record too — only secrets are masked: password fields plus anything
    // tagged data-mask (wrlg_ key reveals, OTP entry)
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: { password: true },
      maskTextSelector: '[data-mask]',
    },
  });
}
