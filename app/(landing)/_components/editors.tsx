"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { announceEditorOpen } from "@/components/editor-links";

const EXTENSION_ID = "IbrahimAliyu.writelogs";

// The forks don't use Microsoft's marketplace — a <scheme>:extension/<id>
// URL opens the extension straight in the editor's Extensions panel.
// Art: public/editors/<slug>.png (Loggy with each editor's logo, 256px).
const EDITORS = [
  { name: "VS Code", slug: "vscode", href: `vscode:extension/${EXTENSION_ID}` },
  { name: "Cursor", slug: "cursor", href: `cursor:extension/${EXTENSION_ID}` },
  { name: "Antigravity", slug: "antigravity", href: `antigravity:extension/${EXTENSION_ID}` },
  // Devin Desktop is the rebranded Windsurf; installs updated in place, so
  // the windsurf: URL scheme still resolves.
  { name: "Devin Desktop", slug: "devin", href: `windsurf:extension/${EXTENSION_ID}` },
  { name: "Kiro", slug: "kiro", href: `kiro:extension/${EXTENSION_ID}` },
  { name: "VSCodium", slug: "vscodium", href: `vscodium:extension/${EXTENSION_ID}` },
];

export function EditorsSection() {
  return (
    <section id="get-extension" className="scroll-mt-14 py-28 lg:py-40">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 leading-[1.08] tracking-[-0.03em]">
            Works where you code.
          </h2>
          <p className="mt-5 text-lg md:text-xl text-neutral-500 leading-relaxed max-w-xl mx-auto">
            One extension, every VS Code-based editor. Pick yours and
            it opens right in the Extensions panel.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-12">
          {EDITORS.map((editor, i) => (
            <motion.a
              key={editor.slug}
              href={editor.href}
              onClick={() => announceEditorOpen(editor.name)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group flex flex-col items-center gap-4 transition-transform duration-200 ease-out active:scale-[0.97]"
            >
              <Image
                src={`/editors/${editor.slug}.png`}
                alt={`Loggy with the ${editor.name} logo`}
                width={96}
                height={96}
                className="transition-transform duration-200 ease-out group-hover:scale-[1.06] group-hover:-translate-y-1"
              />
              <span className="text-sm font-medium text-neutral-500 transition-colors duration-150 group-hover:text-neutral-900">
                {editor.name}
              </span>
            </motion.a>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center text-sm text-neutral-400"
        >
          Something else? Search for &quot;WriteLogs&quot; in your
          editor&apos;s Extensions panel.
        </motion.p>
      </div>
    </section>
  );
}
