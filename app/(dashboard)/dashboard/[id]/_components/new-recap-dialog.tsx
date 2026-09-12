"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ControlledInput from "@/components/molecules/controlled-input";
import { useProject } from "../_hooks/use-project-data";
import { useCreateRecap } from "../_hooks/use-recaps";
import { useBilling } from "../../../_hooks/use-billing";
import {
  formatSpan,
  recapPresets,
  spanDays,
  type RecapRange,
} from "../_lib/recap-range";
import { createRecapPayloadSchema, type CreateRecapPayload } from "../types";

const DEFAULT_MAX_DAYS = 31;

export function NewRecapDialog({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { data: project } = useProject(projectId);
  const { data: billing } = useBilling();
  const create = useCreateRecap(projectId, () => setOpen(false));

  const maxDays = billing?.limits.recap_max_days ?? DEFAULT_MAX_DAYS;
  // A one-day "this week" (it's Monday) is the daily summary's job, not a recap.
  const presets = recapPresets(project).filter(
    (preset) => spanDays(preset.range) >= 2 && spanDays(preset.range) <= maxDays,
  );
  const fallback = presets[0]?.range ?? { start: "", end: "" };

  const form = useForm<CreateRecapPayload>({
    resolver: zodResolver(createRecapPayloadSchema),
    defaultValues: { start_date: fallback.start, end_date: fallback.end },
  });

  const start = form.watch("start_date");
  const end = form.watch("end_date");
  const span = spanDays({ start, end });
  const tooLong = span > maxDays;

  const applyPreset = (range: RecapRange) => {
    form.setValue("start_date", range.start, { shouldValidate: true });
    form.setValue("end_date", range.end, { shouldValidate: true });
  };

  const onSubmit = form.handleSubmit((data) => {
    if (tooLong) return;
    create.mutate({ start: data.start_date, end: data.end_date });
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) form.reset({ start_date: fallback.start, end_date: fallback.end });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New recap</DialogTitle>
          <DialogDescription>
            One summary across a span of days, rolled up from the daily
            summaries inside it.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => {
                const active =
                  preset.range.start === start && preset.range.end === end;
                return (
                  <Button
                    key={preset.key}
                    type="button"
                    size="sm"
                    variant={active ? "secondary" : "outline"}
                    onClick={() => applyPreset(preset.range)}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ControlledInput name="start_date" label="From" type="date" />
              <ControlledInput name="end_date" label="To" type="date" />
            </div>

            <p className="text-xs text-muted-foreground tabular-nums">
              {span >= 2 ? (
                <>
                  {formatSpan(start, end)} · {span} days
                </>
              ) : (
                "Pick a span of at least two days."
              )}
            </p>
            {tooLong && (
              <p className="text-xs text-destructive">
                That&apos;s {span} days — a recap covers at most {maxDays}.
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={create.isPending}
              disabled={span < 2 || tooLong}
            >
              {create.isPending ? "Writing your recap…" : "Build recap"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Takes a few seconds — we read every day in the span.
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
