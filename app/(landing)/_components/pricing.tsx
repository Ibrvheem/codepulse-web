"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function PricingSection() {
  return (
    <section id="pricing" className="py-28 lg:py-40">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 leading-[1.08] tracking-[-0.03em] mb-6">
            Free during beta.
          </h2>
          <p className="text-xl text-neutral-500 max-w-xl mx-auto mb-12">
            Join now. When we launch paid plans, you keep Pro for life.
          </p>

          <Link href="/waitlist">
            <Button
              size="lg"
              className="bg-neutral-900 hover:bg-neutral-800 text-white h-14 px-8 text-base rounded-full"
            >
              Get early access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <p className="mt-10 text-sm text-neutral-400">
            No credit card. No setup. Just install the extension.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
