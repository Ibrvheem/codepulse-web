"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, Send } from "lucide-react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { buffer } from "@/lib/api-client";
import type { BufferChannel, BufferMode, BufferTone } from "@/lib/types";
import {
  useBufferStatus,
  useConnectBuffer,
  useUpdateBufferSettings,
} from "../../buffer/_hooks/use-buffer";
import { TONE_LABELS } from "../../buffer/_components/buffer-view";

type SourceRef = { summary_id?: string; recap_id?: string };

const MODE_LABELS: Record<BufferMode, { label: string; hint: string }> = {
  draft: {
    label: "Save as draft",
    hint: "Lands in Buffer's drafts. Nothing goes out until you send it there.",
  },
  queue: {
    label: "Add to queue",
    hint: "Takes the next free slot in each channel's posting schedule.",
  },
  now: {
    label: "Share now",
    hint: "Publishes immediately on every channel below.",
  },
};

function postsKey(source: SourceRef) {
  return ["buffer-posts", source.summary_id ?? "", source.recap_id ?? ""];
}

function composeKey(source: SourceRef) {
  return ["buffer-compose", source.summary_id ?? "", source.recap_id ?? ""];
}

/** One channel chip: tap to include or leave out. */
function ChannelChip({
  channel,
  picked,
  disabled,
  onToggle,
}: {
  channel: BufferChannel;
  picked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={picked}
      disabled={disabled}
      onClick={onToggle}
      className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs transition-colors disabled:opacity-50 ${
        picked
          ? "border-foreground/40 bg-muted/40"
          : "text-muted-foreground hover:bg-muted/30"
      }`}
    >
      {channel.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={channel.avatar}
          alt=""
          className="size-6 rounded-full object-cover bg-muted"
        />
      ) : (
        <span className="size-6 rounded-full bg-muted" />
      )}
      <span className="font-medium">{channel.label}</span>
      <span className="max-w-32 truncate font-normal text-muted-foreground">
        {channel.display_name || channel.name}
      </span>
      <span
        className={`flex size-4 items-center justify-center rounded-full border ${
          picked
            ? "border-foreground bg-foreground text-background"
            : "border-border"
        }`}
        aria-hidden
      >
        {picked && <Check className="size-2.5" />}
      </span>
    </button>
  );
}

/**
 * The one button that turns a day or a recap into posts. Opens a dialog that
 * lets the user pick channels right there, writes one post per channel, lets
 * them fix the words, and sends them to Buffer as drafts, queued, or now.
 *
 * Writing is a query per channel that runs while the dialog is open, so
 * opening, picking a channel or changing tone needs no effect: the keys change
 * and the posts follow.
 */
export function PostToBuffer({
  source,
  label = "Post to Buffer",
}: {
  source: SourceRef;
  label?: string;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  // Back from Buffer's consent screen: the dialog is already open.
  const cameBack = params.get("buffer") === "connected";
  const connectError = params.get("error");
  const [open, setOpen] = useState(cameBack || Boolean(connectError));
  const [mode, setMode] = useState<BufferMode>("draft");
  const [tone, setTone] = useState<BufferTone | null>(null);
  const [picked, setPicked] = useState<string[] | null>(null);
  /** Edited text by channel id; anything not here is as written. */
  const [edits, setEdits] = useState<Record<string, string>>({});

  const status = useBufferStatus();
  const connect = useConnectBuffer();
  const saveSettings = useUpdateBufferSettings();
  const connected = Boolean(status.data?.connected);
  const ready = connected && !status.data?.needs_reauth;
  const existing = useQuery({
    queryKey: postsKey(source),
    queryFn: () => buffer.posts(source),
    enabled: connected,
    staleTime: 30_000,
  });

  const usable = (status.data?.channels ?? []).filter(
    (c) => !c.is_locked && !c.is_disconnected,
  );
  // Picks and tone start from the saved settings and live in the dialog.
  const chosen = picked ?? status.data?.channel_ids ?? [];
  const activeTone: BufferTone = tone ?? status.data?.tone ?? "dev_log";

  const composed = useQueries({
    queries: chosen.map((channelId) => ({
      queryKey: [...composeKey(source), channelId, activeTone],
      queryFn: () =>
        buffer.compose({
          ...source,
          tone: activeTone,
          channel_ids: [channelId],
        }),
      enabled: open && ready,
      staleTime: Infinity,
      retry: false,
    })),
  });

  const cards = chosen.map((channelId, i) => {
    const query = composed[i];
    const post = query.data?.posts[0];
    const channel = usable.find((c) => c.id === channelId);
    return {
      channel_id: channelId,
      label: post?.label ?? channel?.label ?? "",
      name: post?.name ?? channel?.display_name ?? channel?.name ?? "",
      limit: post?.limit ?? channel?.limit ?? 500,
      text: edits[channelId] ?? post?.text ?? "",
      pending: query.isPending,
      error: query.error?.message ?? null,
      refetch: query.refetch,
    };
  });
  const written = cards.filter((c) => !c.pending && !c.error);
  const writing = cards.some((c) => c.pending);
  const overLimit = written.some((c) => c.text.length > c.limit);
  const empty = written.some((c) => c.text.trim().length === 0);
  const canSend = written.length > 0 && !writing && !overLimit && !empty;
  const already = existing.data ?? [];

  const publish = useMutation({
    mutationFn: () =>
      buffer.publish({
        ...source,
        mode,
        items: written.map((c) => ({ channel_id: c.channel_id, text: c.text })),
      }),
    onSuccess: (result) => {
      const failed = result.results.filter((r) => !r.ok);
      const where = result.results
        .filter((r) => r.ok)
        .map((r) => r.label)
        .join(", ");
      toast.success(
        mode === "now"
          ? `Published on ${where}.`
          : mode === "queue"
            ? `Queued on ${where}.`
            : `Saved as drafts in Buffer for ${where}.`,
      );
      for (const f of failed) toast.error(`${f.label}: ${f.error}`);
      queryClient.invalidateQueries({ queryKey: postsKey(source) });
      close();
    },
    onError: (error) => toast.error(error.message),
  });

  const close = () => {
    setOpen(false);
    setEdits({});
    setPicked(null);
    setTone(null);
    setMode("draft");
    if (cameBack || connectError) router.replace(pathname);
  };

  const toggleChannel = (id: string) => {
    const next = chosen.includes(id)
      ? chosen.filter((c) => c !== id)
      : [...chosen, id];
    setPicked(next);
    // Remembered for next time and for the nightly drafts.
    saveSettings.mutate({ channel_ids: next });
  };

  const rewrite = () => {
    setEdits({});
    queryClient.invalidateQueries({ queryKey: composeKey(source) });
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Send className="size-3.5" />
        {label}
        {already.length > 0 && (
          <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px] tabular-nums text-muted-foreground">
            {already.length}
          </span>
        )}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : close())}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              {ready
                ? "Pick where it goes. One post per channel, written from this log. Change any word before it goes."
                : "Connect Buffer once, then any day or week becomes a post in one click."}
            </DialogDescription>
          </DialogHeader>

          {status.isPending && (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {status.data && !connected && (
            <div className="space-y-3 py-2">
              {connectError && (
                <p className="text-sm text-destructive">{connectError}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {status.data.configured
                  ? "You'll approve WriteLogs in Buffer and land right back here. We only read your channels and create posts."
                  : "Buffer isn't set up on this server yet."}
              </p>
              {status.data.configured && (
                <Button
                  loading={connect.isPending}
                  onClick={() => connect.mutate(pathname)}
                >
                  Connect Buffer
                </Button>
              )}
            </div>
          )}

          {status.data?.connected && status.data.needs_reauth && (
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                Buffer stopped accepting our access. Reconnect to keep posting.
              </p>
              <Button
                loading={connect.isPending}
                onClick={() => connect.mutate(pathname)}
              >
                Reconnect Buffer
              </Button>
            </div>
          )}

          {ready && (
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Post to</p>
                {usable.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No channels on your Buffer account yet. Add one at{" "}
                    <a
                      href="https://publish.buffer.com"
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    >
                      publish.buffer.com
                    </a>
                    , then come back.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {usable.map((channel) => (
                      <ChannelChip
                        key={channel.id}
                        channel={channel}
                        picked={chosen.includes(channel.id)}
                        disabled={publish.isPending}
                        onToggle={() => toggleChannel(channel.id)}
                      />
                    ))}
                  </div>
                )}
                {usable.length > 0 && chosen.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Pick at least one channel to write for.
                  </p>
                )}
              </div>

              {already.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Already in Buffer:{" "}
                  {already
                    .map(
                      (p) =>
                        `${p.label} (${p.mode === "now" ? "published" : p.mode === "queue" ? "queued" : "draft"})`,
                    )
                    .join(", ")}
                  .
                </p>
              )}

              {cards.map((card) => {
                const over = card.text.length > card.limit;
                return (
                  <div key={card.channel_id} className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-medium">
                        {card.label}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {card.name}
                        </span>
                      </p>
                      {!card.pending && !card.error && (
                        <p
                          className={`text-xs tabular-nums ${
                            over ? "text-destructive" : "text-muted-foreground"
                          }`}
                        >
                          {card.text.length.toLocaleString()} /{" "}
                          {card.limit.toLocaleString()}
                        </p>
                      )}
                    </div>
                    {card.pending ? (
                      <Skeleton className="h-28 w-full" />
                    ) : card.error ? (
                      <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                        <p className="text-sm text-muted-foreground">
                          {card.error}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => card.refetch()}
                        >
                          Try again
                        </Button>
                      </div>
                    ) : (
                      <Textarea
                        value={card.text}
                        rows={Math.min(
                          12,
                          Math.max(4, card.text.split("\n").length + 1),
                        )}
                        aria-invalid={over}
                        onChange={(e) =>
                          setEdits((all) => ({
                            ...all,
                            [card.channel_id]: e.target.value,
                          }))
                        }
                        className="text-sm leading-relaxed"
                      />
                    )}
                  </div>
                );
              })}

              {cards.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex flex-wrap gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tone</p>
                      <Select
                        value={activeTone}
                        onValueChange={(value) => {
                          setEdits({});
                          setTone(value as BufferTone);
                        }}
                        disabled={writing}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(TONE_LABELS) as BufferTone[]).map(
                            (t) => (
                              <SelectItem key={t} value={t}>
                                {TONE_LABELS[t].label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Send as</p>
                      <Select
                        value={mode}
                        onValueChange={(value) => setMode(value as BufferMode)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(MODE_LABELS) as BufferMode[]).map(
                            (m) => (
                              <SelectItem key={m} value={m}>
                                {MODE_LABELS[m].label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground sm:max-w-56 sm:text-right">
                    {MODE_LABELS[mode].hint}
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Tone, channels and nightly drafts can also be set in{" "}
                <Link
                  href="/dashboard/buffer"
                  className="underline underline-offset-4"
                >
                  Buffer settings
                </Link>
                .
              </p>
            </div>
          )}

          {ready && cards.length > 0 && (
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={writing || publish.isPending}
                onClick={rewrite}
              >
                Rewrite
              </Button>
              <Button
                type="button"
                loading={publish.isPending}
                disabled={!canSend}
                variant={mode === "now" ? "destructive" : "default"}
                onClick={() => publish.mutate()}
              >
                {MODE_LABELS[mode].label}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
