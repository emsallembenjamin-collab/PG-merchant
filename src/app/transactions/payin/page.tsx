"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { goldpayApi } from "@/lib/goldpay-api";

const PAY_TYPES: Array<{ label: string; value: number }> = [
  { label: "bankQR (7)", value: 7 },
  { label: "momo (8)", value: 8 },
  { label: "banktransfer (9)", value: 9 },
  { label: "MomoToBank (6)", value: 6 },
  { label: "ZaloToBank (5)", value: 5 },
  { label: "VietteToBank (4)", value: 4 },
];

export default function PayinCreatePage() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("100000");
  const [payType, setPayType] = useState<number>(7);
  const [banks, setBanks] = useState<Array<{ code: string; bank_name: string }>>(
    [],
  );
  const [selectedBankCode, setSelectedBankCode] = useState<string>("");
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedBank = useMemo(
    () => banks.find((b) => b.code === selectedBankCode) ?? null,
    [banks, selectedBankCode],
  );

  useEffect(() => {
    let cancelled = false;
    const loadBanks = async () => {
      setLoadingBanks(true);
      setError(null);
      try {
        const res = await goldpayApi.funding.bankList({ pay_type: payType });
        if (cancelled) return;

        if (res.success) {
          const mapped = res.data.map((b) => ({
            code: String(b.code),
            bank_name: String(b.bank_name),
          }));
          setBanks(mapped);
          setSelectedBankCode((prev) => prev || mapped[0]?.code || "");
        } else {
          const msg = res.provider_error?.message || "Failed to load bank list";
          setBanks([]);
          setSelectedBankCode("");
          setError(msg);
        }
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
  }, [payType]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const n = Number(amount);
    if (!amount || Number.isNaN(n) || n <= 0) {
      setError("Please enter a valid deposit amount.");
      return;
    }

    if (!selectedBankCode) {
      setError("Please select a bank/channel.");
      return;
    }

    setSubmitting(true);
    try {
      const resp = await goldpayApi.funding.createDeposit({
        amount: n,
        currency: "VND",
        metadata: {
          pay_type: payType,
          bank_code: selectedBankCode,
        },
      });

      router.push(`/transactions/${resp.id}/payin`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deposit");
    } finally {
      setSubmitting(false);
    }
  };

  const bankOptionsDisabled = loadingBanks || submitting;

  return (
    <>
      <Breadcrumb pageName="Payin URL" />
      <div className="merchant-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
          Create Deposit (DPay)
        </h3>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="merchant-label">Amount (VND)</label>
            <input
              type="number"
              min={1}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="merchant-input"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="merchant-label">Pay Type</label>
            <select
              value={payType}
              onChange={(e) => setPayType(Number(e.target.value))}
              className="merchant-select"
              disabled={submitting}
            >
              {PAY_TYPES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="merchant-label">Bank / Channel</label>
            <select
              value={selectedBankCode}
              onChange={(e) => setSelectedBankCode(e.target.value)}
              className="merchant-select"
              disabled={bankOptionsDisabled || banks.length === 0}
            >
              {banks.length === 0 && (
                <option value="">No banks loaded</option>
              )}
              {banks.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.bank_name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting || bankOptionsDisabled}
              className="merchant-button w-full rounded bg-primary px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Deposit"}
            </button>
          </div>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <p className="mt-4 text-sm text-dark-6">
          After creation, you will be redirected to the Payin page for the transaction.
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

