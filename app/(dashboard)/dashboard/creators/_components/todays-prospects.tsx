"use client";

import { StaggerReveal, StaggerItem } from "@/components/motion/stagger-reveal";
import type { Creator } from "@/lib/types";
import { CreatorCard } from "./creator-card";

/** The best-scoring creators still waiting on a first decision. */
export function TodaysProspects({ prospects }: { prospects: Creator[] }) {
  if (prospects.length === 0) return null;
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-medium">Today&apos;s prospects</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Best fit first. Shortlist the ones worth a message.
        </p>
      </div>
      <StaggerReveal className="grid gap-3 sm:grid-cols-2">
        {prospects.map((creator) => (
          <StaggerItem key={creator.id} className="h-full">
            <CreatorCard creator={creator} actions="triage" />
          </StaggerItem>
        ))}
      </StaggerReveal>
    </section>
  );
}
