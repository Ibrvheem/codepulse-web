import Image from "next/image";
import Link from "next/link";

// Legal pages are always light, like the landing page they belong to.
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-white text-neutral-900">
      <header className="border-b border-neutral-100">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight"
          >
            <Image src="/loggy/loggy-head.png" alt="" width={28} height={29} />
            WriteLogs
          </Link>
          <nav className="flex items-center gap-5 text-sm text-neutral-500">
            <Link href="/terms" className="hover:text-neutral-900">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-neutral-900">
              Privacy
            </Link>
            <Link href="/refunds" className="hover:text-neutral-900">
              Refunds
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-14">{children}</main>
      <footer className="border-t border-neutral-100">
        <div className="max-w-2xl mx-auto px-6 py-8 text-xs text-neutral-400">
          © {new Date().getFullYear()} WriteLogs ·{" "}
          <a href="mailto:i.aliyu019@gmail.com" className="underline underline-offset-2">
            i.aliyu019@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}
