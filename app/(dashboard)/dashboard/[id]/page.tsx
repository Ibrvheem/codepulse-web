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
import {
  Key,
  Calendar,
  FileText,
  Activity,
  GitBranch,
  Plus,
} from "lucide-react";
import { PatKeyCard } from "../_components/pat-key-card";

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
  const project: Project = await getProject(params.id);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-1">
            {project.description || "No description provided"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <GitBranch className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Generate Key
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">PAT Keys</p>
                <p className="text-2xl font-bold">{project.patKeys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Raw Logs</p>
                <p className="text-2xl font-bold">{project._count.rawLogs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Summaries</p>
                <p className="text-2xl font-bold">
                  {project._count.workLogSummaries}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-sm font-medium">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PAT Keys Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                PAT Keys ({project.patKeys.length})
              </CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Key
              </Button>
            </div>
            <CardDescription>
              Manage your Personal Access Tokens for this project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.patKeys.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Key className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No PAT keys generated yet</p>
                <p className="text-sm">
                  Generate your first key to get started
                </p>
              </div>
            ) : (
              project.patKeys.map((key) => (
                <PatKeyCard key={key.id} patKey={key} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Project Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Project ID</p>
                <p className="font-mono text-xs bg-gray-100 p-1 rounded">
                  {project.id}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Repository</p>
                <p className="text-gray-900">
                  {project.repoUrl || "Not connected"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Created</p>
                <p className="text-gray-900">
                  {new Date(project.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="text-gray-900">
                  {new Date(project.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
