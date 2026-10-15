"use client";

import { Form } from "@/components/ui/form";
import { Button, buttonVariants } from "@/components/ui/button";
import ControlledTextarea from "@/components/molecules/controlled-textarea";
import type { Creator } from "@/lib/types";
import { useMoveCreator } from "../../_hooks/use-move-creator";
import { DRAFT_MAX, platformLabel, STAGES } from "../../types";
import { useCreatorActions } from "../_hooks/use-creator-actions";
import { useOutreachForm } from "../_hooks/use-outreach-form";
import { CopyButton } from "./copy-button";

/**
 * Draft, edit, copy, send by hand. There is deliberately no send button: the
 * message leaves from the reviewer's own account after they've read it.
 */
export function OutreachPanel({ creator }: { creator: Creator }) {
  const { draft } = useCreatorActions(creator.id);
  const move = useMoveCreator(creator.id);
  const { form, onSubmit, isPending } = useOutreachForm(creator);
  const hasDraft = !!creator.outreach_draft;
  const text = form.watch("outreach_draft");
  // Mirrors the API: a hello until they reply, then the ask to try it.
  const replied = STAGES.indexOf(creator.status) >= STAGES.indexOf("REPLIED");

  return (
    <section className="border rounded-lg p-4 bg-card space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Outreach</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {replied
              ? "They replied, so this one asks them to try it and share it if they like it."
              : "A hello that says you're looking for real users. No link yet."}{" "}
            You edit it and send it yourself on{" "}
            {platformLabel(creator.platform)}.
          </p>
        </div>
        <Button
          variant={hasDraft && !replied ? "outline" : "default"}
          size="sm"
          loading={draft.isPending}
          onClick={() => draft.mutate()}
        >
          {replied
            ? "Draft follow-up"
            : hasDraft
              ? "Regenerate"
              : "Generate outreach"}
        </Button>
      </div>

      {(hasDraft || text) && (
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-3">
            <ControlledTextarea
              name="outreach_draft"
              rows={7}
              maxLength={DRAFT_MAX}
              description="Read it once before sending. Edit anything that doesn't sound like you."
            />
            <div className="flex flex-wrap items-center gap-2">
              <CopyButton
                text={() => form.getValues("outreach_draft")}
                label="Copy message"
                copied="Message copied"
                disabled={!text.trim()}
              />
              <a
                href={creator.profile_url}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Open profile
              </a>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                loading={isPending}
                disabled={!form.formState.isDirty}
              >
                Save edits
              </Button>
              {creator.contacted_at === null && (
                <Button
                  type="button"
                  size="sm"
                  className="ml-auto"
                  loading={move.isPending}
                  onClick={() => move.mutate("CONTACTED")}
                >
                  Mark contacted
                </Button>
              )}
            </div>
          </form>
        </Form>
      )}
    </section>
  );
}
