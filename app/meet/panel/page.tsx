import type { Metadata } from "next";

import { MeetPanel } from "./_components/meet-panel";

export const metadata: Metadata = { title: { absolute: "WriteLogs for Meet" } };

export default function MeetPanelPage() {
  return <MeetPanel />;
}
