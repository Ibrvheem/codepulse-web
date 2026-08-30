"use client";

// App Router's last-resort error boundary: reports the crash to Sentry and
// shows a minimal recovery screen (this replaces the root layout, so it must
// render its own <html>/<body>).
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 13, opacity: 0.7 }}>
            The error has been reported.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 12,
              padding: "6px 14px",
              border: "1px solid #333",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
