export const dynamic = "force-dynamic";
import { DashboardSidebar } from "@/components/organisms/dashboard-sidebar";
import { clearAuthTokens, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check feature flag
  const dashboardFeatureFlag = process.env.DASHBOARD_FEATURE_FLAG;
  if (!dashboardFeatureFlag) {
    redirect("/waitlist");
  }

  const user = await getCurrentUser();
  if (!user) {
    await clearAuthTokens();
    redirect("/login");
  }

  return <DashboardSidebar user={user}>{children}</DashboardSidebar>;
}
