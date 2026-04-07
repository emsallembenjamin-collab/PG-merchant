"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { goldpayApi } from "@/lib/goldpay-api";

export default function PayoutCreatePage() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("100000");
  const [banks, setBanks] = useState<Array<{ code: string; bank_name: string }>>(
    [],
  );
  const [selectedBankCode, setSelectedBankCode] = useState<string>("");
  /** Beneficiary bank account number (DPay `target_bank`). */
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBanks = async () => {
      setLoadingBanks(true);
      setError(null);
      try {
        const res = await goldpayApi.funding.vietnamBankCodes();
        if (cancelled) return;

        if (!res.data?.length) {
          setBanks([]);
          setSelectedBankCode("");
          setError(
            "No Vietnam bank codes configured. Ask the operator to seed vietnam_bank_codes.",
          );
          return;
        }
        const mapped = res.data.map((b) => ({
          code: String(b.code),
          bank_name: `${b.full_name} (${b.abbreviation})`,
        }));
        setBanks(mapped);
        setSelectedBankCode((prev) => prev || mapped[0]?.code || "");
      } catch (err) {
        if (cancelled) return;
        setBanks([]);
        setSelectedBankCode("");
        setError(err instanceof Error ? err.message : "Failed to load bank list");
      } finally {
        if (!cancelled) setLoadingBanks(false);
      }
    };

    loadBanks();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedBank = useMemo(
    () => banks.find((b) => b.code === selectedBankCode) ?? null,
    [banks, selectedBankCode],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const n = Number(amount);
    if (!amount || Number.isNaN(n) || n <= 0) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }

    if (!selectedBankCode) {
      setError("Please select a bank/channel.");
      return;
    }

    if (!accountNumber.trim()) {
      setError("Please enter the beneficiary bank account number.");
      return;
    }

    if (!accountName.trim()) {
      setError("Please enter the account holder name.");
      return;
    }

    if (!selectedBank) {
      setError("Selected bank is not available.");
      return;
    }

    setSubmitting(true);
    try {
      const bin = String(selectedBank.code);
      const resp = await goldpayApi.funding.createWithdrawal({
        amount: n,
        currency: "VND",
        metadata: {
          target_bank: accountNumber.trim(),
          /** Napas/BIN from `GET funding/vietnam-bank-codes` — DPay payout `bank_name`. */
          vietnam_bank_code: bin,
          bank_code: bin,
          bank_name: bin,
          target_bank_user: accountName.trim(),
          bank_display_name: selectedBank.bank_name,
        },
      });

      router.push(`/transactions/${resp.id}/payout`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create withdrawal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Payout URL" />
      <div className="merchant-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
          Create Withdrawal (DPay)
        </h3>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="merchant-label">Amount (VND)</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="merchant-input"
              disabled={loadingBanks || submitting}
            />
          </div>

          <div>
            <label className="merchant-label">Bank / Channel</label>
            <select
              value={selectedBankCode}
              onChange={(e) => setSelectedBankCode(e.target.value)}
              className="merchant-select"
              disabled={loadingBanks || submitting || banks.length === 0}
            >
              {banks.length === 0 && <option value="">No banks loaded</option>}
              {banks.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.bank_name} ({b.code})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-dark-6">
              Uses GoldPay <span className="font-mono">vietnam_bank_codes</span> (Napas/BIN), not DPay{" "}
              <span className="font-mono">bank_list</span> channel codes.
            </p>
          </div>

          <div>
            <label className="merchant-label">Beneficiary account number</label>
            <input
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="merchant-input"
              placeholder="e.g. bank account number to receive"
              disabled={loadingBanks || submitting}
              autoComplete="off"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="merchant-label">Account Holder Name</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="merchant-input"
              placeholder="e.g. Nguyen Van A"
              disabled={loadingBanks || submitting}
            />
          </div>

          <div className="flex items-end sm:col-span-2">
            <button
              type="submit"
              disabled={loadingBanks || submitting}
              className="merchant-button w-full rounded bg-primary px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Withdrawal"}
            </button>
          </div>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <p className="mt-4 text-sm text-dark-6">
          After creation, you will be redirected to the Payout page for the transaction.
        </p>

        {selectedBank && (
          <p className="mt-2 text-sm text-dark-6">
            Selected: {selectedBank.bank_name} ({selectedBank.code})
          </p>
        )}

        <Link
          href="/transactions"
          className="mt-4 inline-block font-semibold text-primary transition hover:opacity-80"
        >
          ← Back to Transactions
        </Link>
      </div>
    </>
  );
}

