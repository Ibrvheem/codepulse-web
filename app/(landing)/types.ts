import { z } from "zod";

export const foundingSeatsSchema = z.object({
  total: z.number().int().nonnegative(),
  claimed: z.number().int().nonnegative(),
  left: z.number().int().nonnegative(),
});
export type FoundingSeats = z.infer<typeof foundingSeatsSchema>;
