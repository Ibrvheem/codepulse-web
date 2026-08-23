import { z } from "zod";

export const signupPayloadSchema = z.object({
  full_name: z.string().min(2, "Enter your name"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type SignupPayload = z.infer<typeof signupPayloadSchema>;
