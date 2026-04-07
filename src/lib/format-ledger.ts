/** Format an internal ledger amount for display (ISO 4217 currency). */
export function formatLedgerAmount(
  amount: number | undefined,
  currency: string | undefined,
): string {
  const c = (currency || "USD").toUpperCase();
  const n = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: c,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${c}`;
  }
}
