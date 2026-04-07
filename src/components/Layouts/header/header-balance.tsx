"use client";

import { ChevronUpIcon } from "@/assets/icons";
import { formatLedgerAmount } from "@/lib/format-ledger";
import type { MerchantBalanceRow } from "@/lib/goldpay-api";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";

function splitUsdPrimary(rows: MerchantBalanceRow[]): {
  primary: MerchantBalanceRow;
  others: MerchantBalanceRow[];
} {
  const usdIdx = rows.findIndex((r) => (r.currency || "").toUpperCase() === "USD");
  if (usdIdx >= 0) {
    const primary = rows[usdIdx];
    const others = rows.filter((_, i) => i !== usdIdx);
    return { primary, others };
  }
  const [first, ...rest] = rows;
  return { primary: first, others: rest };
}

function LedgerRow({ row }: { row: MerchantBalanceRow }) {
  const code = (row.currency || "USD").toUpperCase();
  return (
    <div className="flex flex-col gap-0.5 border-b border-stroke/40 pb-2 last:border-0 last:pb-0 dark:border-dark-3/60">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-6 dark:text-dark-6">
          {code} total
        </p>
        <p className="shrink-0 text-[15px] font-bold tracking-[-0.03em] text-dark dark:text-white">
          {formatLedgerAmount(row.balance_total, row.currency)}
        </p>
      </div>
      <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-[11px] text-gray-6 dark:text-dark-6">
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
  );
}

type FlatBalances = {
  balance_currency?: string;
  balance_available?: number;
  balance_locked?: number;
  balance_total?: number;
};

export function HeaderBalanceCard({
  balances,
  ...flat
}: {
  balances?: MerchantBalanceRow[];
} & FlatBalances) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => balances?.filter(Boolean) ?? [], [balances]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (rows.length === 0) {
    const c = flat.balance_currency || "USD";
    return (
      <div className="merchant-card flex min-w-[290px] max-w-md flex-col gap-2 px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-6 dark:text-dark-6">
            Total balance
          </p>
          <p className="shrink-0 text-[15px] font-bold tracking-[-0.03em] text-dark dark:text-white">
            {formatLedgerAmount(flat.balance_total, c)}
          </p>
        </div>
        <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-[11px] text-gray-6 dark:text-dark-6">
          <span>
            Avail{" "}
            <span className="font-semibold text-dark dark:text-dark-5">
              {formatLedgerAmount(flat.balance_available, c)}
            </span>
          </span>
          <span>
            Locked{" "}
            <span className="font-semibold text-dark dark:text-dark-5">
              {formatLedgerAmount(flat.balance_locked, c)}
            </span>
          </span>
        </div>
      </div>
    );
  }

  const { primary, others } = splitUsdPrimary(rows);

  return (
    <div className="relative z-40" ref={wrapRef}>
      <div className="merchant-card flex min-w-[290px] max-w-md flex-col gap-2 px-4 py-2.5">
        <LedgerRow row={primary} />

        {others.length > 0 ? (
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg py-1 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-6 transition hover:bg-black/[0.03] dark:text-dark-6 dark:hover:bg-white/[0.04]"
            aria-expanded={open}
            aria-haspopup="true"
            aria-controls="header-balance-other-currencies"
            id="header-balance-toggle"
            onClick={() => setOpen((v) => !v)}
          >
            <span>Other currencies ({others.length})</span>
            <ChevronUpIcon
              className={cn("ml-auto size-4 shrink-0 transition-transform", open ? "rotate-0" : "rotate-180")}
              aria-hidden
            />
          </button>
        ) : null}
      </div>

      {open && others.length > 0 ? (
        <div
          id="header-balance-other-currencies"
          role="region"
          aria-labelledby="header-balance-toggle"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[min(70vh,24rem)] overflow-y-auto rounded-[20px] border border-stroke/50 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-xl dark:border-dark-3/80 dark:bg-[#08111F]/95"
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-6 dark:text-dark-6">
            Additional balances
          </p>
          <div className="flex flex-col gap-2">
            {others.map((row) => (
              <LedgerRow key={row.currency} row={row} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
