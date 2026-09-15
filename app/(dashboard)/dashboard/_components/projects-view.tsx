"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StaggerReveal, StaggerItem } from "@/components/motion/stagger-reveal";
import { EmptyState, ErrorState } from "../../_components/query-states";
import { useBilling } from "../../_hooks/use-billing";
import { useUpgradePrompt } from "../../_hooks/use-upgrade-toast";
import { useProjects } from "../_hooks/use-projects";
import { CreateProjectDialog } from "./create-project-dialog";
import { ProjectCard } from "./project-card";
import { ProjectsSkeleton } from "./projects-skeleton";

export function ProjectsView() {
  const { data, isPending, isError, error, refetch, isRefetching } =
    useProjects();
  const { data: billing } = useBilling();
  const upgradePrompt = useUpgradePrompt();
  // Free plan caps projects; null means unlimited and we say nothing.
  const maxProjects = billing?.limits.max_projects ?? null;
  const atLimit =
    maxProjects !== null && data !== undefined && data.meta.total >= maxProjects;

  // At the cap the API would 402 on submit anyway — don't make them fill the
  // form to find out.
  const newProjectButton = atLimit ? (
    <Button
      size="sm"
      onClick={() =>
        upgradePrompt(
          `The free plan includes ${maxProjects} ${maxProjects === 1 ? "project" : "projects"}. Upgrade to Pro for unlimited projects.`,
        )
      }
    >
      New project
    </Button>
  ) : (
    <CreateProjectDialog>
      <Button size="sm">New project</Button>
    </CreateProjectDialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
          {maxProjects !== null && data && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {data.meta.total} of {maxProjects}{" "}
              {maxProjects === 1 ? "project" : "projects"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/feedback"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Have an idea?
          </Link>
          {newProjectButton}
        </div>
      </div>

      {isPending ? (
        <ProjectsSkeleton />
      ) : isError ? (
        <ErrorState
          message={error.message}
          onRetry={() => refetch()}
          retrying={isRefetching}
        />
      ) : data.data.length === 0 ? (
        <EmptyState
          // Free gets exactly one project, so "first" would be a tease.
          title={maxProjects === 1 ? "Create your project" : "Create your first project"}
          description="A project tracks one codebase. Create it, grab an API key, and the editor extension starts logging your work — summaries follow automatically."
        >
          <CreateProjectDialog>
            <Button>Create a project</Button>
          </CreateProjectDialog>
        </EmptyState>
      ) : (
        <StaggerReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </StaggerReveal>
      )}
    </div>
  );
}
