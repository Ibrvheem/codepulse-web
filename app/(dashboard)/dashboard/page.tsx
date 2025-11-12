import { getProjects } from "./service";
import { ProjectItem } from "./_components/project-card";
import { DashboardHeader } from "./_components/dashboard-header";
import { StatsOverview } from "./_components/stats-overview";
import { ProjectsGrid } from "./_components/projects-grid";

export default async function Page() {
  const projects = (await getProjects()) ?? [];

  const transformedProjects: ProjectItem[] =
    projects?.map((project: any) => ({
      id: project.id,
      title: project.name,
      description: project.description,
      link: project.link,
      patKeys: project.patKeys,
    })) || [];

  // Calculate dashboard statistics
  const stats = {
    totalProjects: projects?.length || 0,
    activeProjects:
      projects?.filter((p: any) => p._count.rawLogs > 0).length || 0,
    totalLogs:
      projects?.reduce((acc: number, p: any) => acc + p._count.rawLogs, 0) || 0,
    totalSummaries:
      projects?.reduce(
        (acc: number, p: any) => acc + p._count.workLogSummaries,
        0
      ) || 0,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <DashboardHeader projectCount={stats?.totalProjects} />

        <StatsOverview
          totalProjects={stats?.totalProjects}
          activeProjects={stats?.activeProjects}
          totalLogs={stats?.totalLogs}
          totalSummaries={stats?.totalSummaries}
        />

        <div className="mt-10">
          <ProjectsGrid projects={transformedProjects} />
        </div>
      </div>
    </div>
  );
}
