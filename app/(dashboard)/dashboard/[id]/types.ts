import { z } from "zod";

export const createKeyPayloadSchema = z.object({
  name: z.string().optional(),
});
export type CreateKeyPayload = z.infer<typeof createKeyPayloadSchema>;

/** Day keys are "YYYY-MM-DD", so string comparison is date comparison. */
export const createRecapPayloadSchema = z
  .object({
    start_date: z.string().min(1, "Pick the first day"),
    end_date: z.string().min(1, "Pick the last day"),
  })
  .refine((range) => range.end_date >= range.start_date, {
    message: "The last day comes before the first one",
    path: ["end_date"],
  })
  .refine((range) => range.end_date !== range.start_date, {
    message: "A recap covers at least two days",
    path: ["end_date"],
  });
export type CreateRecapPayload = z.infer<typeof createRecapPayloadSchema>;
