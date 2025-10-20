import { getProjects } from "./service";
import NewProjectCard from "./_components/new-project-card";
import { Card, CardDescription, CardTitle } from "./_components/custom-card";
import { Button } from "@/components/ui/button";
import { Key, Shield } from "lucide-react";

type ProjectItem = {
  title: string;
  description: string;
  link: string;
  patKeys?: Array<{
    id: string;
    key: string;
    name: string;
    createdAt: string;
  }>;
};

export default async function Page() {
  const projects = await getProjects();
  const transformedProjects: ProjectItem[] =
    projects?.map((project: any) => ({
      title: project.name,
      description: project.description,
      link: project.link,
      patKeys: project.patKeys,
    })) || [];

  console.log(projects);
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

function ProjectCard({ item }: { item: ProjectItem }) {
  const latestPatKey =
    item.patKeys && item.patKeys.length > 0
      ? item.patKeys.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
      : null;

  return (
    <div className="group block p-2 h-full w-full min-h-64">
      <div className="!flex !flex-col !justify-between border border-border rounded-2xl w-full !h-full p-8 relative overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="!text-black">{item.title}</CardTitle>
          </div>

          <CardDescription className="!text-black flex-1">
            <div className="line-clamp-3 overflow-hidden">
              {item.description || "No description provided."}
            </div>
          </CardDescription>
          {/* PAT Key Display */}
          {latestPatKey && (
            <div className="mb-2 p-2 bg-gray-50 rounded border-l-2 border-indigo-500">
              <div className="flex items-center gap-2">
                <Key className="w-3 h-3 text-indigo-600" />
                <div className="font-mono text-xs text-gray-700 truncate">
                  {latestPatKey.key}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
            {latestPatKey ? "Generate New Key" : "Generate First Key"}
          </Button>
        </div>
      </div>
    </div>
  );
}
