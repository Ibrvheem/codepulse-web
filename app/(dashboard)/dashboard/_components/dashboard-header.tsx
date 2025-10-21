import { CreateProjectDialog } from "./create-project-dialog";

interface DashboardHeaderProps {
  projectCount: number;
}

export function DashboardHeader({ projectCount }: DashboardHeaderProps) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
          <p className="text-gray-600">
            {projectCount === 0
              ? "Get started by creating your first project"
              : `Manage your ${projectCount} ${
                  projectCount === 1 ? "project" : "projects"
                }`}
          </p>
        </div>
        <CreateProjectDialog />
      </div>
    </div>
  );
}
