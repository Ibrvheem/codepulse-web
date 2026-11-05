"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExternalLink, Lock, RefreshCw, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FadeIn } from "@/components/motion/fade-in";
import type { BufferChannel, BufferTone } from "@/lib/types";
import { EmptyState, ErrorState } from "../../../_components/query-states";
import {
  useBufferStatus,
  useConnectBuffer,
  useDisconnectBuffer,
  useUpdateBufferSettings,
} from "../_hooks/use-buffer";

export const TONE_LABELS: Record<BufferTone, { label: string; hint: string }> =
  {
    dev_log: {
      label: "Dev log",
      hint: "Candid and specific. What you shipped, in your own words.",
    },
    founder: {
      label: "Founder update",
      hint: "What shipped and why it matters to the people using it.",
    },
    client: {
      label: "Client update",
      hint: "Plain progress, outcomes only, nothing under the hood.",
    },
  };

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border rounded-lg px-4 bg-card">
      <h2 className="pt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="divide-y">{children}</div>
    </section>
  );
}

function Row({
  title,
  description,
  stacked,
  children,
}: {
  title: string;
  description: React.ReactNode;
  stacked?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col gap-3 py-4 ${
        stacked ? "" : "sm:flex-row sm:items-center sm:justify-between"
      }`}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground max-w-prose">
          {description}
        </p>
      </div>
      {children && <div className={stacked ? "" : "shrink-0"}>{children}</div>}
    </div>
  );
}

/** One numbered step on the connect page. */
function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums">
        {n}
      </span>
      <span className="space-y-0.5">
        <span className="block font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground max-w-prose">
          {children}
        </span>
      </span>
    </li>
  );
}

/** One channel: avatar, network, handle, and whether posts go there. */
function ChannelToggle({
  channel,
  picked,
  onToggle,
  disabled,
}: {
  channel: BufferChannel;
  picked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  const unusable = channel.is_locked || channel.is_disconnected;
  const why = channel.is_disconnected
    ? "Disconnected in Buffer"
    : channel.is_locked
      ? "Locked on your Buffer plan"
      : null;
  const id = `buffer-channel-${channel.id}`;
  return (
    <Label
      htmlFor={id}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 font-normal leading-normal transition-colors has-disabled:cursor-not-allowed has-disabled:opacity-50 ${
        picked && !unusable
          ? "border-foreground/40 bg-muted/40"
          : "hover:bg-muted/30"
      }`}
    >
      {channel.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={channel.avatar}
          alt=""
          className="size-8 rounded-full object-cover bg-muted"
        />
      ) : (
        <span className="size-8 rounded-full bg-muted" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium truncate">
          {channel.label}
          <span className="ml-2 font-normal text-muted-foreground">
            {channel.display_name || channel.name}
          </span>
        </span>
        <span className="block text-xs text-muted-foreground">
          {why ?? `Up to ${channel.limit.toLocaleString()} characters`}
        </span>
      </span>
      {unusable ? (
        <Lock className="size-4 text-muted-foreground" aria-hidden />
      ) : (
        <Checkbox
          id={id}
          checked={picked}
          disabled={disabled}
          onCheckedChange={onToggle}
        />
      )}
    </Label>
  );
}

