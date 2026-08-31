import type { Metadata } from "next";

import { AuthGuard } from "./_components/auth-guard";

export const metadata: Metadata = { robots: { index: false, follow: false } };
import { Topbar } from "./_components/topbar";
import { TrialBanner } from "./_components/trial-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-svh bg-background">
        <Topbar />
        <TrialBanner />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
