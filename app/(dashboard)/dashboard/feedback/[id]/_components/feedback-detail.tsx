"use client";

import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button } from "@/components/ui/button";
import { CornerAccents } from "@/components/ui/corner-accents";
import { FadeIn } from "@/components/motion/fade-in";
import { ErrorState } from "../../../../_components/query-states";
import { useFeedbackMe } from "../../_hooks/use-feedback-me";
import { AuthorAvatar } from "../../_components/author-avatar";
import { CategoryChip } from "../../_components/category-chip";
import { StatusBadge } from "../../_components/status-badge";
import { VoteButton } from "../../_components/vote-button";
import { useFeedbackPost } from "../_hooks/use-feedback-post";
import { useDeleteFeedback } from "../_hooks/use-delete-feedback";
import { AdminStatusControl } from "./admin-status-control";
import { CommentForm } from "./comment-form";
import { CommentList } from "./comment-list";
import { ConfirmDialog } from "./confirm-dialog";
import { EditFeedbackDialog } from "./edit-feedback-dialog";
import Loading from "../loading";

dayjs.extend(relativeTime);

export function FeedbackDetail({ id }: { id: string }) {
  const { data: post, isPending, isError, error, refetch, isRefetching } =
    useFeedbackPost(id);
  const { data: me } = useFeedbackMe();
  const deletePost = useDeleteFeedback(id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isAdmin = me?.is_admin ?? false;

  if (isPending) return <Loading />;

  if (isError) {
    return (
      <div className="space-y-6">
        <BackLink />
        <ErrorState
          message={error.message}
          onRetry={() => refetch()}
          retrying={isRefetching}
        />
      </div>
    );
  }

  const canDelete = post.is_mine || isAdmin;

  return (
    <div className="space-y-6">
      <BackLink />

      <FadeIn>
        <article className="relative border rounded-lg p-5 bg-card flex gap-4">
          <CornerAccents />
          <div className="shrink-0 self-start">
            <VoteButton
              id={post.id}
              count={post.vote_count}
              hasVoted={post.has_voted}
              size="lg"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-lg font-semibold tracking-tight leading-snug break-words">
                {post.title}
              </h1>
              {(post.is_mine || canDelete) && (
                <div className="flex items-center gap-1 shrink-0">
                  {post.is_mine && (
                    <EditFeedbackDialog post={post}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </EditFeedbackDialog>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setConfirmDelete(true)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={post.status} />
              <CategoryChip category={post.category} />
            </div>
            {post.status_note && (
              <p className="text-sm text-muted-foreground italic">
                {post.status_note}
              </p>
            )}

            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {post.body}
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <AuthorAvatar author={post.author} />
              <span className="truncate">{post.author.full_name}</span>
              <span aria-hidden>·</span>
              <time dateTime={post.created_at}>
                {dayjs(post.created_at).fromNow()}
              </time>
              {post.updated_at !== post.created_at && (
                <span className="hidden sm:inline">(edited)</span>
              )}
            </div>
          </div>
        </article>
      </FadeIn>

      {isAdmin && <AdminStatusControl post={post} />}

      <section className="space-y-4">
        <h2 className="text-sm font-medium">
          {post.comment_count === 1
            ? "1 comment"
            : `${post.comment_count} comments`}
        </h2>
        <CommentList postId={post.id} isAdmin={isAdmin} />
        <CommentForm postId={post.id} />
      </section>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this post?"
        description="Votes and comments go with it."
        confirmLabel="Delete post"
        pending={deletePost.isPending}
        onConfirm={() => deletePost.mutate()}
      />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/dashboard/feedback"
      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      ← Feedback
    </Link>
  );
}
