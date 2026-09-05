"use client";

import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggerReveal, StaggerItem } from "@/components/motion/stagger-reveal";
import type { FeedbackComment } from "@/lib/types";
import { ErrorState } from "../../../../_components/query-states";
import { AuthorAvatar } from "../../_components/author-avatar";
import { useComments } from "../_hooks/use-comments";
import { useDeleteComment } from "../_hooks/use-delete-comment";
import { ConfirmDialog } from "./confirm-dialog";

dayjs.extend(relativeTime);

function CommentRow({
  comment,
  canDelete,
  onDelete,
}: {
  comment: FeedbackComment;
  canDelete: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <AuthorAvatar author={comment.author} />
        <span className="font-medium text-foreground truncate">
          {comment.author.full_name}
        </span>
        {comment.is_admin && (
          <span className="inline-flex items-center rounded-full border px-1.5 py-px text-[10px] font-medium text-primary bg-primary/10 border-primary/20">
            Team
          </span>
        )}
        <span aria-hidden>·</span>
        <time dateTime={comment.created_at}>
          {dayjs(comment.created_at).fromNow()}
        </time>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto hover:text-destructive transition-colors"
          >
            Delete
          </button>
        )}
      </div>
      <p className="mt-2 text-sm whitespace-pre-wrap break-words">
        {comment.body}
      </p>
    </div>
  );
}

export function CommentList({
  postId,
  isAdmin,
}: {
  postId: string;
  isAdmin: boolean;
}) {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useComments(postId);
  const deleteComment = useDeleteComment(postId);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  if (isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => refetch()}
        retrying={isRefetching}
      />
    );
  }

  const comments = data.pages.flatMap((page) => page.data);

  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No comments yet. Add context, a use case, or a workaround.
      </p>
    );
  }

  return (
    <>
      <StaggerReveal className="space-y-3">
        {comments.map((comment) => (
          <StaggerItem key={comment.id}>
            <CommentRow
              comment={comment}
              canDelete={comment.is_mine || isAdmin}
              onDelete={() => setPendingDelete(comment.id)}
            />
          </StaggerItem>
        ))}
      </StaggerReveal>
      {hasNextPage && (
        <div className="flex justify-center pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
          >
            Load more
          </Button>
        </div>
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this comment?"
        description="This can't be undone."
        confirmLabel="Delete comment"
        pending={deleteComment.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteComment.mutate(pendingDelete, {
            onSettled: () => setPendingDelete(null),
          });
        }}
      />
    </>
  );
}
