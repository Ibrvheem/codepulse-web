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
import { useCreateFeedback } from "../_hooks/use-create-feedback";
import { FeedbackPostFields } from "./feedback-post-fields";

export function NewFeedbackDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { form, onSubmit, isPending } = useCreateFeedback();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New post</DialogTitle>
          <DialogDescription>
            A feature you want, a bug you hit, or something that could be
            better. Others can upvote it.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FeedbackPostFields />
            <Button type="submit" className="w-full" loading={isPending}>
              Post
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
