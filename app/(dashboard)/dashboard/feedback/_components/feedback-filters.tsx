"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FeedbackCategory, FeedbackSort, FeedbackStatus } from "@/lib/types";
import { CATEGORY_OPTIONS, STATUS_TABS, type FeedbackFilters } from "../types";

const ALL = "ALL";

const SORTS: { value: FeedbackSort; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "new", label: "New" },
];

export function FeedbackFilters({
  filters,
  onChange,
}: {
  filters: FeedbackFilters;
  /** Any filter change resets to page 1. */
  onChange: (next: Omit<FeedbackFilters, "page">) => void;
}) {
  const reduceMotion = useReducedMotion();
  const pillTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, duration: 0.5, bounce: 0.2 };
  const quietActive =
    "data-[state=active]:bg-transparent! data-[state=active]:shadow-none! dark:data-[state=active]:border-transparent! dark:data-[state=active]:bg-transparent!";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        value={filters.status ?? ALL}
        onValueChange={(value) =>
          onChange({
            ...filters,
            status: value === ALL ? undefined : (value as FeedbackStatus),
          })
        }
      >
        <TabsList className="h-auto! flex-wrap">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className={quietActive}>
              {(filters.status ?? ALL) === tab.value && (
                <motion.span
                  layoutId="feedback-status-pill"
                  className="absolute inset-0 rounded-md bg-background shadow-sm dark:border dark:border-input dark:bg-input/30"
                  transition={pillTransition}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <Select
          value={filters.category ?? ALL}
          onValueChange={(value) =>
            onChange({
              ...filters,
              category: value === ALL ? undefined : (value as FeedbackCategory),
            })
          }
        >
          <SelectTrigger size="sm" className="w-36" aria-label="Category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs
          value={filters.sort}
          onValueChange={(value) =>
            onChange({ ...filters, sort: value as FeedbackSort })
          }
        >
          <TabsList aria-label="Sort">
            {SORTS.map((sort) => (
              <TabsTrigger key={sort.value} value={sort.value} className={quietActive}>
                {filters.sort === sort.value && (
                  <motion.span
                    layoutId="feedback-sort-pill"
                    className="absolute inset-0 rounded-md bg-background shadow-sm dark:border dark:border-input dark:bg-input/30"
                    transition={pillTransition}
                  />
                )}
                <span className="relative z-10">{sort.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
