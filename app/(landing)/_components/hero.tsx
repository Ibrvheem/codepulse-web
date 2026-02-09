"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { WaitlistDialog } from "./waitlist-dialog";

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Centered hero content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-neutral-900 leading-[1.02] tracking-[-0.04em]">
            Your work, logged.
            <br />
            <span className="text-neutral-300">Automatically.</span>
          </h1>

          <p className="mt-8 text-xl md:text-2xl text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            A VS Code extension that watches what you build and writes your
            daily summary for you.
          </p>

          <div className="mt-10">
            <WaitlistDialog>
              <Button
                size="lg"
                className="bg-neutral-900 hover:bg-neutral-800 text-white h-14 px-8 text-base rounded-full"
              >
                Get early access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </WaitlistDialog>
          </div>

          <p className="mt-6 text-sm text-neutral-400">
            Free during beta. No credit card required.
          </p>
        </motion.div>

        {/* Editor mockup - centered below */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-20 lg:mt-24"
        >
          <EditorMockup />
        </motion.div>
      </div>
    </section>
  );
}

function EditorMockup() {
  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Editor window */}
      <div className="bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#252526] border-b border-neutral-800">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-neutral-500 font-mono">
              api/users.ts
            </span>
          </div>
        </div>

        {/* Code area */}
        <div className="p-5 font-mono text-sm leading-relaxed">
          <CodeLine num={1} indent={0}>
            <span className="text-[#c586c0]">export async function</span>{" "}
            <span className="text-[#dcdcaa]">createUser</span>
            <span className="text-neutral-400">(</span>
            <span className="text-[#9cdcfe]">data</span>
            <span className="text-neutral-400">)</span>{" "}
            <span className="text-neutral-400">{"{"}</span>
          </CodeLine>
          <CodeLine num={2} indent={2}>
            <span className="text-[#c586c0]">const</span>{" "}
            <span className="text-[#9cdcfe]">user</span>{" "}
            <span className="text-neutral-400">=</span>{" "}
            <span className="text-[#c586c0]">await</span>{" "}
            <span className="text-[#9cdcfe]">db</span>
            <span className="text-neutral-400">.</span>
            <span className="text-[#dcdcaa]">insert</span>
            <span className="text-neutral-400">(</span>
            <span className="text-[#9cdcfe]">users</span>
            <span className="text-neutral-400">)</span>
          </CodeLine>
          <CodeLine num={3} indent={4}>
            <span className="text-neutral-400">.</span>
            <span className="text-[#dcdcaa]">values</span>
            <span className="text-neutral-400">(</span>
            <span className="text-[#9cdcfe]">data</span>
            <span className="text-neutral-400">)</span>
          </CodeLine>
          <CodeLine num={4} indent={4}>
            <span className="text-neutral-400">.</span>
            <span className="text-[#dcdcaa]">returning</span>
            <span className="text-neutral-400">();</span>
          </CodeLine>
          <CodeLine num={5} indent={2}>
            <span className="text-[#c586c0]">return</span>{" "}
            <span className="text-[#9cdcfe]">user</span>
            <span className="text-neutral-400">[</span>
            <span className="text-[#b5cea8]">0</span>
            <span className="text-neutral-400">];</span>
          </CodeLine>
          <CodeLine num={6} indent={0}>
            <span className="text-neutral-400">{"}"}</span>
          </CodeLine>
        </div>

        {/* WriteLogs status bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-800 text-neutral-400 text-xs border-t border-neutral-700">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
            </span>
            <span>WriteLogs</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-500">
            <span>2h 34m</span>
          </div>
        </div>
      </div>

      {/* Floating summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="absolute -bottom-6 right-4 lg:right-8 bg-white rounded-xl shadow-xl border border-neutral-200/80 p-4 w-72"
      >
        <p className="text-xs text-neutral-400 mb-2">Today&apos;s summary</p>
        <p className="text-sm text-neutral-700 leading-relaxed">
          Added user creation endpoint with database insert. Returns the newly
          created user record.
        </p>
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
          <span>3h 12m active</span>
          <span>Auto-generated</span>
        </div>
      </motion.div>
    </div>
  );
}

function CodeLine({
  num,
  indent,
  children,
}: {
  num: number;
  indent: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <span className="w-8 text-neutral-600 text-right pr-4 select-none">
        {num}
      </span>
      <span style={{ paddingLeft: `${indent * 0.5}rem` }}>{children}</span>
    </div>
  );
}
