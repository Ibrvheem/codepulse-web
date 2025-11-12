"use client";
import { Button } from "@/components/ui/button";
import { Key, ArrowRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { useState } from "react";

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
  const [isDeleting, setIsDeleting] = useState(false);
  
  const latestPatKey =
    item.patKeys && item.patKeys.length > 0
      ? item.patKeys.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
      : null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // TODO: Implement your delete API call here
      // await fetch(`/api/projects/${item.id}`, { method: 'DELETE' });
      console.log("Deleting project:", item.id);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Optionally refresh the page or update state
      // window.location.reload();
    } catch (error) {
      console.error("Failed to delete project:", error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      
      className=" cursor-pointer border border-gray-200 rounded-lg p-6 hover:border-gray-400 hover:shadow-sm transition-all bg-white"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-900 mb-1 group-hover:text-gray-700">
            {item.title}
          </h3>
          <DeleteConfirmationDialog
            projectName={item.title}
            onConfirm={handleDelete}
            isDeleting={isDeleting}
          >
            <Button 
              size={'icon'} 
              variant="ghost" 
              className="float-right -mt-0.5 text-red-500 hover:bg-red-100 hover:text-red-600"
            >
              <Trash2/>
            </Button>
          </DeleteConfirmationDialog>
          </div>
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
        <div className="border-t my-2"/>

        <div className=" group p-2 border-gray-100 rounded-md  hover:bg-blue-50 flex items-center justify-between text-sm ease-in-out transition-all" onClick={() => push(`/dashboard/${item.id}`)}>
          <span className="text-gray-500 group-hover:text-blue-600">View project</span>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 group-hover:text-blue-600 transition-all" />
        </div>
      </div>
    </div>
  );
}
