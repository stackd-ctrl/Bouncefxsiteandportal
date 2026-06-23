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

/** How the customer chose to pay now. */
export type PaymentChoice = "deposit" | "full" | "custom";

/**
 * Amount to charge now given the order total and the customer's choice.
 * A custom (partial) amount is clamped between the minimum deposit and the
 * full total. Always recompute this server-side — never trust the client.
 */
export function amountDueNow(
  total: number,
  choice: PaymentChoice,
  custom?: number
): number {
  const min = depositFor(total);
  if (choice === "full") return total;
  if (choice === "custom") {
    const c = Number.isFinite(custom) ? (custom as number) : min;
    return Math.round(Math.min(Math.max(c, min), total) * 100) / 100;
  }
  return min;
}

/** Human label for how much of the total has been paid. */
export function paymentLabel(total: number, paid: number): string {
  if (paid >= total) return "Paid in full";
  if (paid <= depositFor(total)) return "Deposit";
  return "Partial payment";
}
