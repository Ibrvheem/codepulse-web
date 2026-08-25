"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isUpgradeRequired } from "@/lib/api-client";

export const BILLING_PATH = "/dashboard/billing";

/** An upgrade prompt: a message plus an Upgrade action that goes to billing. */
export function useUpgradePrompt() {
  const router = useRouter();
  return (message: string) => {
    toast(message, {
      action: { label: "Upgrade", onClick: () => router.push(BILLING_PATH) },
      duration: 8000,
    });
  };
}

/**
 * Turns a 402 into an upgrade prompt using the API's own message. Returns
 * false for any other error so callers can fall through.
 */
export function useUpgradeToast() {
  const prompt = useUpgradePrompt();
  return (error: unknown): boolean => {
    if (!isUpgradeRequired(error)) return false;
    prompt(error.message);
    return true;
  };
}
