"use client";

import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { MessageSquare } from "lucide-react";
import type { FeedbackPost } from "@/lib/types";
import { AuthorAvatar } from "./author-avatar";
import { CategoryChip } from "./category-chip";
import { StatusBadge } from "./status-badge";
import { VoteButton } from "./vote-button";

dayjs.extend(relativeTime);

export function FeedbackCard({ post }: { post: FeedbackPost }) {
  return (
    <div className="relative border rounded-lg p-4 bg-card flex gap-4 transition-all duration-200 hover:border-foreground/25 hover:-translate-y-0.5 hover:shadow-sm">
      <div className="relative z-10 shrink-0 self-start">
        <VoteButton
          id={post.id}
          count={post.vote_count}
          hasVoted={post.has_voted}
        />
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={`/dashboard/feedback/${post.id}`}
          className="block outline-none focus-visible:underline"
        >
          {/* Stretch the click target over the whole card; the vote button
              sits above it on its own z-index. */}
          <span className="absolute inset-0 rounded-lg" aria-hidden />
          <p className="font-medium leading-snug break-words">{post.title}</p>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 break-words">
            {post.body}
          </p>
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
          <StatusBadge status={post.status} />
          <CategoryChip category={post.category} />
          <span className="inline-flex items-center gap-1 tabular-nums">
            <MessageSquare className="size-3.5" />
            {post.comment_count}
          </span>
          <span className="inline-flex items-center gap-1.5 ml-auto">
            <AuthorAvatar author={post.author} />
            <span className="truncate max-w-32">{post.author.full_name}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.created_at}>
              {dayjs(post.created_at).fromNow()}
            </time>
          </span>
        </div>
      </div>
    </div>
  );
}
