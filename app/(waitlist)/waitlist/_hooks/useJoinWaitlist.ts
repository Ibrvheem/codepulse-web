"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { waitlistPayload } from "../types";
import { joinWaitlist } from "../service";
import { useState } from "react";
import { toast } from "sonner";

export function useJoinWaitlist() {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(waitlistPayload),
  });
  const {
    handleSubmit,
    formState: { isSubmitSuccessful, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await joinWaitlist(data);
      if (response.ok) {
        toast.success(response.message);
        setOpen(true);
      } else {
        toast.error(response.error);
        form.setError("root", { type: "manual", message: response.error });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  });

  return {
    form,
    onSubmit,
    isSubmitSuccessful,
    isSubmitting,
    open,
    setOpen,
  };
}
