/**
 * Booking deposit policy. The deposit is a flat amount (not a percentage) that
 * confirms the date; the remaining balance is due on the day of the event.
 */

/** Flat deposit charged at booking, in USD. */
export const DEPOSIT_FLAT = 50;

/**
 * Deposit due now for a given order total. Flat $50, but never more than the
 * order total itself (so a small order can't owe more deposit than it costs).
 */
export function depositFor(total: number): number {
  return Math.round(Math.min(DEPOSIT_FLAT, total) * 100) / 100;
}
