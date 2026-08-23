import { z } from "zod";

export const signinPayloadSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
export type SigninPayload = z.infer<typeof signinPayloadSchema>;
