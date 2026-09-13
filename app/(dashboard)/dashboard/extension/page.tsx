import type { Metadata } from "next";
import Image from "next/image";

import { EditorGrid } from "@/components/editor-links";
import { buttonVariants } from "@/components/ui/button";
import { MEET_ADDON_URL } from "@/lib/meet-addon";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Get the extension" };

const STEPS = [
  {
    title: "Install the extension",
    detail: "Pick your editor below — it opens right in the Extensions panel.",
  },
  {
    title: "Grab a project key",
    detail:
      "Create a project on the dashboard and copy its key (wrlg_...) from the Keys tab.",
  },
  {
    title: "Paste it in the sidebar",
    detail:
      "Open the WriteLogs sidebar in your editor, paste the key, and start coding. Work syncs after each pause.",
  },
];

export default function ExtensionPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        Get the extension
      </h1>
      <p className="text-muted-foreground mt-1">
        One extension, every VS Code-based editor. Install it where you code
        and your work logs itself.
      </p>

      <div className="mt-12">
        <EditorGrid />
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title}>
            <p className="text-sm font-medium">
              <span className="text-muted-foreground mr-2">{i + 1}</span>
              {step.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {step.detail}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        Using a different editor? Search for &quot;WriteLogs&quot; in its
        Extensions panel.
      </p>

      <div className="mt-16 border-t pt-10">
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Bring it to your standup
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              Add WriteLogs to Google Meet and your latest log opens in the side
              panel during the call. Connect once, then switch projects and copy
              a standup-ready version without leaving the meeting.
            </p>
            <a
              href={MEET_ADDON_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "mt-5")}
            >
              Add to Meet
            </a>
          </div>

          <Image
            src="/meet-panel.jpg"
            alt="The WriteLogs side panel open during a meeting"
            width={2400}
            height={1559}
            className="h-auto w-full rounded-lg border"
          />
        </div>
      </div>
    </div>
  );
}
