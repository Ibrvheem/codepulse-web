"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ControlledInput from "@/components/molecules/controlled-input";
import ControlledSelect from "@/components/molecules/controlled-select";
import type { FeedbackPost } from "@/lib/types";
import { STATUS_OPTIONS } from "../../types";
import { useSetStatus } from "../_hooks/use-set-status";

/** Only rendered when `me.is_admin`. The API still enforces it. */
export function AdminStatusControl({ post }: { post: FeedbackPost }) {
  const { form, onSubmit, isPending } = useSetStatus(post);

  return (
    <section className="border rounded-lg p-4 bg-card">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Admin
      </h2>
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start"
        >
          <div className="sm:w-44 shrink-0">
            <ControlledSelect name="status" label="Status" values={STATUS_OPTIONS} />
          </div>
          <div className="flex-1">
            <ControlledInput
              name="note"
              label="Note"
              optional
              placeholder="Shipping in 2.3"
              description="Public, shown under the status. Planned, In progress and Done email the author."
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="sm:mt-7"
            loading={isPending}
            disabled={!form.formState.isDirty}
          >
            Save
          </Button>
        </form>
      </Form>
    </section>
  );
}
