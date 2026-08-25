import type { FoundingSeats } from "../types";

export type FoundingMessage =
  | { kind: "open"; left: number; total: number }
  | { kind: "gone" };

/**
 * "0 left" is a dead number — when the seats are gone the message flips to
 * the trial instead of counting down to nothing.
 */
export function foundingMessage(seats: FoundingSeats | null): FoundingMessage | null {
  if (!seats) return null;
  if (seats.left <= 0) return { kind: "gone" };
  return { kind: "open", left: seats.left, total: seats.total };
}
