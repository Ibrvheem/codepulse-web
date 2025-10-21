"use client";
import { Key, ArrowRight } from "lucide-react";
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
      onClick={() => push(`/dashboard/${item.id}`)}
      className="group cursor-pointer border border-gray-200 rounded-lg p-6 hover:border-gray-400 hover:shadow-sm transition-all bg-white"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <h3 className="text-base font-medium text-gray-900 mb-1 group-hover:text-gray-700">
            {item.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            {item.description || "No description"}
          </p>

          {latestPatKey && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded text-xs text-gray-600 font-mono border border-gray-200">
              <Key className="w-3 h-3" />
              <span>{latestPatKey.key}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-gray-500">View project</span>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}
