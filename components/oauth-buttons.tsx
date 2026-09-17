"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9308";

/**
 * GitHub sign-in is hidden for now. The button is the only way into the flow,
 * and the flow creates an account on first use, so hiding it here stops new
 * GitHub sign-ups. The API route still works; flip this to bring it back.
 */
const SHOW_GITHUB = false;

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.82-.07-1.6-.21-2.36H12v4.47h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.73z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.88-3c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09A11.995 11.995 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.26a12 12 0 0 0 0 10.76l4.01-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.7 0 3.99 2.47 1.26 6.62l4.01 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.8 5.65-5.48 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

/**
 * Sign-in with Google or GitHub. These are plain links, not fetches — the
 * whole point of the flow is a full-page redirect to the provider and back.
 *
 * Wrapped in Suspense because useSearchParams would otherwise opt the
 * statically rendered sign-in and sign-up pages out of prerendering.
 */
export function OauthButtons({ returnTo }: { returnTo?: string }) {
  return (
    <Suspense fallback={<div className="h-[74px]" />}>
      <OauthButtonsInner returnTo={returnTo} />
    </Suspense>
  );
}

function OauthButtonsInner({ returnTo }: { returnTo?: string }) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // The API bounces failures back here with a readable message.
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const href = (provider: "google" | "github") => {
    const params = returnTo ? `?return_to=${encodeURIComponent(returnTo)}` : "";
    return `${API_URL}/auth/oauth/${provider}${params}`;
  };

  return (
    <div className="space-y-3">
      <div className={cn("grid gap-3", SHOW_GITHUB ? "grid-cols-2" : "grid-cols-1")}>
        <a
          href={href("google")}
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          <GoogleIcon className="size-4" />
          {SHOW_GITHUB ? "Google" : "Continue with Google"}
        </a>
        {SHOW_GITHUB ? (
          <a
            href={href("github")}
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            <GithubIcon className="size-4" />
            GitHub
          </a>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
