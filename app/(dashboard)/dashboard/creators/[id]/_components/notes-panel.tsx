"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ControlledTextarea from "@/components/molecules/controlled-textarea";
import type { Creator } from "@/lib/types";
import { NOTES_MAX } from "../../types";
import { useNotesForm } from "../_hooks/use-notes-form";

export function NotesPanel({ creator }: { creator: Creator }) {
  const { form, onSubmit, isPending } = useNotesForm(creator);
  return (
    <section className="border rounded-lg p-4 bg-card">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-3">
          <ControlledTextarea
            name="notes"
            label="Notes"
            rows={3}
            maxLength={NOTES_MAX}
            placeholder="What they replied, when to follow up…"
          />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            loading={isPending}
            disabled={!form.formState.isDirty}
          >
            Save notes
          </Button>
        </form>
      </Form>
    </section>
  );
}
