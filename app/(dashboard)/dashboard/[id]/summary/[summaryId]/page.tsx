import React from "react";
import Link from "next/link";
import { getSummaries, getProject } from "../../../service";
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
  ArrowLeft,
  Calendar,
  Clock,
  FileCode,
  Tag,
  Zap,
  Bot,
  Share2,
  Download,
  AlertCircle,
} from "lucide-react";

type Task = {
  id: string;
  task: string;
  files: string[];
  description: string;
  time_minutes_estimate: number;
  tags: string[];
  confidence: number;
  createdAt: string;
  workLogSummaryId: string;
};

type SummaryPageProps = {
  params: Promise<{ id: string; summaryId: string }>;
};

export default async function TasksSummaryPage({ params }: SummaryPageProps) {
  const { id: projectId, summaryId } = await params;

  const [tasks, project] = await Promise.all([
    getSummaries(summaryId),
    getProject(projectId),
  ]);

  console.log("Fetched tasks:", tasks);
  console.log("Fetched project:", project);

  if (!tasks || tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href={`/dashboard/${projectId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Project
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Summary Not Found
              </h3>
              <p className="text-gray-600 text-center">
                This work log summary doesn&apos;t exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalTimeEstimate = tasks?.reduce(
    (sum: number, task: Task) => sum + task.time_minutes_estimate,
    0
  );
  const uniqueTags = [
    ...new Set(tasks.flatMap((task: Task) => task.tags)),
  ] as string[];
  const uniqueFiles = [
    ...new Set(tasks.flatMap((task: Task) => task.files)),
  ] as string[];
  const averageConfidence =
    tasks?.reduce((sum: number, task: Task) => sum + task.confidence, 0) /
    tasks.length;

  // Get summary title from the first task (assuming it's in the project data)
  const summaryTitle =
    project?.workLogSummaries?.find((s: any) => s.id === summaryId)?.title ||
    "Work Log Summary";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/${projectId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to {project?.name || "Project"}
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {summaryTitle}
                </h1>
                <p className="text-gray-600">
                  Generated on{" "}
                  {new Date(tasks[0]?.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Tasks */}
          <div className="lg:col-span-3 space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {tasks.length}
                  </div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(totalTimeEstimate / 60)}h{" "}
                    {totalTimeEstimate % 60}m
                  </div>
                  <div className="text-sm text-gray-600">Time Invested</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {uniqueFiles.length}
                  </div>
                  <div className="text-sm text-gray-600">Files Changed</div>
                </CardContent>
              </Card>
            </div>

            {/* Task List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Development Tasks
                </h2>
              </div>

              {tasks.map((task: Task, index: number) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Session Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Generated At
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(tasks[0]?.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Session Duration
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    ~{Math.round(totalTimeEstimate / 60)} hours{" "}
                    {totalTimeEstimate % 60} minutes
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Confidence Score
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${averageConfidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900">
                      {Math.round(averageConfidence * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Activity Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {uniqueTags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Files */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="w-5 h-5" />
                  Modified Files
                </CardTitle>
                <CardDescription>
                  {uniqueFiles.length} files changed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {uniqueFiles.slice(0, 5).map((file: string, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs"
                    >
                      <FileCode className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate font-mono">
                        .../{file.split("/").pop()}
                      </span>
                    </div>
                  ))}
                  {uniqueFiles.length > 5 && (
                    <div className="text-xs text-gray-500 p-2">
                      +{uniqueFiles.length - 5} more files
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, index }: { task: Task; index: number }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-indigo-600">
              {index + 1}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                {task.task}
              </h3>
              <div className="flex items-center gap-2 ml-4">
                <Badge
                  className={`${
                    task.confidence >= 0.9
                      ? "bg-green-100 text-green-800"
                      : task.confidence >= 0.7
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {Math.round(task.confidence * 100)}% confident
                </Badge>
              </div>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">
              {task.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />~{task.time_minutes_estimate} min
                </div>
                <div className="flex items-center gap-1">
                  <FileCode className="w-4 h-4" />
                  {task.files.length} files
                </div>
              </div>

              <div className="flex gap-1">
                {task.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs capitalize"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {task.files.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-500 mb-2">
                  Modified files:
                </div>
                <div className="space-y-1">
                  {task.files.slice(0, 3).map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className="flex items-center gap-2 text-xs"
                    >
                      <FileCode className="w-3 h-3 text-gray-400" />
                      <span className="font-mono text-gray-600 truncate">
                        {file.replace(/^.*\/([^\/]+\/[^\/]+)$/, ".../$1")}
                      </span>
                    </div>
                  ))}
                  {task.files.length > 3 && (
                    <div className="text-xs text-gray-500 pl-5">
                      +{task.files.length - 3} more files
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
