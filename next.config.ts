import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // Retired comparison page. Naming a bigger competitor did more for
        // them than for us, so its traffic goes to the unbranded guide.
        source: "/pieces-alternative",
        destination: "/automate-daily-standup",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // The Meet add-on runs inside an iframe on meet.google.com. Every
        // other route stays unframeable — this allowance is scoped to /meet.
        source: "/meet/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://meet.google.com https://*.google.com",
          },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

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
