"use client";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { ErrorState } from "../../../_components/query-states";
import { useCreatorsOverview } from "../_hooks/use-overview";
import Loading from "../loading";
import { AddCreatorDialog } from "./add-creator-dialog";
import { DiscoverPanel } from "./discover-panel";
import { Funnel } from "./funnel";
import { Pipeline } from "./pipeline";
import { TodaysProspects } from "./todays-prospects";

export function CreatorsDashboard() {
  const { data: overview, isPending, isError, error, refetch, isRefetching } =
    useCreatorsOverview();

  if (isPending) return <Loading />;

  // Anyone outside ADMIN_EMAILS lands here with the API's "Admin only".
  if (isError) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => refetch()}
        retrying={isRefetching}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Creators</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Developers who build in public and could use WriteLogs to do it.
          </p>
        </div>
        <AddCreatorDialog>
          <Button size="sm" variant="outline">
            Add manually
          </Button>
        </AddCreatorDialog>
      </div>

      <FadeIn>
        <Funnel overview={overview} />
      </FadeIn>
      <TodaysProspects prospects={overview.todays_prospects} />
      <DiscoverPanel providers={overview.providers} />
      <Pipeline counts={overview.by_status} />
    </div>
  );
}
