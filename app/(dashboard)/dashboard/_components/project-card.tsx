"use client";
import { CardDescription, CardTitle } from "./custom-card";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";
import { useRouter } from "next/navigation";

export type ProjectItem = {
  id: string;
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

export function ProjectCard({ item }: { item: ProjectItem }) {
  console.log("Rendering ProjectCard for item:", item);
  const { push } = useRouter();
  const latestPatKey =
    item.patKeys && item.patKeys.length > 0
      ? item.patKeys.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
      : null;

  return (
    <div
      className="group block p-2 h-full w-full min-h-64"
      onClick={() => push(`/dashboard/${item.id}`)}
    >
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
