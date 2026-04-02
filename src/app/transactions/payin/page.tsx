"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PayinRedirectPage() {
  const router = useRouter();
  const [transactionId, setTransactionId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const n = Number(transactionId);
    if (!transactionId || Number.isNaN(n) || n <= 0) {
      setError("Please enter a valid transaction id.");
      return;
    }

    router.push(`/transactions/${n}/payin`);
  };

  return (
    <>
      <Breadcrumb pageName="Payin URL" />
      <div className="merchant-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
          View Payin URL for Transaction
        </h3>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="merchant-label">Transaction ID</label>
            <input
              type="number"
              min={1}
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="merchant-input"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="merchant-button w-full rounded bg-primary px-4 py-2 font-semibold text-white transition hover:opacity-90"
            >
              Open Payin Page
            </button>
          </div>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <p className="mt-4 text-sm text-dark-6">
          You can also open it directly from any transaction details page.
        </p>

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

