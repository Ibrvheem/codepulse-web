"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ControlledTextarea from "@/components/molecules/controlled-textarea";
import { COMMENT_MAX } from "../../types";
import { useAddComment } from "../_hooks/use-add-comment";

export function CommentForm({ postId }: { postId: string }) {
  const { form, onSubmit, isPending } = useAddComment(postId);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-3">
        <ControlledTextarea
          name="body"
          placeholder="Add a comment…"
          rows={3}
          maxLength={COMMENT_MAX}
          onKeyDown={(e) => {
            // ⌘/Ctrl+Enter submits; plain Enter stays a newline.
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={isPending}>
            Comment
          </Button>
        </div>
      </form>
    </Form>
  );
}
