"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";

const EXTENSION_ID = "IbrahimAliyu.writelogs";

// The forks don't use Microsoft's marketplace — a <scheme>:extension/<id>
// URL opens the extension straight in the editor's Extensions panel.
// Art: public/editors/<slug>.png (Loggy with each editor's logo, 256px).
// The landing page keeps its own styled copy of this list in
// app/(landing)/_components/editors.tsx.
export const EDITORS = [
  { name: "VS Code", slug: "vscode", href: `vscode:extension/${EXTENSION_ID}` },
  { name: "Cursor", slug: "cursor", href: `cursor:extension/${EXTENSION_ID}` },
  { name: "Antigravity", slug: "antigravity", href: `antigravity:extension/${EXTENSION_ID}` },
  // Devin Desktop is the rebranded Windsurf; installs updated in place, so
  // the windsurf: URL scheme still resolves.
  { name: "Devin Desktop", slug: "devin", href: `windsurf:extension/${EXTENSION_ID}` },
  { name: "Kiro", slug: "kiro", href: `kiro:extension/${EXTENSION_ID}` },
  { name: "VSCodium", slug: "vscodium", href: `vscodium:extension/${EXTENSION_ID}` },
];

/**
 * The browser's own protocol prompt can't be styled, but we can pair the
 * deep link with a branded toast — which also catches the silent dead-click
 * when the chosen editor isn't installed.
 */
export function announceEditorOpen(name: string) {
  toast(`Opening WriteLogs in ${name}`, {
    description: `Nothing happening? Search for "WriteLogs" in ${name}'s Extensions panel instead.`,
  });
}

/** Quiet icon strip — decorative reassurance for the auth pages. */
export function EditorIconStrip() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs text-muted-foreground">Works with your editor</p>
      <div className="flex flex-wrap items-center justify-center gap-5">
        {EDITORS.map((editor) => (
          <motion.a
            key={editor.slug}
            href={editor.href}
            onClick={() => announceEditorOpen(editor.name)}
            title={editor.name}
            // Springy dock-style pop: decorative, on a rarely-seen page, so
            // a little bounce is allowed. Reduced motion keeps only opacity.
            whileHover={
              reducedMotion ? { opacity: 1 } : { scale: 1.06, y: -4, opacity: 1 }
            }
            whileTap={reducedMotion ? undefined : { scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="opacity-70"
          >
            <Image
              src={`/editors/${editor.slug}.png`}
              alt={editor.name}
              width={64}
              height={64}
            />
          </motion.a>
        ))}
      </div>
    </div>
  );
}

/** Borderless editor grid — artwork on whitespace, token-aware for dark mode. */
export function EditorGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-10">
      {EDITORS.map((editor) => (
        <a
          key={editor.slug}
          href={editor.href}
          onClick={() => announceEditorOpen(editor.name)}
          className="group flex flex-col items-center gap-3 transition-transform duration-200 ease-out active:scale-[0.97]"
        >
          <Image
            src={`/editors/${editor.slug}.png`}
            alt={`Loggy with the ${editor.name} logo`}
            width={72}
            height={72}
            className="transition-transform duration-200 ease-out group-hover:scale-[1.06] group-hover:-translate-y-1"
          />
          <span className="text-sm font-medium text-muted-foreground transition-colors duration-150 group-hover:text-foreground">
            {editor.name}
          </span>
        </a>
      ))}
    </div>
  );
}
