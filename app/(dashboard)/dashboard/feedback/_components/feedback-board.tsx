"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StaggerReveal, StaggerItem } from "@/components/motion/stagger-reveal";
import { EmptyState, ErrorState } from "../../../_components/query-states";
import { PaginationControls } from "../../../_components/pagination-controls";
import { useFeedbackList } from "../_hooks/use-feedback-list";
import { DEFAULT_FILTERS, type FeedbackFilters as Filters } from "../types";
import { FeedbackCard } from "./feedback-card";
import { FeedbackFilters } from "./feedback-filters";
import { FeedbackSkeleton } from "./feedback-skeleton";
import { NewFeedbackDialog } from "./new-feedback-dialog";

export function FeedbackBoard() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const { data, isPending, isError, error, refetch, isRefetching, isPlaceholderData } =
    useFeedbackList(filters);
  const filtered = filters.status !== undefined || filters.category !== undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Feedback</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ask for features, report bugs, upvote what matters to you.
          </p>
        </div>
        <NewFeedbackDialog>
          <Button size="sm">New post</Button>
        </NewFeedbackDialog>
      </div>

      <FeedbackFilters
        filters={filters}
        onChange={(next) => setFilters({ ...next, page: 1 })}
      />

      {isPending ? (
        <FeedbackSkeleton />
      ) : isError ? (
        <ErrorState
          message={error.message}
          onRetry={() => refetch()}
          retrying={isRefetching}
        />
      ) : data.data.length === 0 ? (
        filtered ? (
          <EmptyState
            title="Nothing matches those filters"
            description="Try a different status or category, or post something new."
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ ...DEFAULT_FILTERS, sort: filters.sort })}
            >
              Clear filters
            </Button>
          </EmptyState>
        ) : (
          <EmptyState
            title="Nothing here yet."
            description="Be the first to ask for something."
          >
            <NewFeedbackDialog>
              <Button>New post</Button>
            </NewFeedbackDialog>
          </EmptyState>
        )
      ) : (
        <div
          className={`space-y-4 transition-opacity duration-200 ${
            isPlaceholderData ? "opacity-60" : "opacity-100"
          }`}
        >
          <StaggerReveal className="space-y-3">
            {data.data.map((post) => (
              <StaggerItem key={post.id}>
                <FeedbackCard post={post} />
              </StaggerItem>
            ))}
          </StaggerReveal>
          <PaginationControls
            meta={data.meta}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </div>
      )}
    </div>
  );
}
