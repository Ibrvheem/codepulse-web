"use client";
import { Button } from "@/components/ui/button";
import { Key, ArrowRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

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
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0]
      : null;

  return (
    <div
      className="group cursor-pointer border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors bg-white"
      onClick={() => push(`/dashboard/${item.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
        <DeleteConfirmationDialog projectName={item.title} projectId={item.id}>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </DeleteConfirmationDialog>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
        {item.description || "No description"}
      </p>

      {latestPatKey && (
        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded text-xs text-gray-500 font-mono">
          <Key className="w-3 h-3" />
          <span>{latestPatKey.key}</span>
        </div>
      )}

      <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400 group-hover:text-gray-600 flex items-center gap-1 transition-colors">
          View
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
}
