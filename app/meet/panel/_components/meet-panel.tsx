"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Script from "next/script";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adoptSession,
  clearSession,
  isAuthenticated,
  isUpgradeRequired,
  projects as projectsApi,
  SESSION_EXPIRED_MESSAGE,
  summaries as summariesApi,
} from "@/lib/api-client";
import type { User } from "@/lib/types";

const HANDOFF_MESSAGE = "writelogs:meet-session";
const CLOUD_PROJECT_NUMBER =
  process.env.NEXT_PUBLIC_MEET_CLOUD_PROJECT_NUMBER ?? "";

type MeetGlobal = {
  addon?: {
    createAddonSession: (opts: {
      cloudProjectNumber: string;
    }) => Promise<{ createSidePanelClient: () => Promise<unknown> }>;
  };
};

/** Pinned version, loaded from Google's CDN at runtime rather than bundled. */
const MEET_SDK = "https://www.gstatic.com/meetjs/addons/1.1.0/meet.addons.js";

/**
 * Tells Meet the add-on has finished loading. Not optional: Meet covers the
 * iframe with its own "Loading" spinner until createSidePanelClient resolves,
 * so if this never runs the panel below is never shown at all.
 *
 * It waits on the SDK script, because the effect would otherwise race the CDN
 * load and find no window.meet, with nothing to retry it.
 */
function useMeetSession(sdkReady: boolean) {
  useEffect(() => {
    if (!sdkReady) return;
    if (!CLOUD_PROJECT_NUMBER) {
      console.warn(
        "NEXT_PUBLIC_MEET_CLOUD_PROJECT_NUMBER is unset, so Meet will keep showing its loading spinner.",
      );
      return;
    }
    const meet = (window as unknown as { meet?: MeetGlobal }).meet;
    if (!meet?.addon) return;
    meet.addon
      .createAddonSession({ cloudProjectNumber: CLOUD_PROJECT_NUMBER })
      .then((session) => session.createSidePanelClient())
      .catch((err: unknown) => console.warn("Meet add-on session failed", err));
  }, [sdkReady]);
}

export function MeetPanel() {
  const [sdkReady, setSdkReady] = useState(false);
  useMeetSession(sdkReady);

  return (
    <>
      {/* onReady rather than onLoad, so a cached script still marks us ready. */}
      <Script
        src={MEET_SDK}
        strategy="afterInteractive"
        onReady={() => setSdkReady(true)}
      />
      <PanelBody />
    </>
  );
}

function PanelBody() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => setConnected(isAuthenticated()), []);

  // The connect popup posts the dashboard session back to this iframe.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as {
        type?: string;
        refresh_token?: string;
        user?: User | null;
      };
      if (data?.type !== HANDOFF_MESSAGE || !data.refresh_token) return;
      adoptSession(data.refresh_token, data.user);
      setConnected(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const connect = useCallback(() => {
    window.open(
      "/meet/connect",
      "writelogs-connect",
      "width=420,height=560,noopener=no",
    );
  }, []);

  const projectsQuery = useQuery({
    queryKey: ["meet", "projects"],
    queryFn: () => projectsApi.list({ limit: 50 }),
    enabled: connected === true,
  });

  const allProjects = projectsQuery.data?.data ?? [];
  const activeProjectId = projectId ?? allProjects[0]?.id ?? null;

  const summaryQuery = useQuery({
    queryKey: ["meet", "summary", activeProjectId],
    queryFn: () => summariesApi.listByProject(activeProjectId!, { limit: 1 }),
    enabled: Boolean(activeProjectId),
    refetchOnWindowFocus: true,
  });

  const summary = summaryQuery.data?.data?.[0] ?? null;
  const error = projectsQuery.error ?? summaryQuery.error;

  // A dead session belongs back at Connect, not in a retry loop that can't win.
  useEffect(() => {
    if (error instanceof Error && error.message === SESSION_EXPIRED_MESSAGE) {
      clearSession();
      setConnected(false);
    }
  }, [error]);

  if (connected === null) return <PanelShell><Spinner /></PanelShell>;

  if (!connected) {
    return (
      <PanelShell>
        <div className="space-y-4 text-center">
          <Image
            src="/loggy/loggy-head.png"
            alt=""
            width={40}
            height={41}
            className="mx-auto"
          />
          <div className="space-y-1">
            <p className="font-medium">Connect WriteLogs</p>
            <p className="text-sm text-muted-foreground">
              One time, then your latest log shows up here every standup.
            </p>
          </div>
          <Button onClick={connect} className="w-full">
            Connect
          </Button>
        </div>
      </PanelShell>
    );
  }

  if (projectsQuery.isPending || (activeProjectId && summaryQuery.isPending)) {
    return <PanelShell><Spinner /></PanelShell>;
  }

  if (error) {
    return (
      <PanelShell>
        <Message
          title="Couldn't load your log"
          body={error instanceof Error ? error.message : "Try again in a moment."}
          action={
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                projectsQuery.refetch();
                summaryQuery.refetch();
              }}
            >
              <RefreshCw className="size-4" />
              Retry
            </Button>
          }
        />
      </PanelShell>
    );
  }

  if (!summary) {
    return (
      <PanelShell>
        <Message
          title="Nothing logged yet"
          body="Once you've coded with the extension running, your summary lands here."
        />
      </PanelShell>
    );
  }

  return (
    <PanelShell>
      <div className="space-y-4">
        {allProjects.length > 1 ? (
          // Not a native <select>: its menu is drawn by the OS, so inside the
          // Meet panel it spills over the add-on's own header.
          <Select
            value={activeProjectId ?? ""}
            onValueChange={setProjectId}
          >
            <SelectTrigger size="sm" className="w-full" aria-label="Project">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              {allProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <div>
          <p className="text-xs text-muted-foreground">
            {dayjs(summary.date).format("ddd, MMM D YYYY")}
          </p>
          <h1 className="mt-1 text-sm font-semibold leading-snug">
            {summary.title}
          </h1>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {summary.message_first_person || summary.message}
        </p>

        {summary.tasks.length > 0 ? (
          <ul className="space-y-2 border-t pt-4">
            {summary.tasks.map((task) => (
              <li key={task.id} className="flex gap-2 text-sm leading-relaxed">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                <span>{task.task_first_person || task.task}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <CopyStandup summaryId={summary.id} fallback={summary.message} />
      </div>
    </PanelShell>
  );
}

function CopyStandup({
  summaryId,
  fallback,
}: {
  summaryId: string;
  fallback: string;
}) {
  const [state, setState] = useState<"idle" | "busy" | "copied">("idle");
  const [note, setNote] = useState<string | null>(null);

  const copy = async () => {
    setState("busy");
    setNote(null);
    let text = fallback;
    try {
      text = await summariesApi.standup(summaryId);
    } catch (err) {
      // Standup text is a Pro feature; the plain summary still copies fine.
      if (isUpgradeRequired(err)) setNote("Standup formatting is a Pro feature.");
    }
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("idle");
      setNote("Your browser blocked the clipboard here.");
    }
  };

  return (
    <div className="space-y-2 border-t pt-4">
      <Button
        onClick={copy}
        variant="outline"
        className="w-full"
        loading={state === "busy"}
      >
        {state === "copied" ? (
          <>
            <Check className="size-4" />
            Copied
          </>
        ) : (
          <>
            <Copy className="size-4" />
            Copy for standup
          </>
        )}
      </Button>
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}

function PanelShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh p-4">{children}</div>;
}

function Spinner() {
  return (
    <div className="flex min-h-[60svh] items-center justify-center text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}

function Message({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-3 py-8 text-center">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{body}</p>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
