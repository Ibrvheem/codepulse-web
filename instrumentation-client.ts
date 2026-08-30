// Sentry for the browser. Next 15.3+ loads this file on every page.
// No-ops when the DSN is unset (local dev).
import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: Number(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1,
    ),
    // no session replay: the dashboard shows the user's own work data and a
    // replay would record it
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
