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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to track your development work logs and generate
            AI summaries.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <div className="space-y-3 flex-1">
            <div>
              <ControlledInput
                name="name"
                placeholder="Project name"
                disabled={isSubmitting}
                className="text-sm"
              />
              {form.formState.errors.name && (
                <p className="text-red-600 text-xs mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <ControlledTextarea
                name="description"
                placeholder="Description (optional)"
                disabled={isSubmitting}
                className="text-sm min-h-[60px]"
              />
            </div>

            <div>
              <ControlledInput
                name="repoUrl"
                placeholder="Repository URL (optional)"
                type="url"
                disabled={isSubmitting}
                className="text-sm"
              />
            </div>
          </div>

          <Button
            onClick={() => onSubmit()}
            loading={isSubmitting}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-800 disabled:bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            Create Project
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
