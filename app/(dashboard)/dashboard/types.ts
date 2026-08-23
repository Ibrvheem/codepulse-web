import { z } from "zod";

export const createProjectPayloadSchema = z.object({
  name: z.string().min(2, "Give the project a name"),
  timezone: z.string().min(1, "Pick a timezone"),
});
export type CreateProjectPayload = z.infer<typeof createProjectPayloadSchema>;
