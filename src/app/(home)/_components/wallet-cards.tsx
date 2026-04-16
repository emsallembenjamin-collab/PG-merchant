"use client";

import { useAuth } from "@/contexts/auth-context";
import { formatLedgerAmount, ledgerCurrencyBadge } from "@/lib/format-ledger";
import Link from "next/link";

function toRows(user: ReturnType<typeof useAuth>["user"]) {
  if (!user) return [];
  if (Array.isArray(user.balances) && user.balances.length > 0) {
    return [...user.balances].sort((a, b) =>
      (a.currency || "").localeCompare(b.currency || ""),
    );
  }
  return [
    {
      currency: user.balance_currency || "USD",
      balance_available: user.balance_available ?? 0,
      balance_locked: user.balance_locked ?? 0,
      balance_total: user.balance_total ?? 0,
    },
  ];
}

export function WalletCards() {
  const { user } = useAuth();
  const rows = toRows(user);

  if (rows.length === 0) return null;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row, index) => (
        <article key={`${row.currency}-${index}`} className="merchant-card p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8A7A61] dark:text-dark-6">
              {ledgerCurrencyBadge(row.currency)}
            </p>
            <span className="merchant-status-pill merchant-status-pill-success">
              Active
            </span>
          </div>

          <p className="mt-3 text-3xl font-bold tracking-tight text-dark dark:text-white">
            {formatLedgerAmount(row.balance_total, row.currency)}
          </p>

          <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-stroke/40 pt-3 dark:border-dark-3/50">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[#AEA39A] dark:text-dark-6">
                Available
              </dt>
              <dd className="mt-1 text-sm font-semibold text-dark dark:text-white">
                {formatLedgerAmount(row.balance_available, row.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[#AEA39A] dark:text-dark-6">
                Locked
              </dt>
              <dd className="mt-1 text-sm font-semibold text-dark dark:text-white">
                {formatLedgerAmount(row.balance_locked, row.currency)}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/transactions/payin"
              className="merchant-primary-button px-4 py-2 text-sm"
            >
              Deposit
            </Link>
            <Link
              href="/transactions/payout"
              className="merchant-secondary-button px-4 py-2 text-sm"
            >
              Withdraw
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}
