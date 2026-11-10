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
import { BILLING_PATH } from "../_hooks/use-upgrade-toast";
import { useFeedbackMe } from "../dashboard/feedback/_hooks/use-feedback-me";
import { useBufferStatus } from "../dashboard/buffer/_hooks/use-buffer";
import { BufferMark } from "@/components/brand/buffer-mark";
import { ChannelStack } from "@/components/brand/channel-stack";

/**
 * Buffer's place in the header: the mark and the faces of the channels posts
 * go to once connected, a nudge to reconnect when the link has lapsed, and a
 * quiet way in when it was never set up.
 */
function BufferBadge() {
  const { data: status } = useBufferStatus();
  if (!status) return null;
  const channels = (status.channels ?? []).filter(
    (c) => !c.is_locked && !c.is_disconnected,
  );
  const picked = channels.filter((c) => status.channel_ids?.includes(c.id));
  const live = status.connected && !status.needs_reauth;
  const hint = !status.connected
    ? "Post your days to X, LinkedIn and more"
    : status.needs_reauth
      ? "Buffer needs you to sign in again"
      : `Buffer connected · posting to ${picked.length || channels.length} channel${(picked.length || channels.length) === 1 ? "" : "s"}`;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/buffer">
              <span className="relative">
                <BufferMark className="size-4" />
                {live && (
                  <span className="absolute -right-0.5 -bottom-0.5 size-1.5 rounded-full bg-foreground ring-2 ring-background" />
                )}
              </span>
              {live ? (
                <>
                  <span className="hidden sm:inline">Buffer</span>
                  <ChannelStack
                    channels={picked.length ? picked : channels}
                    size="size-5"
                    ring="ring-background"
                  />
                </>
              ) : status.connected ? (
                "Reconnect Buffer"
              ) : (
                <span className="hidden sm:inline">Connect Buffer</span>
              )}
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{hint}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Topbar() {
  const router = useRouter();
  const user = getStoredUser();
  const { theme, setTheme } = useTheme();
  const { data: billing } = useBilling();
  const { data: me } = useFeedbackMe();

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
          <BufferBadge />
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
            <DropdownMenuItem asChild>
              <Link href={BILLING_PATH}>
                Billing
                {billing && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {billing.plan === "pro" ? "Pro" : "Free"}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
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
            <DropdownMenuItem asChild>
              <Link href="/dashboard/buffer">Post with Buffer</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/feedback">Feedback</Link>
            </DropdownMenuItem>
            {me?.is_admin && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/creators">Creators</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href="/">Website</Link>
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
