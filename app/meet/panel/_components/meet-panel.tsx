"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Script from "next/script";
import dayjs from "dayjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, RefreshCw } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { cn, copyText } from "@/lib/utils";

import { ConnectScreen } from "./connect-screen";
import { PanelSkeleton } from "./panel-skeleton";

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

  const queryClient = useQueryClient();
  const disconnect = useCallback(() => {
    clearSession();
    // Drop the previous account's projects and logs so a different sign-in
    // never sees them flash before its own load.
    queryClient.removeQueries({ queryKey: ["meet"] });
    setProjectId(null);
    setConnected(false);
  }, [queryClient]);

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

  if (connected === null) {
    return (
      <PanelShell>
        <PanelSkeleton />
      </PanelShell>
    );
  }

  if (!connected) {
    return (
      <PanelShell>
        <ConnectScreen onConnect={connect} />
      </PanelShell>
    );
  }

  // Stays on screen in every connected state. Hiding it whenever a project has
  // nothing to show would strand the user there with no way back.
  const picker =
    allProjects.length > 1 ? (
      // Not a native <select>: its menu is drawn by the OS, so inside the Meet
      // panel it spills over the add-on's own header.
      <div className="space-y-1.5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Project
        </p>
        <Select value={activeProjectId ?? ""} onValueChange={setProjectId}>
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
      </div>
    ) : null;

  const footer = (
    <button
      type="button"
      onClick={disconnect}
      className="text-xs text-muted-foreground underline-offset-4 hover:underline"
    >
      Disconnect WriteLogs
    </button>
  );

  if (projectsQuery.isPending || (activeProjectId && summaryQuery.isPending)) {
    return (
      <PanelShell header={picker} footer={footer}>
        <PanelSkeleton />
      </PanelShell>
    );
  }

  if (error) {
    return (
      <PanelShell header={picker} footer={footer}>
        <Message
          art="error"
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
      <PanelShell header={picker} footer={footer}>
        <Message
          art="empty"
          title="Nothing logged yet"
          body="Install the WriteLogs extension in VS Code or Cursor. It watches what you build and writes your log, and the summary lands here."
          action={
            <a
              href="/dashboard/extension"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Get the extension
            </a>
          }
        />
      </PanelShell>
    );
  }

  return (
    <PanelShell header={picker} footer={footer}>
      <div className="space-y-4">
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
  const [revealed, setRevealed] = useState<string | null>(null);
  const revealRef = useRef<HTMLTextAreaElement>(null);

  // Fetched up front so the click itself does no network work: clipboard
  // access needs the user gesture that started it, and an await in between
  // can outlive that gesture.
  const standupQuery = useQuery({
    queryKey: ["meet", "standup", summaryId],
    queryFn: () => summariesApi.standup(summaryId),
    retry: false,
  });

  useEffect(() => {
    setRevealed(null);
    setNote(null);
    setState("idle");
  }, [summaryId]);

  useEffect(() => {
    if (revealed === null) return;
    const el = revealRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, [revealed]);

  const resolveText = async (): Promise<string> => {
    if (standupQuery.data) return standupQuery.data;
    if (standupQuery.error) {
      // Standup text is a Pro feature; the plain summary still copies fine.
      if (isUpgradeRequired(standupQuery.error)) {
        setNote("Standup formatting is a Pro feature.");
      }
      return fallback;
    }
    try {
      return await summariesApi.standup(summaryId);
    } catch (err) {
      if (isUpgradeRequired(err)) setNote("Standup formatting is a Pro feature.");
      return fallback;
    }
  };

  const copy = async () => {
    setState("busy");
    setNote(null);
    const text = await resolveText();
    if (await copyText(text)) {
      setRevealed(null);
      setState("copied");
      setTimeout(() => setState("idle"), 1800);
      return;
    }
    // No clipboard access in this host. Hand the text over for a manual copy
    // rather than a dead end.
    setState("idle");
    setRevealed(text);
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
      {revealed !== null ? (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Clipboard access is off in this panel. The text is selected below,
            so press {MODIFIER_KEY}+C to copy it.
          </p>
          <Textarea
            ref={revealRef}
            readOnly
            value={revealed}
            onFocus={(e) => e.currentTarget.select()}
            className="min-h-32 text-xs"
            aria-label="Standup text"
          />
        </div>
      ) : null}
    </div>
  );
}

const MODIFIER_KEY =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
    ? "\u2318"
    : "Ctrl";

function PanelShell({
  children,
  header,
  footer,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    // pt-8, not p-4: flush against Meet's header, the first control here sits
    // a few pixels under Meet's own back arrow and catches clicks meant for it.
    <div className="flex min-h-svh flex-col px-4 pb-4 pt-8">
      {header ? <div className="mb-5">{header}</div> : null}
      <div className="flex-1">{children}</div>
      {footer ? <div className="mt-6 text-center">{footer}</div> : null}
    </div>
  );
}

/** Art matches the dashboard's EmptyState and ErrorState, scaled for the panel. */
const ART = {
  empty: {
    src: "/loggy/loggy-empty.png",
    alt: "Loggy the mascot waiting patiently with a pencil and a blank page",
    width: 84,
    height: 112,
  },
  error: {
    src: "/loggy/loggy-error.png",
    alt: "Loggy the mascot scratching his head over a crumpled log sheet",
    width: 78,
    height: 101,
  },
} as const;

function Message({
  art,
  title,
  body,
  action,
}: {
  art: keyof typeof ART;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-3 py-8 text-center">
      <Image
        src={ART[art].src}
        alt={ART[art].alt}
        width={ART[art].width}
        height={ART[art].height}
        className="mx-auto"
      />
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{body}</p>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
