"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { goldpayApi } from "@/lib/goldpay-api";
import type { TransactionDetails } from "@/lib/goldpay-api";
import { getSandboxMetadata, isSandboxTransaction } from "@/lib/goldpay-api/sandbox";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function getTransactionStatusClass(status: TransactionDetails["status"]) {
  if (status === "succeeded") {
    return "merchant-status-pill merchant-status-pill-success";
  }

  if (status === "failed") {
    return "merchant-status-pill merchant-status-pill-error";
  }

  if (status === "pending" || status === "processing") {
    return "merchant-status-pill merchant-status-pill-warn";
  }

  return "merchant-status-pill merchant-status-pill-neutral";
}

export default function TransactionDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [tx, setTx] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || isNaN(id)) return;
    goldpayApi.transactions
      .getMine(id)
      .then(setTx)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading && !tx) {
    return (
      <>
        <Breadcrumb pageName="Transaction" />
        <div className="merchant-card p-8">
          <p className="text-dark-6">Loading...</p>
        </div>
      </>
    );
  }

  if (error && !tx) {
    return (
      <>
        <Breadcrumb pageName="Transaction" />
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

  const sandbox = getSandboxMetadata(tx);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb pageName={`Transaction #${tx.id}`} />
          {isSandboxTransaction(tx) && (
            <span className="merchant-status-pill mt-2 bg-primary/10 text-primary">
              Sandbox transaction
            </span>
          )}
        </div>
        <Link href="/transactions" className="font-semibold text-primary transition hover:opacity-80">
          ← Back to Transactions
        </Link>
      </div>

      <div className="space-y-6">
        <div className="merchant-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
            Details
          </h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-body-sm text-dark-6">ID</dt>
              <dd className="font-medium text-dark dark:text-white">{tx.id}</dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Merchant</dt>
              <dd className="font-medium text-dark dark:text-white">
                {tx.merchant
                  ? `${tx.merchant.name} (${tx.merchant.email})`
                  : `#${tx.merchant_id}`}
              </dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Provider</dt>
              <dd className="font-medium text-dark dark:text-white">
                {tx.provider
                  ? tx.provider.display_name || tx.provider.name
                  : `#${tx.provider_id}`}
              </dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Type</dt>
              <dd className="capitalize text-dark dark:text-white">
                {tx.type}
              </dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Amount</dt>
              <dd className="font-medium text-dark dark:text-white">
                {tx.amount} {tx.currency}
              </dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Status</dt>
              <dd>
                <span
                  className={getTransactionStatusClass(tx.status)}
                >
                  {tx.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Reference ID</dt>
              <dd className="font-medium text-dark dark:text-white">
                {tx.reference_id || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">External ID</dt>
              <dd className="font-medium text-dark dark:text-white">
                {tx.external_id || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Mode</dt>
              <dd className="font-medium text-dark dark:text-white">
                {isSandboxTransaction(tx) ? "Sandbox" : "Live"}
              </dd>
            </div>
            {sandbox && (
              <>
                <div>
                  <dt className="text-body-sm text-dark-6">Sandbox outcome</dt>
                  <dd className="font-medium capitalize text-dark dark:text-white">
                    {String(sandbox.sandbox_outcome || "-").replaceAll("_", " ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-body-sm text-dark-6">Sandbox delivery</dt>
                  <dd className="font-medium text-dark dark:text-white">
                    {sandbox.sandbox_delivery_mode || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-body-sm text-dark-6">Sandbox delay</dt>
                  <dd className="font-medium text-dark dark:text-white">
                    {sandbox.sandbox_delay_ms ?? 0} ms
                  </dd>
                </div>
              </>
            )}
            <div className="sm:col-span-2">
              <dt className="text-body-sm text-dark-6">Failure reason</dt>
              <dd className="font-medium text-dark dark:text-white">
                {tx.failure_reason || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Created</dt>
              <dd className="text-dark dark:text-white">
                {new Date(tx.created_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Updated</dt>
              <dd className="text-dark dark:text-white">
                {new Date(tx.updated_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="merchant-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
            Payment Links
          </h3>
          <div className="flex flex-wrap gap-3">
            {tx.type === "deposit" && (
              <Link
                href={`/transactions/${tx.id}/payin`}
                className="inline-block rounded px-4 py-2 font-semibold text-primary transition hover:opacity-80"
              >
                Payin URL
              </Link>
            )}
            {tx.type === "withdrawal" && (
              <Link
                href={`/transactions/${tx.id}/payout`}
                className="inline-block rounded px-4 py-2 font-semibold text-primary transition hover:opacity-80"
              >
                Payout URL
              </Link>
            )}
          </div>
          {tx.type === "deposit" && !tx.payment && (
            <p className="mt-3 text-sm text-dark-6">
              No payment instructions available yet.
            </p>
          )}
        </div>

        {tx.attempts && tx.attempts.length > 0 && (
          <div className="merchant-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
              Attempts
            </h3>
            <Table>
              <TableHeader>
                <TableRow className="border-none bg-[#FBF7F2] dark:bg-dark-2">
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attempted at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tx.attempts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.id}</TableCell>
                    <TableCell>{a.status}</TableCell>
                    <TableCell>
                      {new Date(a.attempted_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
