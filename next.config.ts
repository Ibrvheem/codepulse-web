import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {};

// Source-map upload for readable production stack traces. Runs only when
// SENTRY_AUTH_TOKEN is set (CI/production builds); without it the build
// proceeds normally and Sentry just shows minified frames.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true, // no upload chatter in build logs
  widenClientFileUpload: true, // include vendor chunks for full traces
  disableLogger: true, // strip Sentry's own debug logging from the bundle
  sourcemaps: {
    deleteSourcemapsAfterUpload: true, // don't ship maps to visitors
  },
});
