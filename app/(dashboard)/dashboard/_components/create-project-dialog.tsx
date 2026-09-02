"use client";

import { useState } from "react";
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
import ControlledSelect from "@/components/molecules/controlled-select";
import { useCreateProject } from "../_hooks/use-create-project";

const TIMEZONES = Intl.supportedValuesOf("timeZone").map((tz) => ({
  name: tz.replaceAll("_", " "),
  value: tz,
}));

export function CreateProjectDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { form, onSubmit, isPending } = useCreateProject();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            One project per codebase. You&apos;ll get an API key for the editor
            extension next.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <ControlledInput
              name="name"
              label="Name"
              placeholder="writelogs-api"
            />
            <ControlledSelect
              name="timezone"
              label="Timezone"
              placeholder="Pick a timezone"
              values={TIMEZONES}
              description="Sets where one day ends and the next begins for your daily summaries."
            />
            <Button type="submit" className="w-full" loading={isPending}>
              Create project
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