export function BufferView() {
  const params = useSearchParams();
  const status = useBufferStatus();
  const connect = useConnectBuffer();
  const update = useUpdateBufferSettings();
  const disconnect = useDisconnectBuffer();
  // Where the user came from (a day or recap page); Buffer sends them back there.
  const rawReturn = params.get("return_to");
  const returnTo =
    rawReturn && rawReturn.startsWith("/") && !rawReturn.startsWith("//")
      ? rawReturn
      : undefined;
  // Back from Buffer's consent screen. A full redirect brought us here, so the
  // status query is fresh and the notice comes straight from the URL.
  const justConnected = params.get("buffer") === "connected";
  const connectError = params.get("error");

  if (status.isPending) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    );
  }

  if (status.isError) {
    return (
      <ErrorState
        message={status.error.message}
        onRetry={() => status.refetch()}
        retrying={status.isRefetching}
      />
    );
  }

  const data = status.data;
  const hasChannels = (data.channels ?? []).length > 0;

  return (
    <FadeIn className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Post with Buffer
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-prose">
          Your work log already knows what you shipped. Turn any day or week
          into a post for your channels, written for you, and send it to your
          Buffer queue.
        </p>
      </div>

      {justConnected && data.connected && hasChannels && (
        <div className="border rounded-lg p-4 bg-card text-sm">
          Buffer connected. Pick where your posts should go.
        </div>
      )}
      {connectError && !data.connected && (
        <div className="border border-destructive/40 rounded-lg p-4 bg-card text-sm">
          {connectError}
        </div>
      )}

      {!data.configured && (
        <div className="border rounded-lg p-4 bg-card text-sm text-muted-foreground">
          Buffer isn&apos;t set up on this server yet.
        </div>
      )}

      {data.configured && !data.connected && (
        <div className="space-y-6">
          <div className="border rounded-lg p-5 bg-card space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Image
                src="/loggy/loggy-connect.png"
                alt="Loggy plugging a cable into a socket"
                width={132}
                height={100}
                className="shrink-0 self-center"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Connect your Buffer account
                </p>
                <p className="text-xs text-muted-foreground max-w-prose">
                  Buffer is where your posts queue up for X, LinkedIn, Threads,
                  Bluesky, Mastodon and more. Link it once and WriteLogs can
                  write posts from your log and hand them to Buffer.
                </p>
              </div>
            </div>
            <ol className="space-y-3 text-sm">
              <Step n={1} title="Approve WriteLogs in Buffer">
                Press the button below. Buffer asks you to allow WriteLogs to
                read your channels and create posts. Nothing is ever published
                without you choosing to.
              </Step>
              <Step n={2} title="Pick where posts go">
                You land back here with your channels listed. Every channel you
                tick gets its own post, written inside that network's limit.
              </Step>
              <Step n={3} title="Post any day or week">
                Open a day or a recap and press Post this day. Read it, fix a
                word, send it to Buffer as a draft, to the queue, or right now.
              </Step>
            </ol>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                loading={connect.isPending}
                onClick={() => connect.mutate(returnTo)}
              >
                Connect Buffer
              </Button>
              <p className="text-xs text-muted-foreground">
                No Buffer account yet?{" "}
                <a
                  href="https://buffer.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4"
                >
                  The free plan
                </a>{" "}
                is enough: connect a channel there first, then come back.
              </p>
            </div>
          </div>
        </div>
      )}

      {data.connected && (
        <>
          {data.needs_reauth && (
            <div className="border border-destructive/40 rounded-lg p-4 bg-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Buffer needs reconnecting</p>
                <p className="text-xs text-muted-foreground">
                  Buffer stopped accepting our access. Connect again to keep
                  posting.
                </p>
              </div>
              <Button
                loading={connect.isPending}
                onClick={() => connect.mutate(returnTo)}
              >
                Reconnect
              </Button>
            </div>
          )}

          {!hasChannels ? (
            <EmptyState
              image={{
                src: "/loggy/loggy-megaphone.png",
                alt: "Loggy holding a megaphone, looking for someone to tell",
                width: 137,
                height: 140,
              }}
              title="Buffer is connected, but it has no channels yet"
              description="A channel is a social account Buffer posts to, like your X, LinkedIn, Threads or Bluesky. WriteLogs can't write a post until there is at least one to write it for."
            >
              <div className="w-full max-w-md space-y-4 text-left">
                <ol className="space-y-3 text-sm">
                  <Step n={1} title="Open Buffer and add a channel">
                    Connect the account you post from. Buffer's free plan allows
                    three.
                  </Step>
                  <Step n={2} title="Come back and check again">
                    We fetch your channels fresh and list them here.
                  </Step>
                  <Step n={3} title="Tick the ones posts should go to">
                    Then open any day or recap and press Post this day.
                  </Step>
                </ol>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button asChild>
                    <a
                      href="https://publish.buffer.com/channels/connect"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="size-3.5" />
                      Add a channel in Buffer
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    loading={status.isRefetching}
                    onClick={() => status.refetch()}
                  >
                    <RefreshCw className="size-3.5" />
                    Check again
                  </Button>
                </div>
              </div>
            </EmptyState>
          ) : (
            <Section title="Channels">
              <Row
                stacked
                title="Where posts go"
                description="Every post is written separately for each network you pick, inside its character limit."
              >
                <div className="space-y-2">
                  {(data.channels ?? []).map((channel) => {
                    const picked = (data.channel_ids ?? []).includes(
                      channel.id,
                    );
                    return (
                      <ChannelToggle
                        key={channel.id}
                        channel={channel}
                        picked={picked}
                        disabled={update.isPending}
                        onToggle={() => {
                          const current = data.channel_ids ?? [];
                          update.mutate({
                            channel_ids: picked
                              ? current.filter((id) => id !== channel.id)
                              : [...current, channel.id],
                          });
                        }}
                      />
                    );
                  })}
                </div>
              </Row>
            </Section>
          )}

          {hasChannels && (
            <Section title="Writing">
              <Row
                title="Tone"
                description={
                  TONE_LABELS[data.tone ?? "dev_log"]?.hint ??
                  "How your posts should read."
                }
              >
                <Select
                  value={data.tone ?? "dev_log"}
                  onValueChange={(value) =>
                    update.mutate({ tone: value as BufferTone })
                  }
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TONE_LABELS) as BufferTone[]).map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {TONE_LABELS[tone].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
              <Row
                title="Draft every day on its own"
                description="When a day's summary is written, a draft lands in Buffer for each channel. Drafts only: you still press send."
              >
                <Switch
                  checked={Boolean(data.auto_draft)}
                  disabled={update.isPending}
                  onCheckedChange={(checked) =>
                    update.mutate({ auto_draft: checked })
                  }
                  aria-label="Draft every day on its own"
                />
              </Row>
            </Section>
          )}

          <Section title="Connection">
            <Row
              title="Connected to Buffer"
              description={
                <>
                  Open any day or recap and press{" "}
                  <span className="font-medium text-foreground">
                    Post to Buffer
                  </span>
                  . You can also manage channels at{" "}
                  <a
                    href="https://publish.buffer.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4"
                  >
                    publish.buffer.com
                  </a>
                  .
                </>
              }
            >
              <Button
                variant="outline"
                size="sm"
                loading={disconnect.isPending}
                onClick={() => disconnect.mutate()}
              >
                <Unplug className="size-3.5" />
                Disconnect
              </Button>
            </Row>
          </Section>

          <p className="text-xs text-muted-foreground">
            Posts are written from your summaries, never from your code. File
            names, paths and anything that looks like a key are stripped before
            text leaves WriteLogs.{" "}
            <Link href="/dashboard" className="underline underline-offset-4">
              Back to projects
            </Link>
          </p>
        </>
      )}
    </FadeIn>
  );
}
