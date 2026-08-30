"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion/fade-in";
import { ErrorState } from "../../../_components/query-states";
import { useProject } from "../_hooks/use-project-data";
import { SummariesTab } from "./summaries-tab";
import { ActivityTab } from "./activity-tab";
import { KeysTab } from "./keys-tab";
import { SettingsTab } from "./settings-tab";
import { formatDayEnd } from "@/lib/project-day";

const TABS = ["summaries", "activity", "keys", "settings"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  summaries: "Summaries",
  activity: "Activity",
  keys: "Keys",
  settings: "Settings",
};

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
  const reduceMotion = useReducedMotion();
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
              {project.timezone} · day ends{" "}
              {formatDayEnd(project.summary_time).toLowerCase()}
              {project._count &&
                ` · ${project._count.log_entries} logs · ${project._count.summaries} summaries`}
            </p>
          </FadeIn>
        )}
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
        <TabsList>
          {TABS.map((value) => (
            <TabsTrigger
              key={value}
              value={value}
              // The static active-pill styles move onto the shared motion span
              // below so one element can glide between triggers.
              className="data-[state=active]:bg-transparent! data-[state=active]:shadow-none! dark:data-[state=active]:border-transparent! dark:data-[state=active]:bg-transparent!"
            >
              {tab === value && (
                <motion.span
                  layoutId="project-tab-pill"
                  className="absolute inset-0 rounded-md bg-background shadow-sm dark:border dark:border-input dark:bg-input/30"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", duration: 0.5, bounce: 0.2 }
                  }
                />
              )}
              <span className="relative z-10">{TAB_LABELS[value]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent
          value="summaries"
          className="mt-4 opacity-100 transition-opacity duration-200 ease-out starting:opacity-0"
        >
          <SummariesTab projectId={projectId} />
        </TabsContent>
        <TabsContent
          value="activity"
          className="mt-4 opacity-100 transition-opacity duration-200 ease-out starting:opacity-0"
        >
          <ActivityTab projectId={projectId} />
        </TabsContent>
        <TabsContent
          value="keys"
          className="mt-4 opacity-100 transition-opacity duration-200 ease-out starting:opacity-0"
        >
          <KeysTab projectId={projectId} />
        </TabsContent>
        <TabsContent
          value="settings"
          className="mt-4 opacity-100 transition-opacity duration-200 ease-out starting:opacity-0"
        >
          <SettingsTab projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
