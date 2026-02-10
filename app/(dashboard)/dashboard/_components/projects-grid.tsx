import { ProjectCard, ProjectItem } from "./project-card";

interface ProjectsGridProps {
  projects: ProjectItem[];
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  if (projects.length === 0) {
    return (
      <div className="border border-dashed border-gray-200 rounded-lg py-16 text-center">
        <p className="text-gray-500 mb-1">No projects yet</p>
        <p className="text-sm text-gray-400">
          Create your first project to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects?.map((item: ProjectItem) => (
        <ProjectCard key={item.id} item={item} />
      ))}
    </div>
  );
}
