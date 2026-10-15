import type { Metadata } from "next";
import { CreatorsDashboard } from "./_components/creators-dashboard";

export const metadata: Metadata = { title: "Creators" };

export default function CreatorsPage() {
  return <CreatorsDashboard />;
}
