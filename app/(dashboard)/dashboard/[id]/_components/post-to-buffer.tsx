"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import type { BufferComposedPost, BufferMode, BufferTone } from "@/lib/types";
import { useBufferStatus } from "../../buffer/_hooks/use-buffer";
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

/**
 * The one button that turns a day or a recap into posts. Opens a dialog that
 * writes one post per picked channel, lets the user fix the words, and sends
 * them to Buffer as drafts, queued, or published now.
 */
export function PostToBuffer({
  source,
  label = "Post to Buffer",
}: {
  source: SourceRef;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<BufferMode>("draft");
  const [tone, setTone] = useState<BufferTone | undefined>(undefined);
  const [posts, setPosts] = useState<BufferComposedPost[]>([]);
  const queryClient = useQueryClient();
  const status = useBufferStatus();
  const connected = Boolean(status.data?.connected);
  const ready = connected && !status.data?.needs_reauth;
  const existing = useQuery({
    queryKey: postsKey(source),
    queryFn: () => buffer.posts(source),
    enabled: connected,
    staleTime: 30_000,
  });

  const compose = useMutation({
    mutationFn: (t?: BufferTone) => buffer.compose({ ...source, tone: t }),
    onSuccess: (result) => {
      setPosts(result.posts);
      setTone(result.tone);
    },
    onError: (error) => toast.error(error.message),
  });

  const publish = useMutation({
    mutationFn: () =>
      buffer.publish({
        ...source,
        mode,
        items: posts.map((p) => ({ channel_id: p.channel_id, text: p.text })),
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
      setOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  // Write the posts the moment the dialog opens with a usable connection.
  useEffect(() => {
    if (open && ready && posts.length === 0 && !compose.isPending) {
      compose.mutate(undefined);
    }
  }, [open, ready]);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setPosts([]);
      setMode("draft");
    }
  };

  const overLimit = posts.some((p) => p.text.length > p.limit);
  const empty = posts.some((p) => p.text.trim().length === 0);
  const already = existing.data ?? [];

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

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              {ready
                ? "One post per channel, written from this log. Change any word before it goes."
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
              <p className="text-sm text-muted-foreground">
                Your Buffer account isn&apos;t connected yet.
              </p>
              <Button asChild>
                <Link href="/dashboard/buffer">Connect Buffer</Link>
              </Button>
            </div>
          )}

          {status.data?.connected && status.data.needs_reauth && (
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                Buffer stopped accepting our access. Reconnect to keep posting.
              </p>
              <Button asChild>
                <Link href="/dashboard/buffer">Reconnect Buffer</Link>
              </Button>
            </div>
          )}

          {ready && (
            <div className="space-y-5">
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

              {compose.isPending && posts.length === 0 && (
                <div className="space-y-3">
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <p className="text-xs text-muted-foreground">
                    Writing your posts…
                  </p>
                </div>
              )}

              {!compose.isPending && posts.length === 0 && compose.isError && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {compose.error.message}
                  </p>
                  {/^pick at least one/i.test(compose.error.message) ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/dashboard/buffer">Pick channels</Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => compose.mutate(tone)}
                    >
                      Try again
                    </Button>
                  )}
                </div>
              )}

              {posts.map((post, i) => {
                const over = post.text.length > post.limit;
                return (
                  <div key={post.channel_id} className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-medium">
                        {post.label}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {post.name}
                        </span>
                      </p>
                      <p
                        className={`text-xs tabular-nums ${
                          over ? "text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {post.text.length.toLocaleString()} /{" "}
                        {post.limit.toLocaleString()}
                      </p>
                    </div>
                    <Textarea
                      value={post.text}
                      rows={Math.min(
                        12,
                        Math.max(4, post.text.split("\n").length + 1),
                      )}
                      aria-invalid={over}
                      onChange={(e) =>
                        setPosts((all) =>
                          all.map((p, j) =>
                            j === i ? { ...p, text: e.target.value } : p,
                          ),
                        )
                      }
                      className="text-sm leading-relaxed"
                    />
                  </div>
                );
              })}

              {posts.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex flex-wrap gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tone</p>
                      <Select
                        value={tone ?? "dev_log"}
                        onValueChange={(value) => {
                          const next = value as BufferTone;
                          setTone(next);
                          compose.mutate(next);
                        }}
                        disabled={compose.isPending}
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
            </div>
          )}

          {ready && posts.length > 0 && (
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={compose.isPending || publish.isPending}
                onClick={() => compose.mutate(tone)}
              >
                Rewrite
              </Button>
              <Button
                type="button"
                loading={publish.isPending}
                disabled={compose.isPending || overLimit || empty}
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
