"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { Heart } from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { auth, getStoredUser } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBilling } from "../_hooks/use-billing";

export function Topbar() {
  const router = useRouter();
  const user = getStoredUser();
  const { theme, setTheme } = useTheme();
  const { data: billing } = useBilling();

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
          className="flex items-center gap-2.5 font-semibold tracking-tight text-lg text-foreground"
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
        <div className="flex items-center gap-1.5">
          {billing?.founding_member && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Loggy's purple — a quiet thank-you to founding members. */}
                  <span
                    className="p-1.5 cursor-default"
                    aria-label="Founding member"
                  >
                    <Heart className="size-4 fill-current text-[#7446D8] dark:text-[#A98AEF]" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Founding member</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
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
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={theme ?? "system"}
                  onValueChange={setTheme}
                >
                  <DropdownMenuRadioItem value="light">
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/extension">Install the extension</Link>
            </DropdownMenuItem>
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
