import { foundingSeatsSchema, type FoundingSeats } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9308";

/**
 * Public founding-member seat counts for the marketing page. Fetched on the
 * server and cached for 60s (Next data cache), so visitors never hit the API
 * directly. Any failure returns null and the page renders without the
 * counter — urgency copy is never worth blocking the hero for.
 */
export async function getFoundingSeats(): Promise<FoundingSeats | null> {
  try {
    const res = await fetch(`${API_URL}/billing/founding-seats`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { success?: boolean; data?: unknown };
    if (!body.success) return null;
    return foundingSeatsSchema.parse(body.data);
  } catch {
    return null;
  }
}
