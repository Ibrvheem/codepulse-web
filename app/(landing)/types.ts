import { z } from "zod";

export const foundingSeatsSchema = z.object({
  total: z.number().int().nonnegative(),
  claimed: z.number().int().nonnegative(),
  left: z.number().int().nonnegative(),
});
export type FoundingSeats = z.infer<typeof foundingSeatsSchema>;

/** A question and answer pair, rendered on the marketing pages and emitted as FAQPage structured data. */
export type Faq = { q: string; a: string };
