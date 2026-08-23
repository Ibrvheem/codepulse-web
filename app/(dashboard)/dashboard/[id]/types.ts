import { z } from "zod";

export const createKeyPayloadSchema = z.object({
  name: z.string().optional(),
});
export type CreateKeyPayload = z.infer<typeof createKeyPayloadSchema>;
