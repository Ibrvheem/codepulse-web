import { DashboardSidebar } from "@/components/organisms/dashboard-sidebar";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardSidebar>{children}</DashboardSidebar>;
}
