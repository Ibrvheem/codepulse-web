import type { Metadata } from "next";
import { Suspense } from "react";

import { MeetConnect } from "./meet-connect";

export const metadata: Metadata = { title: "Connect WriteLogs" };

export default function MeetConnectPage() {
  return (
    <Suspense fallback={null}>
      <MeetConnect />
    </Suspense>
  );
}
