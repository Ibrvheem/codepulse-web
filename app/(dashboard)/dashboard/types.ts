import { z } from "zod";

export const TaskSchema = z.object({
    id: z.string(),
    task: z.string(),
    files: z.array(z.string()),
    description: z.string(),
    time_minutes_estimate: z.number(),
    tags: z.array(z.string()),
    confidence: z.number(),
    createdAt: z.string(),
    workLogSummaryId: z.string(),
});

export const RawLogSchema = z.object({
    id: z.string(),
    createdAt: z.string(),
});

export const WorkLogSummarySchema = z.object({
    id: z.string(),
    message: z.string(),
    logsCount: z.number(),
    createdAt: z.string(),
    userId: z.string(),
    tasks: z.array(TaskSchema),
    rawLogs: z.array(RawLogSchema),
});

export const SummariesResponseSchema = z.array(WorkLogSummarySchema);

export type Task = z.infer<typeof TaskSchema>;
export type RawLog = z.infer<typeof RawLogSchema>;
export type WorkLogSummary = z.infer<typeof WorkLogSummarySchema>;
export type SummariesResponse = z.infer<typeof SummariesResponseSchema>;
