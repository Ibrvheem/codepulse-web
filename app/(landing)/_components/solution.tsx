"use client";

import { motion } from "framer-motion";

export function SolutionSection() {
  return (
    <section id="how-it-works" className="py-28 lg:py-40 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header - Apple style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 leading-[1.08] tracking-[-0.03em]">
            How it works.
          </h2>
        </motion.div>

        {/* Feature 1: Extension running in background */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-32 lg:mb-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl lg:text-4xl font-semibold text-neutral-900 leading-[1.15] tracking-[-0.02em] mb-5">
              Install once.
              <br />
              <span className="text-neutral-400">Forget it exists.</span>
            </h3>
            <p className="text-lg text-neutral-500 leading-relaxed">
              The VS Code extension runs silently in the background. It tracks
              file changes, detects when you step away, and syncs automatically.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ExtensionMockup />
          </motion.div>
        </div>

        {/* Feature 2: Dashboard */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-32 lg:mb-40">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-2 lg:order-1"
          >
            <DashboardMockup />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <h3 className="text-3xl lg:text-4xl font-semibold text-neutral-900 leading-[1.15] tracking-[-0.02em] mb-5">
              AI writes your logs.
              <br />
              <span className="text-neutral-400">You just review.</span>
            </h3>
            <p className="text-lg text-neutral-500 leading-relaxed">
              At the end of each day, get a clean summary of what you built.
              Copy it to Slack or paste it wherever you need.
            </p>
          </motion.div>
        </div>

        {/* Feature 3: Privacy */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl lg:text-4xl font-semibold text-neutral-900 leading-[1.15] tracking-[-0.02em] mb-5">
              Your code stays private.
              <br />
              <span className="text-neutral-400">Always.</span>
            </h3>
            <p className="text-lg text-neutral-500 leading-relaxed">
              We only see file change metadata—never your actual source code.
              Works offline. Syncs when you&apos;re ready.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <PrivacyMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ExtensionMockup() {
  return (
    <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#323233] border-b border-[#1e1e1e]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-neutral-400 ml-2">
          Visual Studio Code
        </span>
      </div>

      <div className="flex">
        <div className="w-56 bg-[#252526] border-r border-[#1e1e1e] p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">W</span>
            </div>
            <span className="text-sm text-white font-medium">WriteLogs</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-neutral-300">Tracking active</span>
            </div>

            <div className="bg-[#1e1e1e] rounded-lg p-3">
              <p className="text-xs text-neutral-400 mb-1">Session</p>
              <p className="text-lg text-white font-mono">2h 34m</p>
            </div>

            <div className="bg-[#1e1e1e] rounded-lg p-3">
              <p className="text-xs text-neutral-400 mb-1">Files</p>
              <p className="text-lg text-white font-mono">12</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 min-h-[250px] font-mono text-sm">
          <div className="text-neutral-500 text-xs mb-3">api/users.ts</div>
          <div className="space-y-1 text-neutral-400">
            <p>
              <span className="text-[#c586c0]">const</span>{" "}
              <span className="text-[#9cdcfe]">user</span> ={" "}
              <span className="text-[#c586c0]">await</span>{" "}
              <span className="text-[#dcdcaa]">createUser</span>(data)
            </p>
            <p>
              <span className="text-[#c586c0]">if</span> (!user){" "}
              <span className="text-[#c586c0]">throw</span>{" "}
              <span className="text-[#ce9178]">&quot;Failed&quot;</span>
            </p>
            <p>
              <span className="text-[#c586c0]">return</span>{" "}
              <span className="text-[#dcdcaa]">respond</span>(user)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-2xl border border-neutral-200">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 border-b border-neutral-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-neutral-300" />
          <div className="w-3 h-3 rounded-full bg-neutral-300" />
          <div className="w-3 h-3 rounded-full bg-neutral-300" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-white rounded px-3 py-1 text-xs text-neutral-500 max-w-xs">
            app.writelogs.dev
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="font-medium text-neutral-900">Today</h4>
            <p className="text-sm text-neutral-500">February 9, 2026</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-medium text-neutral-900">4h 12m</p>
            <p className="text-sm text-neutral-500">active</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-900 mb-1">
              Implemented user authentication flow
            </p>
            <p className="text-xs text-neutral-500">2h 15m · 8 files</p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-900 mb-1">
              Fixed pagination bug in dashboard
            </p>
            <p className="text-xs text-neutral-500">45m · 3 files</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivacyMockup() {
  return (
    <div className="bg-neutral-900 rounded-xl p-6 font-mono text-sm">
      <div className="text-neutral-500 mb-4">$ writelogs status</div>
      <div className="space-y-2 text-neutral-300">
        <p>
          <span className="text-green-400">✓</span> Code stays on your machine
        </p>
        <p>
          <span className="text-green-400">✓</span> Only diffs are processed
        </p>
        <p>
          <span className="text-green-400">✓</span> No keystrokes logged
        </p>
        <p>
          <span className="text-green-400">✓</span> Works fully offline
        </p>
      </div>
    </div>
  );
}
