"use client";

import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import ControlledInput from "@/components/molecules/controlled-input";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

interface DeleteConfirmationDialogProps {
  children: React.ReactNode;
  projectName: string;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
}

export function DeleteConfirmationDialog({
  children,
  projectName,
}: DeleteConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm({});
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">Delete Project</DialogTitle>
              <DialogDescription className="text-sm">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This will permanently delete the project{" "}
              <span className="font-semibold">{projectName}</span> and all its
              associated data including:
            </p>
            <ul className="mt-2 ml-4 list-disc text-sm text-red-700 space-y-1">
              <li>All work logs and summaries</li>
              <li>All PAT keys</li>
              <li>All project settings</li>
            </ul>
          </div>
          <Form {...form}>
            <div className="space-y-2">
              <Label htmlFor="confirm-name" className="text-sm font-medium">
                Type{" "}
                <span className="font-mono font-semibold text-red-600">
                  {projectName}
                </span>{" "}
                to confirm
              </Label>
              <ControlledInput name="projectname" />
            </div>
          </Form>
        </div>

        <DialogFooter>
          <DialogClose>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={form.watch("projectname") !== projectName}
          >
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
