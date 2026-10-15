"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaggerReveal, StaggerItem } from "@/components/motion/stagger-reveal";
import type { CreatorOverview, CreatorSort, CreatorStatus } from "@/lib/types";
import { EmptyState, ErrorState } from "../../../_components/query-states";
import { PaginationControls } from "../../../_components/pagination-controls";
import { useCreators } from "../_hooks/use-creators";
import {
  DEFAULT_FILTERS,
  STATUS_META,
  STATUS_OPTIONS,
  type CreatorFilters,
} from "../types";
import { CreatorCard } from "./creator-card";
import { CreatorsSkeleton } from "./creators-skeleton";

const ALL = "ALL";

const SORTS: { value: CreatorSort; label: string }[] = [
  { value: "score", label: "Best fit" },
  { value: "new", label: "New" },
];

export function Pipeline({
  counts,
}: {
  counts: CreatorOverview["by_status"];
}) {
  const [filters, setFilters] = useState<CreatorFilters>(DEFAULT_FILTERS);
  const { data, isPending, isError, error, refetch, isRefetching, isPlaceholderData } =
    useCreators(filters);
  const filtered = filters.status !== undefined || !!filters.q;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium">Pipeline</h2>

      <Tabs
        value={filters.status ?? ALL}
        onValueChange={(value) =>
          setFilters({
            ...filters,
            page: 1,
            status: value === ALL ? undefined : (value as CreatorStatus),
          })
        }
      >
        <TabsList className="h-auto! flex-wrap justify-start">
          <TabsTrigger value={ALL}>
            All <Count value={total} />
          </TabsTrigger>
          {STATUS_OPTIONS.map((opt) => (
            <TabsTrigger key={opt.value} value={opt.value}>
              {opt.name} <Count value={counts[opt.value]} />
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex items-center justify-between gap-3">
        <form
          className="flex-1 max-w-xs"
          onSubmit={(event) => {
            event.preventDefault();
            const q = String(new FormData(event.currentTarget).get("q") ?? "");
            setFilters({ ...filters, page: 1, q: q.trim() || undefined });
          }}
        >
          <Input
            name="q"
            type="search"
            placeholder="Search name or username"
            aria-label="Search creators"
            className="h-8"
          />
        </form>
        <Tabs
          value={filters.sort}
          onValueChange={(value) =>
            setFilters({ ...filters, page: 1, sort: value as CreatorSort })
          }
        >
          <TabsList aria-label="Sort">
            {SORTS.map((sort) => (
              <TabsTrigger key={sort.value} value={sort.value}>
                {sort.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isPending ? (
        <CreatorsSkeleton />
      ) : isError ? (
        <ErrorState
          message={error.message}
          onRetry={() => refetch()}
          retrying={isRefetching}
        />
      ) : data.data.length === 0 ? (
        filtered ? (
          <EmptyState
            title={
              filters.status && !filters.q
                ? `Nobody is ${STATUS_META[filters.status].label.toLowerCase()} yet`
                : "Nobody matches that"
            }
            description="Try another stage or clear the search."
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
            title="No creators yet."
            description="Search a hashtag above to find the first ones."
          />
        )
      ) : (
        <div
          className={`space-y-4 transition-opacity duration-200 ${
            isPlaceholderData ? "opacity-60" : "opacity-100"
          }`}
        >
          <StaggerReveal className="space-y-3">
            {data.data.map((creator) => (
              <StaggerItem key={creator.id}>
                <CreatorCard creator={creator} actions="stage" />
              </StaggerItem>
            ))}
          </StaggerReveal>
          <PaginationControls
            meta={data.meta}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </div>
      )}
    </section>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className="text-xs text-muted-foreground tabular-nums">{value}</span>
  );
}
