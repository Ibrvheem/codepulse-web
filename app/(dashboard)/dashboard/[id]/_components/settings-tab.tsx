"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "../_hooks/use-project-data";
import { useSummaryTime } from "../_hooks/use-summary-time";
import { useDeleteProject } from "../_hooks/use-delete-project";
import { DayEndSelect } from "./day-end-select";

/** One labelled setting: text on the left, control on the right. */
function SettingRow({
  title,
  description,
  stacked,
  children,
}: {
  title: string;
  description: React.ReactNode;
  /** Put the control under the text instead of beside it (wide controls). */
  stacked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col gap-3 py-4 ${
        stacked ? "" : "sm:flex-row sm:items-center sm:justify-between"
      }`}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground max-w-prose">
          {description}
        </p>
      </div>
      <div className={stacked ? "" : "shrink-0"}>{children}</div>
    </div>
  );
}

function Section({
  title,
  children,
  destructive,
}: {
  title: string;
  children: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <section
      className={`border rounded-lg px-4 bg-card ${destructive ? "border-destructive/40" : ""}`}
    >
      <h2
        className={`pt-4 text-xs font-medium uppercase tracking-wide ${
          destructive ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {title}
      </h2>
      <div className="divide-y">{children}</div>
    </section>
  );
}

export function SettingsTab({ projectId }: { projectId: string }) {
  const { data: project, isPending } = useProject(projectId);
  const dayEnd = useSummaryTime(projectId);
  const deleteProject = useDeleteProject(projectId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typedName, setTypedName] = useState("");
  const nameMatches = typedName.trim() === project?.name;
  const closeConfirm = (open: boolean) => {
    setConfirmOpen(open);
    if (!open) setTypedName("");
  };

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Section title="Summaries">
        <SettingRow
          stacked
          title="Day ends at"
          description={
            <>
              Your summary is written and emailed right after this time (
              {project?.timezone}). Anything you do later counts toward the
              next day.
            </>
          }
        >
          <DayEndSelect
            value={dayEnd.time}
            onChange={dayEnd.setTime}
            disabled={!dayEnd.isReady}
          />
        </SettingRow>
      </Section>

      <Section title="Danger zone" destructive>
        <SettingRow
          title="Delete project"
          description="Disconnects all its keys and removes the project from your dashboard. Captured activity and summaries are retained on our side."
        >
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Delete project
          </Button>
        </SettingRow>
      </Section>

      <Dialog open={confirmOpen} onOpenChange={closeConfirm}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (nameMatches && !deleteProject.isPending) deleteProject.mutate();
            }}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>Delete {project?.name}?</DialogTitle>
              <DialogDescription>
                This disconnects all its keys and removes the project from
                your dashboard. Captured activity and summaries are retained
                on our side.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="confirm-project-name" className="text-xs">
                Type <span className="font-mono">{project?.name}</span> to
                confirm
              </Label>
              <Input
                id="confirm-project-name"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => closeConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!nameMatches}
                loading={deleteProject.isPending}
              >
                Delete project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
