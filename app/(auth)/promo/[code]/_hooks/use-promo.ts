"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { billing } from "@/lib/api-client";
import { BILLING_KEY } from "@/app/(dashboard)/_hooks/use-billing";

export function usePromo(code: string) {
  return useQuery({
    queryKey: ["promo", code.toUpperCase()],
    queryFn: () => billing.promo(code),
    retry: false,
  });
}

export function useClaimPromo(code: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => billing.redeemPromo(code),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEY });
      toast.success(`You're on Pro until ${dayjs(res.trial_ends_at).format("MMM D")}.`);
      router.push("/dashboard");
    },
    onError: (error) => toast.error(error.message),
  });
}
