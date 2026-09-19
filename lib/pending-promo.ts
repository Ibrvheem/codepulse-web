/**
 * A promo code the visitor opened but hasn't claimed yet. The promo page saves
 * it; the dashboard claims it after sign-up or sign-in, whichever route they
 * took (email, Google, GitHub), so no redirect needs to carry it.
 */
const KEY = "writelogs.pending-promo";

export function savePendingPromo(code: string) {
  try {
    window.localStorage.setItem(KEY, code);
  } catch {
    // storage blocked: the promo page's Claim button still works once signed in
  }
}

/** Reads and forgets the pending code, so it's claimed at most once. */
export function takePendingPromo(): string | null {
  try {
    const code = window.localStorage.getItem(KEY);
    window.localStorage.removeItem(KEY);
    return code;
  } catch {
    return null;
  }
}

export function hasPendingPromo(): boolean {
  try {
    return window.localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}
