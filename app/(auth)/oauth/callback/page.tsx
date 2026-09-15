import type { Metadata } from "next";
import { Suspense } from "react";

import { OauthCallback } from "./_components/oauth-callback";

export const metadata: Metadata = { title: "Signing you in" };

export default function OauthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OauthCallback />
    </Suspense>
  );
}
