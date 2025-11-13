import React from "react";
import { getProject } from "../service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Calendar,
  FileText,
  Clock,
  BarChart3,
  TrendingUp,
  Code2,
  ExternalLink,
  Trash,
} from "lucide-react";
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
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-semibold text-gray-900">
                  {project.name}
                </h1>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  Active
                </Badge>
              </div>
              {project.description && (
                <p className="text-sm text-gray-600 max-w-2xl">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </div>
                {project.repoUrl && (
                  <div className="flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <a
                      href={project.repoUrl}
                      className="text-gray-700 hover:text-gray-900 hover:underline"
                    >
                      Repository
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <DeleteConfirmationDialog
                projectName={project.name}
                projectId={project.id}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-700 border-red-500 hover:border-red-700 hover:text-red-900"
                >
                  <Trash className="w-4 h-4 mr-0" />
                  Delete
                </Button>
              </DeleteConfirmationDialog>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Raw Logs
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {project._count.rawLogs}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Summaries
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {project._count.workLogSummaries}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    API Keys
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {project.patKeys.length}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50">
                  <Key className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Active Keys
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {project.patKeys.filter((key) => key.lastUsed).length}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Column - Work Logs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Work Log Summaries
              </h2>
            </div>
            {!project.workLogSummaries ||
            project.workLogSummaries.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    No work summaries yet
                  </h3>
                  <p className="text-sm text-gray-600 max-w-sm mb-4">
                    Start generating AI-powered summaries of your development
                    work.
                  </p>
                </div>
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
          <div className="space-y-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
                <CardDescription className="text-xs">
                  Common tasks for this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <GenerateApiKeyPopover projectId={project.id} />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm"
                >
                  <Code2 className="w-4 h-4 mr-2" />
                  View Integration Guide
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export Summary Data
                </Button>
              </CardContent>
            </Card>

            {/* API Keys Management */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    API Keys
                  </CardTitle>
                  {/* <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button> */}
                </div>
                <CardDescription className="text-xs">
                  {project.patKeys.length} active{" "}
                  {project.patKeys.length === 1 ? "key" : "keys"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {project.patKeys.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Key className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs">No API keys yet</p>
                  </div>
                ) : (
                  project?.patKeys?.map((key) => (
                    <div
                      key={key.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {key.name}
                        </span>
                        <Badge
                          variant={key.lastUsed ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {key.lastUsed ? "Active" : "Unused"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        Created {new Date(key.createdAt).toLocaleDateString()}
                      </p>
                      {key.lastUsed && (
                        <p className="text-xs text-gray-500">
                          Last used{" "}
                          {new Date(key.lastUsed).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Project ID
                  </label>
                  <p className="font-mono text-xs bg-gray-50 p-2 rounded mt-1 border border-gray-200">
                    {project.id}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkLogSummaryCard({ summary }: { summary: any }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-200 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            {summary.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {summary.logsCount} changes
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(summary.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(summary.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link href={`/dashboard/${summary.projectId}/summary/${summary.id}`}>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
