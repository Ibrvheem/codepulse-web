"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signupPayload } from "../types";
import { signUp } from "../service";
import { toast } from "sonner";

export function useSignUpForm() {
  const form = useForm({
    resolver: zodResolver(signupPayload),
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await signUp(values);
      console.log("Signup response:", response); // Log the full response for debugging

      if (
        (response.status === 200 || response.status === 201) &&
        response.access_token
      ) {
        toast.success("Account created successfully");
        window.location.href = "/dashboard";
        console.log("Signup response:", response); // Log the full response for debugging
        return response;
      } else {
        toast.error(
          response.message || response.error || "Failed to create account",
        );
        return response;
      }
    } catch (error: any) {
      toast.error(
        error.message || error.error || error || "Something went wrong",
      );
      return error;
    }
  });

  return {
    form,
    onSubmit,
    isSubmitting,
  };
}
