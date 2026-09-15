import { EXTENSION_MARKETPLACE_URL, EXTENSION_OPENVSX_URL } from "@/lib/config";

import type { Faq } from "../../../types";

export type EditorPage = {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  heroSubtitle: string;
  installUrl: string;
  installLabel: string;
  angleTitle: string;
  angleBody: string[];
  steps: { title: string; body: string }[];
  sampleLines: string[];
  faqs: Faq[];
};

/**
 * One page per editor. The copy is written per editor on purpose — a
 * find-and-replace of the editor name across one template is exactly the
 * kind of page Google's scaled-content policy targets.
 */
export const EDITOR_PAGES: EditorPage[] = [
  {
    slug: "vscode",
    name: "VS Code",
    metaTitle: "VS Code daily work logs and standup notes, written for you",
    metaDescription:
      "A VS Code extension that watches what you change and writes your daily work log for you. No timers, no forms, no end-of-day recall.",
    h1: "Automatic work logs for VS Code",
    heroSubtitle:
      "WriteLogs runs quietly inside VS Code, notices what you change, and writes your day up in plain English. Nothing to start, nothing to fill in.",
    installUrl: EXTENSION_MARKETPLACE_URL,
    installLabel: "View on the Marketplace",
    angleTitle: "VS Code remembers your files. It doesn't remember your day.",
    angleBody: [
      "Your editor keeps every file you opened and every change you saved. What it does not keep is the one sentence you need at half past nine the next morning: what did I actually do yesterday?",
      "Commit messages do not fill that gap. They are written for the person reviewing the diff, in the language of the diff. A message like “fix: null check on user lookup” is accurate and completely useless out loud.",
      "WriteLogs reads the change history your editor already produces and writes it back as sentences a person can say in a meeting.",
    ],
    steps: [
      {
        title: "Install the extension",
        body: "Open the Extensions panel in VS Code and search for WriteLogs, or install it straight from the Visual Studio Marketplace.",
      },
      {
        title: "Paste a project key",
        body: "Create a project on the dashboard, copy its key, and paste it into the WriteLogs sidebar. That is the whole setup.",
      },
      {
        title: "Carry on coding",
        body: "The extension syncs after each pause in your work. Your log is waiting on the dashboard whenever you need it.",
      },
    ],
    sampleLines: [
      "Added the user creation endpoint and wired it to the database insert.",
      "Fixed the null check that was throwing on lookups for deleted accounts.",
      "Started validation for the signup form. Not finished.",
    ],
    faqs: [
      {
        q: "Does WriteLogs slow VS Code down?",
        a: "No. It watches the file changes the editor already emits and syncs in the background after you pause. There is no indexing step and nothing hooked into your build.",
      },
      {
        q: "Do I have to start and stop a timer?",
        a: "No. There is nothing to start. The extension notices when you are working and when you have stepped away.",
      },
      {
        q: "Do I need to commit before it sees my work?",
        a: "No. Changes are captured when they are saved to disk, well before anything reaches git.",
      },
      {
        q: "Does it work in Cursor and the other VS Code forks?",
        a: "Yes, it is the same extension. There are dedicated pages for Cursor and Antigravity, and it installs in Devin Desktop, Kiro and VSCodium too.",
      },
    ],
  },
  {
    slug: "cursor",
    name: "Cursor",
    metaTitle: "Cursor daily work logs and standups that include what the AI wrote",
    metaDescription:
      "A Cursor extension that records what changed on disk, whether you typed it or accepted it from the model, and writes your daily work log.",
    h1: "Work logs for Cursor, including the code you didn't type",
    heroSubtitle:
      "Cursor writes with you. WriteLogs records what changed either way, so your daily log reflects the work rather than just the typing.",
    installUrl: EXTENSION_OPENVSX_URL,
    installLabel: "View on Open VSX",
    angleTitle: "The more the model writes, the less you remember.",
    angleBody: [
      "Delegating to Cursor changes what a day feels like. You describe, you review, you accept, you move on. A dozen files change and none of it goes through your fingers, so none of it sticks.",
      "By Friday the week is a blur of accepted diffs. You know it was productive. You cannot say what it produced.",
      "WriteLogs captures changes the moment they land on disk, whether you typed them or took them from the model. The log reads the same either way.",
    ],
    steps: [
      {
        title: "Install the extension",
        body: "Open the Extensions panel in Cursor and search for WriteLogs. Cursor installs from Open VSX, where the extension is published.",
      },
      {
        title: "Paste a project key",
        body: "Create a project on the dashboard, copy its key, and paste it into the WriteLogs sidebar. That is the whole setup.",
      },
      {
        title: "Work the way you already work",
        body: "Type it, prompt it, accept it. Changes are captured when they hit disk, before any commit.",
      },
    ],
    sampleLines: [
      "Rewrote the invoice serializer and split the totals calculation into its own module.",
      "Replaced the hand-rolled retry logic in the webhook handler.",
      "Added tests for the new serializer. Two still failing on rounding.",
    ],
    faqs: [
      {
        q: "Does it capture changes the model made?",
        a: "Yes. WriteLogs works from what changed on disk, so an edit you accepted from Cursor is recorded the same as one you typed.",
      },
      {
        q: "Does it work alongside Claude Code?",
        a: "Yes. Changes from AI tools like Claude Code are captured the minute they hit disk, even before you commit.",
      },
      {
        q: "Is this a different extension from the VS Code one?",
        a: "It is the same extension. Cursor is a VS Code fork, so one build covers both editors.",
      },
      {
        q: "Do I have to remember to turn it on?",
        a: "No. There is no timer and no session to start. Install it once, paste a project key, and it runs.",
      },
    ],
  },
  {
    slug: "antigravity",
    name: "Antigravity",
    metaTitle: "Antigravity daily logs and standups for agent-driven work",
    metaDescription:
      "An Antigravity extension that records what changed while agents worked, so the work still shows up in your daily log and your standup.",
    h1: "Daily work logs for Antigravity",
    heroSubtitle:
      "Agents finish work while you are doing something else. WriteLogs records what changed, so that work still shows up in your log.",
    installUrl: EXTENSION_OPENVSX_URL,
    installLabel: "View on Open VSX",
    angleTitle: "The agent did the work. You still have to explain it.",
    angleBody: [
      "Agent-driven development moves the work off your screen. You set a task running, do something else, and come back to a diff to review.",
      "That is efficient, and it is terrible for recall. The part you remember is the review, and the review is the smallest part of it.",
      "WriteLogs records what changed and when, so a task an agent finished on your behalf sits in the log with everything else you did that day.",
    ],
    steps: [
      {
        title: "Install the extension",
        body: "Open the Extensions panel in Antigravity and search for WriteLogs. Antigravity installs from Open VSX, where the extension is published.",
      },
      {
        title: "Paste a project key",
        body: "Create a project on the dashboard, copy its key, and paste it into the WriteLogs sidebar. That is the whole setup.",
      },
      {
        title: "Let the agents run",
        body: "Work that lands on disk while the editor is open is captured, and the sync happens after each pause.",
      },
    ],
    sampleLines: [
      "Migrated the settings screen off the deprecated form helper.",
      "Regenerated the API client after the schema change and fixed the call sites.",
      "Reviewed and reverted an agent change to the auth middleware.",
    ],
    faqs: [
      {
        q: "Does it record work an agent did while I was away?",
        a: "Yes. WriteLogs works from changes on disk, so it does not matter who or what made them.",
      },
      {
        q: "Do I need to keep the editor open?",
        a: "The extension runs with the editor. Work that lands while Antigravity is open is captured, and it syncs after each pause.",
      },
      {
        q: "Is this a different extension from the VS Code one?",
        a: "It is the same extension. Antigravity is a VS Code fork, so one build covers both editors.",
      },
      {
        q: "Which other editors are supported?",
        a: "VS Code, Cursor, Devin Desktop, Kiro and VSCodium, all from the same extension.",
      },
    ],
  },
];

export function getEditorPage(slug: string): EditorPage | undefined {
  return EDITOR_PAGES.find((page) => page.slug === slug);
}
