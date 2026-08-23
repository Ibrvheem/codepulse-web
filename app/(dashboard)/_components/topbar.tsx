"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { APP_NAME } from "@/lib/config";
import { auth, getStoredUser } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";

export function Topbar() {
  const router = useRouter();
  const user = getStoredUser();

  const logout = useMutation({
    mutationFn: auth.logout,
    onSettled: () => router.replace("/signin"),
  });

  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <Image
            src="/loggy/loggy-head.png"
            alt=""
            width={26}
            height={27}
            priority
          />
          {APP_NAME}
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Account menu"
              >
                <span className="size-7 rounded-full bg-secondary text-secondary-foreground text-xs font-medium flex items-center justify-center">
                  {initials}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium truncate">
                  {user?.full_name ?? "Account"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={logout.isPending}
                onSelect={() => logout.mutate()}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
