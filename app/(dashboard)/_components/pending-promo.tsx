"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "sonner";
import { billing } from "@/lib/api-client";
import { takePendingPromo } from "@/lib/pending-promo";
import { BILLING_KEY } from "../_hooks/use-billing";

/**
 * Claims a promo link the visitor opened before signing up or in (see
 * lib/pending-promo). Runs once per dashboard load and renders nothing.
 */
export function PendingPromo() {
  const queryClient = useQueryClient();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const code = takePendingPromo();
    if (!code) return;
    billing
      .redeemPromo(code)
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: BILLING_KEY });
        toast.success(
          `Your free Pro is on, until ${dayjs(res.trial_ends_at).format("MMM D")}.`,
        );
      })
      .catch((error: Error) => toast.error(error.message));
  }, [queryClient]);

  return null;
}
