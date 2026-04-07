"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  formatLedgerAmount,
  ledgerCurrencyBadge,
  normalizeIso4217Currency,
} from "@/lib/format-ledger";
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

function CurrencyBadge({ code }: { code: string | undefined }) {
  const iso = normalizeIso4217Currency(code);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        iso
          ? "border-[#E8DED0] bg-[#F5F0E8] text-[#5C5348] dark:border-dark-3 dark:bg-dark-2 dark:text-dark-5"
          : "border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100",
      )}
      title={iso ? undefined : "Currency code missing or invalid in data; amounts are still shown."}
    >
      {ledgerCurrencyBadge(code)}
    </span>
  );
}

/** Compact block for popover list (secondary currencies). */
function SecondaryLedgerBlock({ row }: { row: MerchantBalanceRow }) {
  return (
    <div className="rounded-xl border border-stroke/45 bg-[#FCFAF7] p-3 dark:border-dark-3/70 dark:bg-dark-2/90">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A7A61] dark:text-dark-6">
          Total
        </p>
        <CurrencyBadge code={row.currency} />
      </div>
      <p className="mt-1 text-lg font-bold tabular-nums tracking-tight text-dark dark:text-white">
        {formatLedgerAmount(row.balance_total, row.currency)}
      </p>
      <dl className="mt-2.5 grid grid-cols-2 gap-2 border-t border-stroke/35 pt-2.5 dark:border-dark-3/50">
        <div>
          <dt className="text-[9px] font-medium uppercase tracking-wide text-[#AEA39A] dark:text-dark-6">
            Available
          </dt>
          <dd className="mt-0.5 text-xs font-semibold tabular-nums text-dark dark:text-white">
            {formatLedgerAmount(row.balance_available, row.currency)}
          </dd>
        </div>
        <div>
          <dt className="text-[9px] font-medium uppercase tracking-wide text-[#AEA39A] dark:text-dark-6">
            Locked
          </dt>
          <dd className="mt-0.5 text-xs font-semibold tabular-nums text-dark dark:text-white">
            {formatLedgerAmount(row.balance_locked, row.currency)}
          </dd>
        </div>
      </dl>
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
    const c = flat.balance_currency;
    return (
      <div className="merchant-card min-w-[260px] max-w-[320px] px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A7A61] dark:text-dark-6">
            Total balance
          </p>
          <CurrencyBadge code={c} />
        </div>
        <p className="mt-1 text-[1.35rem] font-bold leading-tight tracking-tight text-dark tabular-nums dark:text-white">
          {formatLedgerAmount(flat.balance_total, c)}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-stroke/35 pt-3 dark:border-dark-3/50">
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wide text-[#AEA39A] dark:text-dark-6">
              Available
            </dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-dark dark:text-white">
              {formatLedgerAmount(flat.balance_available, c)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wide text-[#AEA39A] dark:text-dark-6">
              Locked
            </dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-dark dark:text-white">
              {formatLedgerAmount(flat.balance_locked, c)}
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  const { primary, others } = splitUsdPrimary(rows);

  return (
    <div className="relative z-40" ref={wrapRef}>
      <div className="merchant-card min-w-[260px] max-w-[320px] px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A7A61] dark:text-dark-6">
              Total balance
            </p>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
              <span className="text-[1.35rem] font-bold leading-none tracking-tight text-dark tabular-nums dark:text-white">
                {formatLedgerAmount(primary.balance_total, primary.currency)}
              </span>
              <CurrencyBadge code={primary.currency} />
            </div>
          </div>

          {others.length > 0 ? (
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-stroke/55 bg-white/80 px-2.5 py-1.5 text-[11px] font-semibold text-dark shadow-sm transition hover:border-primary/35 hover:bg-[#FFFCF7] dark:border-dark-3 dark:bg-dark-2/90 dark:text-white dark:hover:border-primary/40 dark:hover:bg-dark-2"
              aria-expanded={open}
              aria-haspopup="dialog"
              aria-controls="header-balance-popover"
              id="header-balance-more"
              title={`${others.length} more ${others.length === 1 ? "currency" : "currencies"}`}
              aria-label={`Show ${others.length} more ${others.length === 1 ? "currency" : "currencies"}`}
              onClick={() => setOpen((v) => !v)}
            >
              <span>
                +{others.length}
                <span className="ml-0.5 font-medium text-[#8A7A61] dark:text-dark-6">more</span>
              </span>
              <ChevronUpIcon
                className={cn("size-3.5 text-[#8A7A61] dark:text-dark-6", open ? "rotate-0" : "rotate-180")}
                aria-hidden
              />
            </button>
          ) : null}
        </div>

        {/* <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-stroke/35 pt-3 dark:border-dark-3/50">
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wide text-[#AEA39A] dark:text-dark-6">
              Available
            </dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-dark dark:text-white">
              {formatLedgerAmount(primary.balance_available, primary.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wide text-[#AEA39A] dark:text-dark-6">
              Locked
            </dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-dark dark:text-white">
              {formatLedgerAmount(primary.balance_locked, primary.currency)}
            </dd>
          </div>
        </dl> */}
      </div>

      {open && others.length > 0 ? (
        <div
          id="header-balance-popover"
          role="dialog"
          aria-label="Other currency balances"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-[min(100vw-2rem,20rem)] max-h-[min(70vh,22rem)] overflow-y-auto rounded-[20px] border border-stroke/50 bg-white/98 p-3 shadow-xl backdrop-blur-xl dark:border-dark-3/80 dark:bg-[#0B1524]/98"
        >
          <p className="mb-2 px-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A7A61] dark:text-dark-6">
            Other wallets
          </p>
          <div className="flex flex-col gap-2">
            {others.map((row, i) => (
              <SecondaryLedgerBlock key={`${row.currency}-${i}`} row={row} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
