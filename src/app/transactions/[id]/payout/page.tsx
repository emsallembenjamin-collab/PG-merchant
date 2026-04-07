"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { goldpayApi } from "@/lib/goldpay-api";
import type { TransactionDetails } from "@/lib/goldpay-api";

function normalizeObject(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === "object") return value as Record<string, unknown>;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

export default function PayoutUrlPage() {
  const params = useParams();
  const id = Number(params.id);

  const [tx, setTx] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || Number.isNaN(id)) return;
    goldpayApi.transactions
      .getMine(id)
      .then(setTx)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const metadata = useMemo(() => normalizeObject(tx?.metadata), [tx?.metadata]);
  const providerError = tx?.provider_error ?? null;

  if (loading && !tx) {
    return (
      <>
        <Breadcrumb pageName="Payout URL" />
        <div className="merchant-card p-8">
          <p className="text-dark-6">Loading...</p>
        </div>
      </>
    );
  }

  if (error && !tx) {
    return (
      <>
        <Breadcrumb pageName="Payout URL" />
        <div className="merchant-card p-8">
          <p className="text-red-500">{error}</p>
          <Link
            href="/transactions"
            className="mt-4 inline-block font-semibold text-primary transition hover:opacity-80"
          >
            Back to Transactions
          </Link>
        </div>
      </>
    );
  }

  if (!tx) return null;
  if (tx.type !== "withdrawal") {
    return (
      <>
        <Breadcrumb pageName={`Payout URL for #${tx.id}`} />
        <div className="merchant-card p-6">
          <p className="text-red-500">This transaction is not a withdrawal.</p>
          <div className="mt-4">
            <Link href={`/transactions/${tx.id}`} className="font-semibold text-primary transition hover:opacity-80">
              Back to Transaction
            </Link>
          </div>
        </div>
      </>
    );
  }

  const bankName =
    metadata?.bank_display_name ?? metadata?.bank_name ?? metadata?.target_bank_name ?? null;
  const bankNumber = metadata?.bank_number ?? metadata?.target_bank ?? null;
  const bankUser = metadata?.bank_user ?? metadata?.target_bank_user ?? null;
  const orderDate = metadata?.order_date ?? metadata?.order_time ?? null;
  const merchantOrder = metadata?.merchant_order ?? metadata?.withdrawal_order ?? null;
  const serialNumber = metadata?.serial_number ?? null;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb pageName={`Payout URL for #${tx.id}`} />
        </div>
        <Link href={`/transactions/${tx.id}`} className="font-semibold text-primary transition hover:opacity-80">
          ← Back to Transaction
        </Link>
      </div>

      <div className="space-y-6">
        <div className="merchant-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
            Payout / Withdrawal Details
          </h3>

          {providerError && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="font-semibold">Provider error</div>
              <div>
                Code: {providerError.code != null ? String(providerError.code) : "-"}
              </div>
              <div>Message: {providerError.message ?? "-"}</div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <div className="text-body-sm text-dark-6">Bank</div>
              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <span className="text-dark-6">Bank name:</span>{" "}
                  <span className="font-medium">{bankName ? String(bankName) : "-"}</span>
                </div>
                <div>
                  <span className="text-dark-6">Bank number:</span>{" "}
                  <span className="font-medium">{bankNumber ? String(bankNumber) : "-"}</span>
                </div>
                <div>
                  <span className="text-dark-6">Bank user:</span>{" "}
                  <span className="font-medium">{bankUser ? String(bankUser) : "-"}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-body-sm text-dark-6">Order</div>
              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <span className="text-dark-6">Order date:</span>{" "}
                  <span className="font-medium">{orderDate ? String(orderDate) : "-"}</span>
                </div>
                <div>
                  <span className="text-dark-6">Merchant order:</span>{" "}
                  <span className="font-medium">{merchantOrder ? String(merchantOrder) : "-"}</span>
                </div>
                <div>
                  <span className="text-dark-6">Serial:</span>{" "}
                  <span className="font-medium">{serialNumber ? String(serialNumber) : "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="merchant-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">Transaction</h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-body-sm text-dark-6">ID</dt>
              <dd className="font-medium text-dark dark:text-white">{tx.id}</dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Status</dt>
              <dd className="font-medium text-dark dark:text-white">{tx.status}</dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Amount</dt>
              <dd className="font-medium text-dark dark:text-white">
                {tx.amount} {tx.currency}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-body-sm text-dark-6">Reference</dt>
              <dd className="font-medium text-dark dark:text-white">{tx.reference_id || "-"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
}

