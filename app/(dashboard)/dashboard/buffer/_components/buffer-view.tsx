"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Lock, Unplug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { ErrorState } from "../../../_components/query-states";
import {
  BUFFER_KEY,
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
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={picked}
      disabled={disabled || unusable}
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors disabled:opacity-50 ${
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
      <span
        className={`flex size-5 items-center justify-center rounded-full border ${
          picked && !unusable
            ? "border-foreground bg-foreground text-background"
            : "border-border"
        }`}
        aria-hidden
      >
        {unusable ? (
          <Lock className="size-3" />
        ) : picked ? (
          <Check className="size-3" />
        ) : null}
      </span>
    </button>
  );
}

export function BufferView() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const status = useBufferStatus();
  const connect = useConnectBuffer();
  const update = useUpdateBufferSettings();
  const disconnect = useDisconnectBuffer();
  const handledParams = useRef(false);

  // Coming back from Buffer: say what happened once, then clean the URL.
  useEffect(() => {
    if (handledParams.current) return;
    const connected = params.get("buffer") === "connected";
    const error = params.get("error");
    if (!connected && !error) return;
    handledParams.current = true;
    if (connected) {
      toast.success("Buffer connected. Pick where your posts should go.");
      queryClient.invalidateQueries({ queryKey: BUFFER_KEY });
    } else if (error) {
      toast.error(error);
    }
    router.replace("/dashboard/buffer");
  }, [params, queryClient, router]);

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

      {!data.configured && (
        <div className="border rounded-lg p-4 bg-card text-sm text-muted-foreground">
          Buffer isn&apos;t set up on this server yet.
        </div>
      )}

      {data.configured && !data.connected && (
        <div className="border rounded-lg p-5 bg-card space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Connect your Buffer account</p>
            <p className="text-xs text-muted-foreground max-w-prose">
              You&apos;ll approve WriteLogs in Buffer and come straight back
              here. We ask only to read your channels and create posts. Nothing
              is ever published without you choosing to.
            </p>
          </div>
          <Button
            loading={connect.isPending}
            onClick={() => connect.mutate(undefined)}
          >
            Connect Buffer
          </Button>
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
                onClick={() => connect.mutate(undefined)}
              >
                Reconnect
              </Button>
            </div>
          )}

          <Section title="Channels">
            <Row
              stacked
              title="Where posts go"
              description="Every post is written separately for each network you pick, inside its character limit."
            >
              <div className="space-y-2">
                {(data.channels ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No channels on this Buffer account yet. Add one in Buffer,
                    then come back.
                  </p>
                )}
                {(data.channels ?? []).map((channel) => {
                  const picked = (data.channel_ids ?? []).includes(channel.id);
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
              <Button
                variant={data.auto_draft ? "default" : "outline"}
                size="sm"
                role="switch"
                aria-checked={Boolean(data.auto_draft)}
                disabled={update.isPending}
                onClick={() => update.mutate({ auto_draft: !data.auto_draft })}
              >
                {data.auto_draft ? "On" : "Off"}
              </Button>
            </Row>
          </Section>

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
