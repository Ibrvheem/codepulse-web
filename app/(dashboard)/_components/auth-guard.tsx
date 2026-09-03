"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getStoredUser } from "@/lib/api-client";
import { identifyUser } from "@/lib/analytics";

/**
 * The backend owns auth; the client only knows whether a refresh token is
 * stored. That check needs the browser, so gate rendering until mount.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/signin");
      return;
    }
    // Session rehydration: re-attach the analytics identity after a reload
    // (identifyUser is idempotent per user id).
    const user = getStoredUser();
    if (user) identifyUser(user);
    setReady(true);
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
