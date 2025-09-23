import { DashboardSidebar } from "@/components/organisms/dashboard-sidebar";
import { redirect } from "next/navigation";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dashboardFeatureFlag = process.env.DASHBOARD_FEATURE_FLAG;
  if (!dashboardFeatureFlag) {
    redirect("/waitlist");
  }
  return <DashboardSidebar>{children}</DashboardSidebar>;
}
