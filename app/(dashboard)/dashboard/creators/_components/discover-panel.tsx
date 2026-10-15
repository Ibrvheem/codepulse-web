"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ControlledInput from "@/components/molecules/controlled-input";
import ControlledSelect from "@/components/molecules/controlled-select";
import type { CreatorProvider } from "@/lib/types";
import { useDiscover } from "../_hooks/use-discover";
import { QUERY_SUGGESTIONS } from "../types";

export function DiscoverPanel({ providers }: { providers: CreatorProvider[] }) {
  const { form, onSubmit, isPending } = useDiscover(providers[0]?.id ?? "");
  const provider = providers.find((p) => p.id === form.watch("provider"));

  return (
    <section className="border rounded-lg p-4 bg-card space-y-3">
      <div>
        <h2 className="text-sm font-medium">Find creators</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Searches the source&apos;s public API, adds anyone new and scores
          them.
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
        >
          <div className="sm:w-44 shrink-0">
            <ControlledSelect
              name="provider"
              values={providers.map((p) => ({ value: p.id, name: p.label }))}
            />
          </div>
          <div className="flex-1">
            <ControlledInput
              name="query"
              placeholder="#100DaysOfCode"
              description={provider?.hint}
            />
          </div>
          <Button type="submit" loading={isPending}>
            Search
          </Button>
        </form>
      </Form>
      <div className="flex flex-wrap gap-2">
        {QUERY_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/25 transition-colors"
            onClick={() =>
              form.setValue("query", suggestion, { shouldValidate: true })
            }
          >
            {suggestion}
          </button>
        ))}
      </div>
    </section>
  );
}
