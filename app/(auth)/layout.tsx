import Link from "next/link";
import { APP_NAME } from "@/lib/config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      <header className="p-6">
        <Link href="/" className="font-semibold tracking-tight text-foreground">
          {APP_NAME}
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-24">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
