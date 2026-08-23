import type { Metadata } from "next";
import { ProjectsView } from "./_components/projects-view";

export const metadata: Metadata = { title: "Projects — WriteLogs" };

export default function DashboardPage() {
  return <ProjectsView />;
}
