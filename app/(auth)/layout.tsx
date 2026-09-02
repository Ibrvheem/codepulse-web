import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { EditorIconStrip } from "@/components/editor-links";

// Auth pages have no search value; keep them out of the index.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      <header className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-lg text-foreground"
        >
          <Image
            src="/loggy/loggy-head.png"
            alt=""
            width={34}
            height={35}
            priority
          />
          {APP_NAME}
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
        <div className="w-full max-w-sm">{children}</div>
        <div className="mt-14">
          <EditorIconStrip />
        </div>
      </main>
    </div>
  );
}
