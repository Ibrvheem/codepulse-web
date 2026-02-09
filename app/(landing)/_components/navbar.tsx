"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled ? "bg-white/90 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="text-neutral-900 font-medium">
            WriteLogs
          </Link>

          {/* Desktop Nav - centered */}
          <div className="hidden md:flex items-center gap-8 text-[15px]">
            <a
              href="#how-it-works"
              className="text-neutral-500 hover:text-neutral-900"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="text-neutral-500 hover:text-neutral-900"
            >
              Pricing
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-6 text-[15px]">
            <Link
              href="/signin"
              className="text-neutral-500 hover:text-neutral-900 hidden"
            >
              Sign in
            </Link>
            <Link
              href="/waitlist"
              className="text-neutral-900 font-medium hover:opacity-70"
            >
              Get access →
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 -mr-2 text-neutral-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden absolute inset-x-0 top-14 bg-white border-b border-neutral-200"
          >
            <div className="px-6 py-6 space-y-5">
              <a
                href="#how-it-works"
                className="block text-neutral-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How it works
              </a>
              <a
                href="#pricing"
                className="block text-neutral-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <div className="pt-4 border-t border-neutral-100 space-y-4">
                <Link href="/signin" className="block text-neutral-600 hidden">
                  Sign in
                </Link>
                <Link
                  href="/waitlist"
                  className="block text-neutral-900 font-medium"
                >
                  Get access →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
