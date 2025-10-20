import { getProjects } from "./service";
import NewProjectCard from "./_components/new-project-card";
import { ProjectCard, ProjectItem } from "./_components/project-card";

export default async function Page() {
  const projects = await getProjects();
  const transformedProjects: ProjectItem[] =
    projects?.map((project: any) => ({
      id: project.id,
      title: project.name,
      description: project.description,
      link: project.link,
      patKeys: project.patKeys,
    })) || [];

  return (
    <div className="bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 py-10">
        {/* New Project Card */}

        {/* Existing Projects */}
        {transformedProjects.map((item: ProjectItem, idx: number) => (
          <ProjectCard key={item.link || idx} item={item} />
        ))}
        <NewProjectCard />
      </div>
    </div>
  );
}
