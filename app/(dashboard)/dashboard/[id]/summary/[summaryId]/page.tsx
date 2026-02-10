import React from "react";
import Link from "next/link";
import { getSummaries, getProject } from "../../../service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, FileCode } from "lucide-react";

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
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <Link href={`/dashboard/${projectId}`}>
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
            </Button>
          </Link>
          <div className="border border-dashed border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-500">Summary not found</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalTimeEstimate = tasks?.reduce(
    (sum: number, task: Task) => sum + task.time_minutes_estimate,
    0,
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link href={`/dashboard/${projectId}`}>
            <Button variant="ghost" size="sm" className="mb-4 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {project?.name || "Project"}
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {summaryTitle}
          </h1>
          <p className="text-sm text-gray-500">
            {new Date(tasks[0]?.createdAt).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          {/* Inline Stats */}
          <div className="flex items-center gap-8 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
            <div>
              <span className="font-semibold text-gray-900">
                {tasks.length}
              </span>
              <span className="ml-1">tasks</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">
                {Math.round(totalTimeEstimate / 60)}h {totalTimeEstimate % 60}m
              </span>
              <span className="ml-1">estimated</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">
                {uniqueFiles.length}
              </span>
              <span className="ml-1">files changed</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">
                {Math.round(averageConfidence * 100)}%
              </span>
              <span className="ml-1">confidence</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content - Tasks */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-medium text-gray-500 mb-4">Tasks</h2>
            <div className="space-y-4">
              {tasks.map((task: Task, index: number) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Tags */}
            {uniqueTags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {uniqueTags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Files ({uniqueFiles.length})
              </h3>
              <div className="space-y-1">
                {uniqueFiles.slice(0, 8).map((file: string, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-gray-500 font-mono py-1"
                  >
                    <FileCode className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="truncate">
                      {file.split("/").slice(-2).join("/")}
                    </span>
                  </div>
                ))}
                {uniqueFiles.length > 8 && (
                  <p className="text-xs text-gray-400 pt-1">
                    +{uniqueFiles.length - 8} more files
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, index }: { task: Task; index: number }) {
  return (
    <div className="border border-gray-100 rounded-lg p-5">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-gray-500">{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">{task.task}</h3>
            <span className="text-xs text-gray-400 ml-2">
              {Math.round(task.confidence * 100)}%
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3">{task.description}</p>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.time_minutes_estimate}m
            </span>
            <span className="flex items-center gap-1">
              <FileCode className="w-3 h-3" />
              {task.files.length} files
            </span>
            {task.tags.length > 0 && <span className="text-gray-300">|</span>}
            {task.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="capitalize">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
