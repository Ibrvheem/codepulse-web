"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { FeedbackPost } from "@/lib/types";
import { FeedbackPostFields } from "../../_components/feedback-post-fields";
import { useUpdateFeedback } from "../_hooks/use-update-feedback";

export function EditFeedbackDialog({
  post,
  children,
}: {
  post: FeedbackPost;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { form, onSubmit, isPending } = useUpdateFeedback(post, () =>
    setOpen(false),
  );

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FeedbackPostFields />
            <Button type="submit" className="w-full" loading={isPending}>
              Save changes
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
