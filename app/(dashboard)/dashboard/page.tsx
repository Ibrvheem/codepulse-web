import { Card, HoverEffect } from "@/components/ui/card-hover-effect";
import { getProjects } from "./service";

export default async function Page() {
  const projects = await getProjects();
  const transformedProjects = projects?.map((project: any) => ({
    title: project.name,
    description: project.description,
    link: project.link,
  }));
  return (
    <div className="bg-white">
      <HoverEffect items={transformedProjects} />
    </div>
  );
}
