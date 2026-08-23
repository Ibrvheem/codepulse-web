"use client";

import { Button } from "@/components/ui/button";
import { StaggerReveal, StaggerItem } from "@/components/motion/stagger-reveal";
import { EmptyState, ErrorState } from "../../_components/query-states";
import { useProjects } from "../_hooks/use-projects";
import { CreateProjectDialog } from "./create-project-dialog";
import { ProjectCard } from "./project-card";
import { ProjectsSkeleton } from "./projects-skeleton";

export function ProjectsView() {
  const { data, isPending, isError, error, refetch, isRefetching } =
    useProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
        <CreateProjectDialog>
          <Button size="sm">New project</Button>
        </CreateProjectDialog>
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
          title="Create your first project"
          description="A project tracks one codebase. Create it, grab an API key, and the VS Code extension starts logging your work — summaries follow automatically."
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
