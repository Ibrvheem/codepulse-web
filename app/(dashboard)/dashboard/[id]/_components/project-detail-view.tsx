"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion/fade-in";
import { ErrorState } from "../../../_components/query-states";
import { useProject } from "../_hooks/use-project-data";
import { SummariesTab } from "./summaries-tab";
import { ActivityTab } from "./activity-tab";
import { KeysTab } from "./keys-tab";

const TABS = ["summaries", "activity", "keys"] as const;
type Tab = (typeof TABS)[number];

export function ProjectDetailView({
  projectId,
  initialTab,
}: {
  projectId: string;
  initialTab?: string;
}) {
  const [tab, setTab] = useState<Tab>(
    TABS.includes(initialTab as Tab) ? (initialTab as Tab) : "summaries",
  );
  const { data: project, isPending, isError, error, refetch, isRefetching } =
    useProject(projectId);

  if (isError) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => refetch()}
        retrying={isRefetching}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Projects
        </Link>
        {isPending ? (
          <Skeleton className="h-7 w-48 mt-2" />
        ) : (
          <FadeIn>
            <h1 className="text-xl font-semibold tracking-tight mt-1">
              {project.name}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {project.timezone}
              {project._count &&
                ` · ${project._count.log_entries} logs · ${project._count.summaries} summaries`}
            </p>
          </FadeIn>
        )}
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
        <TabsList>
          <TabsTrigger value="summaries">Summaries</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="keys">Keys</TabsTrigger>
        </TabsList>
        <TabsContent value="summaries" className="mt-4">
          <SummariesTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <ActivityTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="keys" className="mt-4">
          <KeysTab projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
