import { z } from "zod";

export const forgotPasswordPayloadSchema = z.object({
  email: z.email("Enter a valid email address"),
});
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordPayloadSchema>;

export const resetPasswordPayloadSchema = z
  .object({
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });
export type ResetPasswordPayload = z.infer<typeof resetPasswordPayloadSchema>;
