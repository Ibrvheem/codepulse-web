"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, billing } from "@/lib/api-client";
import type { BillingCheckout } from "@/lib/types";
import { openCheckout } from "../../../_lib/paddle";
import { BILLING_KEY } from "../../../_hooks/use-billing";

const CELEBRATE_KEY = [...BILLING_KEY, "celebrate"];

/**
 * Checkout config. A 400 means billing isn't configured in this environment —
 * callers hide the upgrade buttons rather than surfacing an error.
 */
export function useCheckoutConfig() {
  const query = useQuery({
    queryKey: [...BILLING_KEY, "checkout"],
    queryFn: billing.checkout,
    retry: false,
    staleTime: 5 * 60_000,
  });
  const notConfigured =
    query.isError && query.error instanceof ApiError && query.error.status === 400;
  return { ...query, notConfigured };
}

export function useOpenCheckout(config: BillingCheckout | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (priceId: string) => {
      if (!config) throw new Error("Checkout isn't ready yet.");
      await openCheckout(config, priceId, (event) => {
        if (event === "checkout.completed") {
          // Payment went through — celebrate now; the plan card catches up
          // when the webhook lands.
          queryClient.setQueryData(CELEBRATE_KEY, true);
        }
        // The webhook flips the plan within seconds of the overlay closing:
        // refetch now and once more shortly after.
        queryClient.invalidateQueries({ queryKey: BILLING_KEY });
        setTimeout(
          () => queryClient.invalidateQueries({ queryKey: BILLING_KEY }),
          5_000,
        );
      });
    },
    onError: (error) => toast.error(error.message),
  });
}

/** One-time "Welcome to Pro" moment, set when a checkout completes. */
export function useProCelebration() {
  const queryClient = useQueryClient();
  const { data } = useQuery<boolean>({ queryKey: CELEBRATE_KEY, enabled: false });
  return {
    celebrating: data === true,
    dismiss: () => queryClient.setQueryData(CELEBRATE_KEY, false),
  };
}

export function useBillingPortal() {
  return useMutation({
    mutationFn: billing.portal,
    onSuccess: (url) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: (error) => toast.error(error.message),
  });
}
