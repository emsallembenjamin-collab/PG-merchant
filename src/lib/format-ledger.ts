/** Returns uppercase ISO 4217 code when valid; otherwise null. */
export function normalizeIso4217Currency(raw: string | undefined): string | null {
  const t = (raw ?? "").trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(t)) return t;
  return null;
}

/**
 * Short label for badges (never shows junk like numeric-only "currency" from bad data).
 */
export function ledgerCurrencyBadge(raw: string | undefined): string {
  const iso = normalizeIso4217Currency(raw);
  if (iso) return iso;
  return "Ledger";
}

/** Format amount for a ledger row. Uses currency style only for valid ISO 4217 codes. */
export function formatLedgerAmount(
  amount: number | undefined,
  currency: string | undefined,
): string {
  const n = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  const iso = normalizeIso4217Currency(currency);
  if (iso) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: iso,
        maximumFractionDigits: 2,
      }).format(n);
    } catch {
      // Invalid for this runtime; fall through to decimal
    }
  }
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
