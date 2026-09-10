import type { Metadata } from "next";
import Script from "next/script";

import { MeetPanel } from "./_components/meet-panel";

export const metadata: Metadata = { title: "WriteLogs for Meet" };

/** Pinned version — the SDK is loaded from Google's CDN, not bundled. */
const MEET_SDK = "https://www.gstatic.com/meetjs/addons/1.1.0/meet.addons.js";

export default function MeetPanelPage() {
  return (
    <>
      <Script src={MEET_SDK} strategy="beforeInteractive" />
      <MeetPanel />
    </>
  );
}
