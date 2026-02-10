import React from "react";
import { getProject } from "../service";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash } from "lucide-react";
import Link from "next/link";
import { GenerateApiKeyPopover } from "./_components/generate-api-key-popover";
import { DeleteConfirmationDialog } from "../_components/delete-confirmation-dialog";

type Project = {
  id: string;
  name: string;
  repoUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  patKeys: Array<{
    id: string;
    name: string;
    createdAt: string;
    lastUsed: string | null;
  }>;
  workLogSummaries?: Array<{
    id: string;
    title: string;
    message: string;
    logsCount: number;
    createdAt: string;
    projectId: string;
  }>;
  _count: {
    rawLogs: number;
    workLogSummaries: number;
  };
};

export default async function SingleProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const project: Project = (await getProject(params.id)) ?? [];

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-sm text-gray-500 max-w-xl">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span>
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    className="text-gray-500 hover:text-gray-700 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Repository
                  </a>
                )}
              </div>
            </div>
            <DeleteConfirmationDialog
              projectName={project.name}
              projectId={project.id}
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </DeleteConfirmationDialog>
          </div>

          {/* Quick Stats - inline style */}
          <div className="flex items-center gap-8 text-sm text-gray-500 pt-4 border-t border-gray-100">
            <div>
              <span className="font-semibold text-gray-900">
                {project._count.rawLogs}
              </span>
              <span className="ml-1">logs</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">
                {project._count.workLogSummaries}
              </span>
              <span className="ml-1">summaries</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">
                {project.patKeys.length}
              </span>
              <span className="ml-1">API keys</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Primary Column - Work Logs */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-medium text-gray-500 mb-4">
              Work Log Summaries
            </h2>
            {!project.workLogSummaries ||
            project.workLogSummaries.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-lg p-8 text-center">
                <p className="text-sm text-gray-500 mb-1">
                  No work summaries yet
                </p>
                <p className="text-xs text-gray-400">
                  Summaries will appear here as you log work
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {project?.workLogSummaries?.map((summary) => (
                  <WorkLogSummaryCard key={summary.id} summary={summary} />
                ))}
              </div>
            )}
          </div>

          {/* Secondary Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Actions
              </h3>
              <GenerateApiKeyPopover projectId={project.id} />
            </div>

            {/* API Keys */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                API Keys
              </h3>
              {project.patKeys.length === 0 ? (
                <p className="text-xs text-gray-400">No API keys yet</p>
              ) : (
                <div className="space-y-2">
                  {project?.patKeys?.map((key) => (
                    <div
                      key={key.id}
                      className="p-3 border border-gray-100 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {key.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {key.lastUsed ? "Active" : "Unused"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Created {new Date(key.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Project ID
              </h3>
              <p className="font-mono text-xs text-gray-500 bg-gray-50 p-2 rounded">
                {project.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkLogSummaryCard({ summary }: { summary: any }) {
  return (
    <Link
      href={`/dashboard/${summary.projectId}/summary/${summary.id}`}
      className="block border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors"
    >
      <h3 className="text-sm font-medium text-gray-900 mb-2">
        {summary.title}
      </h3>
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>{summary.logsCount} changes</span>
        <span>{new Date(summary.createdAt).toLocaleDateString()}</span>
        <span>
          {new Date(summary.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </Link>
  );
}
