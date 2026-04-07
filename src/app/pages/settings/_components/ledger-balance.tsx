"use client";

import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { useAuth } from "@/contexts/auth-context";
import { formatLedgerAmount } from "@/lib/format-ledger";

export function LedgerBalanceSection() {
  const { user } = useAuth();
  const rows = user?.balances?.filter(Boolean) ?? [];

  return (
    <ShowcaseSection title="Account balance" className="!p-7">
      <p className="mb-4 text-sm text-dark-6">
        Internal ledger held on the platform (per currency). Updates when you refresh the session or reload
        the portal.
      </p>

      {rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.currency}
              className="rounded-[20px] border border-[#E8DED0] bg-[#FCFAF7] p-4 dark:border-dark-3 dark:bg-dark-2"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                {row.currency}
              </p>
              <p className="mt-2 text-lg font-bold text-dark dark:text-white">
                {formatLedgerAmount(row.balance_total, row.currency)}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-dark-6">
                <span>
                  Avail{" "}
                  <span className="font-semibold text-dark dark:text-dark-5">
                    {formatLedgerAmount(row.balance_available, row.currency)}
                  </span>
                </span>
                <span>
                  Locked{" "}
                  <span className="font-semibold text-dark dark:text-dark-5">
                    {formatLedgerAmount(row.balance_locked, row.currency)}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[20px] border border-[#E8DED0] bg-[#FCFAF7] p-4 dark:border-dark-3 dark:bg-dark-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
            {user?.balance_currency ?? "USD"} (summary)
          </p>
          <p className="mt-2 text-lg font-bold text-dark dark:text-white">
            {formatLedgerAmount(user?.balance_total, user?.balance_currency)}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-dark-6">
            <span>
              Avail{" "}
              <span className="font-semibold text-dark dark:text-dark-5">
                {formatLedgerAmount(user?.balance_available, user?.balance_currency)}
              </span>
            </span>
            <span>
              Locked{" "}
              <span className="font-semibold text-dark dark:text-dark-5">
                {formatLedgerAmount(user?.balance_locked, user?.balance_currency)}
              </span>
            </span>
          </div>
        </div>
      )}
    </ShowcaseSection>
  );
}
