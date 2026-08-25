"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

/** Strong ease-out — matches --ease-out-strong in globals.css. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

/**
 * Staggered entrance for grids and lists: 60ms per item, fade + 12px rise.
 * Items mounting later (pagination, polling) animate in on their own.
 * Reduced motion keeps the fade and drops the movement.
 */
export function StaggerReveal({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "ul";
}) {
  const Component = as === "ul" ? motion.ul : motion.div;
  return (
    <Component
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduceMotion = useReducedMotion();
  const item: Variants = {
    hidden: { opacity: 0, transform: reduceMotion ? "none" : "translateY(12px)" },
    show: {
      opacity: 1,
      transform: "translateY(0px)",
      transition: { duration: 0.3, ease: EASE_OUT },
    },
  };
  const Component = as === "li" ? motion.li : motion.div;
  return (
    <Component variants={item} className={className}>
      {children}
    </Component>
  );
}
