"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/molecules/controlled-input";
import ControlledTextarea from "@/components/molecules/controlled-textarea";
import { useCreateProject } from "../_hooks/use-create-project";

import { Plus } from "lucide-react";

export function CreateProjectDialog() {
  const { form, isSubmitting, onSubmit, open, setOpen } = useCreateProject();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            Create a project to track your development work.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <div className="space-y-4 mt-4">
            <div>
              <ControlledInput
                name="name"
                placeholder="Project name"
                disabled={isSubmitting}
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <ControlledTextarea
                name="description"
                placeholder="Description (optional)"
                disabled={isSubmitting}
                className="min-h-20 resize-none"
              />
            </div>

            <div>
              <ControlledInput
                name="repoUrl"
                placeholder="Repository URL (optional)"
                type="url"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Button
            onClick={() => onSubmit()}
            loading={isSubmitting}
            className="w-full mt-6"
          >
            Create Project
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
