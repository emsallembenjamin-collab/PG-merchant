"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { MerchantVisualPanel } from "@/components/merchant-visual-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { goldpayApi } from "@/lib/goldpay-api";
import type {
  SandboxDeliveryMode,
  SandboxOutcome,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/lib/goldpay-api";
import { isSandboxTransaction } from "@/lib/goldpay-api/sandbox";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const DEFAULT_OUTCOME: SandboxOutcome = "processing_then_success";
const DEFAULT_DELIVERY_MODE: SandboxDeliveryMode = "callback";

function getTransactionStatusClass(status: TransactionStatus) {
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

export default function TransactionsPage() {
  const [data, setData] = useState<{
    data: Transaction[];
    total: number;
    page: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterSandbox, setFilterSandbox] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [sandboxForm, setSandboxForm] = useState({
    amount: "100",
    type: "deposit" as TransactionType,
    outcome: DEFAULT_OUTCOME,
    deliveryMode: DEFAULT_DELIVERY_MODE,
    delayMs: "1500",
  });

  const statusFilter =
    filterStatus === "pending" ||
    filterStatus === "processing" ||
    filterStatus === "succeeded" ||
    filterStatus === "failed" ||
    filterStatus === "reversed"
      ? (filterStatus as TransactionStatus)
      : undefined;
  const typeFilter =
    filterType === "deposit" || filterType === "withdrawal"
      ? (filterType as TransactionType)
      : undefined;
  const sandboxFilter =
    filterSandbox === "sandbox"
      ? true
      : filterSandbox === "live"
        ? false
        : undefined;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const txRes = await goldpayApi.transactions.listMine({
        page,
        limit: PAGE_SIZE,
        status: statusFilter,
        type: typeFilter,
        sandbox: sandboxFilter,
      });
      setData(txRes);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transactions",
      );
    } finally {
      setLoading(false);
    }
  }, [page, sandboxFilter, statusFilter, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateSandboxTransaction = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const stamp = Date.now();
      const created = await goldpayApi.transactions.createMine({
        type: sandboxForm.type,
        amount: Number(sandboxForm.amount),
        currency: "USD",
        reference_id: `sandbox-${stamp}`,
        idempotency_key: `sandbox-${stamp}`,
        metadata: {
          source: "merchant-portal-sandbox",
        },
        sandbox: {
          outcome: sandboxForm.outcome,
          delivery_mode: sandboxForm.deliveryMode,
          delay_ms: Number(sandboxForm.delayMs),
        },
      });

      setCreateSuccess(`Sandbox transaction #${created.id} created.`);
      setFilterSandbox("sandbox");
      setPage(1);
      await load();
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : "Failed to create sandbox transaction",
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading && !data) {
    return (
      <>
        <Breadcrumb pageName="Transactions" />
        <div className="merchant-card p-8">
          <p className="text-dark-6">Loading transactions...</p>
        </div>
      </>
    );
  }

  const list = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? 1;

  return (
    <>
      <Breadcrumb pageName="Transactions" />

      <MerchantVisualPanel variant="sandbox" className="mb-6" />

      <div className="merchant-card mb-6 p-5 md:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-dark dark:text-white">
            Sandbox Simulator
          </h2>
          <p className="mt-1 text-sm text-dark-6">
            Create test payments with forced outcomes to validate your payment
            flow without using a live provider.
          </p>
        </div>

        <form
          onSubmit={handleCreateSandboxTransaction}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"
        >
          <div>
            <label className="merchant-label">Amount</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={sandboxForm.amount}
              onChange={(e) =>
                setSandboxForm((current) => ({
                  ...current,
                  amount: e.target.value,
                }))
              }
              className="merchant-input"
            />
          </div>
          <div>
            <label className="merchant-label">Type</label>
            <select
              value={sandboxForm.type}
              onChange={(e) =>
                setSandboxForm((current) => ({
                  ...current,
                  type: e.target.value as TransactionType,
                }))
              }
              className="merchant-select"
            >
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </div>
          <div>
            <label className="merchant-label">Outcome</label>
            <select
              value={sandboxForm.outcome}
              onChange={(e) =>
                setSandboxForm((current) => ({
                  ...current,
                  outcome: e.target.value as SandboxOutcome,
                }))
              }
              className="merchant-select"
            >
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="processing_then_success">Processing then success</option>
              <option value="processing_then_failed">Processing then failed</option>
            </select>
          </div>
          <div>
            <label className="merchant-label">Delivery</label>
            <select
              value={sandboxForm.deliveryMode}
              onChange={(e) =>
                setSandboxForm((current) => ({
                  ...current,
                  deliveryMode: e.target.value as SandboxDeliveryMode,
                }))
              }
              className="merchant-select"
            >
              <option value="callback">Provider callback</option>
              <option value="direct">Direct completion</option>
            </select>
          </div>
          <div>
            <label className="merchant-label">Delay (ms)</label>
            <input
              type="number"
              min="0"
              max="30000"
              step="100"
              value={sandboxForm.delayMs}
              onChange={(e) =>
                setSandboxForm((current) => ({
                  ...current,
                  delayMs: e.target.value,
                }))
              }
              className="merchant-input"
            />
          </div>
          <div className="md:col-span-2 xl:col-span-5">
            <button
              type="submit"
              disabled={creating}
              className="merchant-primary-button rounded-2xl"
            >
              {creating ? "Creating sandbox transaction..." : "Create Sandbox Transaction"}
            </button>
          </div>
        </form>

        {createError && (
          <div className="mt-4 rounded-[20px] bg-red-500/10 p-3 text-sm text-red-500">
            {createError}
          </div>
        )}
        {createSuccess && (
          <div className="mt-4 rounded-[20px] bg-[#219653]/10 p-3 text-sm text-[#219653]">
            {createSuccess}
          </div>
        )}
      </div>

      <div className="merchant-toolbar mb-4 flex flex-wrap items-end gap-4">
        <div className="min-w-[10rem]">
          <label className="merchant-label">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="merchant-select"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="reversed">Reversed</option>
          </select>
        </div>
        <div className="min-w-[10rem]">
          <label className="merchant-label">Type</label>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className="merchant-select"
          >
            <option value="">All</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
        </div>
        <div className="min-w-[10rem]">
          <label className="merchant-label">Mode</label>
          <select
            value={filterSandbox}
            onChange={(e) => {
              setFilterSandbox(e.target.value);
              setPage(1);
            }}
            className="merchant-select"
          >
            <option value="">All</option>
            <option value="sandbox">Sandbox only</option>
            <option value="live">Live only</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-[20px] bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="merchant-card overflow-hidden">
        <div className="p-4 sm:p-7.5">
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-[#FBF7F2] dark:bg-dark-2 [&>th]:py-4">
                <TableHead>ID</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-dark-6"
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="border-[#eee] dark:border-dark-3"
                  >
                    <TableCell className="font-medium">{tx.id}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "merchant-status-pill",
                          isSandboxTransaction(tx)
                            ? "bg-primary/10 text-primary"
                            : "merchant-status-pill-neutral",
                        )}
                      >
                        {isSandboxTransaction(tx) ? "Sandbox" : "Live"}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">{tx.type}</TableCell>
                    <TableCell>
                      {tx.amount} {tx.currency}
                    </TableCell>
                    <TableCell>
                      <span
                        className={getTransactionStatusClass(tx.status)}
                      >
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-dark-6">
                      {new Date(tx.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/transactions/${tx.id}`}
                        className="font-semibold text-primary transition hover:opacity-80"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-body-sm text-dark-6">
                Page {currentPage} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="merchant-secondary-button px-4 py-2 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="merchant-secondary-button px-4 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
