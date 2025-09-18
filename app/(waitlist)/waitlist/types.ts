import { z } from "zod";
export enum ACCOUNT_TYPE {
  SOLO = "solo",
  ORG = "org",
}
export const waitlistPayload = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  accountType: z.enum(ACCOUNT_TYPE, {
    error: "Account type is required",
  }),
});

export type WaitlistPayload = z.infer<typeof waitlistPayload>;
