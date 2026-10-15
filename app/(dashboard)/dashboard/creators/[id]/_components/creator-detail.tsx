"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import type { Creator, CreatorContact } from "@/lib/types";
import { ErrorState } from "../../../../_components/query-states";
import { CreatorByline } from "../../_components/creator-card";
import { ScoreBadge } from "../../_components/score-badge";
import { StageSelect } from "../../_components/stage-select";
import { useMoveCreator } from "../../_hooks/use-move-creator";
import { CREATORS_PATH } from "../../types";
import { useCreator } from "../_hooks/use-creator";
import { useCreatorActions } from "../_hooks/use-creator-actions";
import Loading from "../loading";
import { FitPanel } from "./fit-panel";
import { NotesPanel } from "./notes-panel";
import { OutreachPanel } from "./outreach-panel";
import { RecentPosts } from "./recent-posts";
import { ReferralPanel } from "./referral-panel";

export function CreatorDetail({ id }: { id: string }) {
  const { data: creator, isPending, isError, error, refetch, isRefetching } =
    useCreator(id);

  if (isPending) return <Loading />;

  if (isError) {
    return (
      <div className="space-y-6">
        <BackLink />
        <ErrorState
          message={error.message}
          onRetry={() => refetch()}
          retrying={isRefetching}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackLink />

      <FadeIn>
        <article className="border rounded-lg p-5 bg-card space-y-4">
          <div className="flex gap-4">
            <ScoreBadge
              score={creator.score}
              scoring={creator.scoring}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold tracking-tight leading-snug truncate">
                    {creator.name}
                  </h1>
                  <CreatorByline creator={creator} />
                </div>
                <StageSelect creator={creator} />
              </div>
              {creator.bio && (
                <p className="text-sm mt-3 whitespace-pre-wrap break-words leading-relaxed">
                  {creator.bio}
                </p>
              )}
            </div>
          </div>

          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <Fact label="Profile">
              <ExternalLink href={creator.profile_url} />
            </Fact>
            <Fact label="Building">{creator.current_project ?? "Unknown"}</Fact>
            <Fact label="Found via">{creator.source}</Fact>
            <Fact label="Contact">
              <Contact contact={creator.contact} />
            </Fact>
          </dl>

          <Actions creator={creator} />
        </article>
      </FadeIn>

      <FitPanel creator={creator} />
      <OutreachPanel creator={creator} />
      <ReferralPanel creator={creator} />
      <RecentPosts creator={creator} />
      <NotesPanel creator={creator} />
    </div>
  );
}

/** The decisions a creator can need, offered only when they still apply. */
function Actions({ creator }: { creator: Creator }) {
  const move = useMoveCreator(creator.id);
  const { trial } = useCreatorActions(creator.id);
  const busy = move.isPending || trial.isPending;
  const rejected = creator.status === "REJECTED";

  return (
    <div className="flex flex-wrap items-center gap-2 border-t pt-4">
      {creator.status === "DISCOVERED" && (
        <Button
          size="sm"
          loading={move.isPending && move.variables === "SHORTLISTED"}
          disabled={busy}
          onClick={() => move.mutate("SHORTLISTED")}
        >
          Shortlist
        </Button>
      )}
      {!rejected && creator.contacted_at === null && (
        <Button
          size="sm"
          variant="outline"
          loading={move.isPending && move.variables === "CONTACTED"}
          disabled={busy}
          onClick={() => move.mutate("CONTACTED")}
        >
          Mark contacted
        </Button>
      )}
      {!rejected && (
        <Button
          size="sm"
          variant="outline"
          loading={trial.isPending}
          disabled={busy}
          onClick={() => trial.mutate()}
        >
          Give trial
        </Button>
      )}
      {rejected ? (
        <Button
          size="sm"
          variant="outline"
          loading={move.isPending}
          onClick={() => move.mutate("DISCOVERED")}
        >
          Restore
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto text-muted-foreground hover:text-destructive"
          loading={move.isPending && move.variables === "REJECTED"}
          disabled={busy}
          onClick={() => move.mutate("REJECTED")}
        >
          Reject
        </Button>
      )}
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 min-w-0">
      <dt className="w-20 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

function ExternalLink({ href, label }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-4 decoration-border hover:decoration-foreground break-all"
    >
      {label ?? href.replace(/^https?:\/\//, "")}
    </a>
  );
}

/** Only what they list publicly on their own profile. */
function Contact({ contact }: { contact: CreatorContact }) {
  const website =
    contact.website &&
    (/^https?:\/\//.test(contact.website)
      ? contact.website
      : `https://${contact.website}`);
  const items = [
    contact.email && (
      <ExternalLink
        key="email"
        href={`mailto:${contact.email}`}
        label={contact.email}
      />
    ),
    contact.twitter && (
      <ExternalLink
        key="twitter"
        href={`https://x.com/${contact.twitter}`}
        label={`@${contact.twitter} on X`}
      />
    ),
    contact.github && (
      <ExternalLink
        key="github"
        href={`https://github.com/${contact.github}`}
        label={`${contact.github} on GitHub`}
      />
    ),
    website && <ExternalLink key="website" href={website} />,
  ].filter(Boolean);

  if (items.length === 0) return <>None listed</>;
  return <span className="flex flex-col gap-0.5">{items}</span>;
}

function BackLink() {
  return (
    <Link
      href={CREATORS_PATH}
      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      ← Creators
    </Link>
  );
}
