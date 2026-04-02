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

declare global {
  interface Window {
    QRCode?: new (
      el: HTMLElement,
      opts: { text: string; width?: number; height?: number },
    ) => void;
  }
}

function ensureQrScriptLoaded(onLoaded: () => void) {
  const existing = document.getElementById("qrcodejs-script");
  if (existing) {
    onLoaded();
    return;
  }

  const script = document.createElement("script");
  script.id = "qrcodejs-script";
  // qrcodejs (QRCode constructor) for client-side QR rendering.
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
  script.async = true;
  script.onload = () => onLoaded();
  script.onerror = () => onLoaded();
  document.body.appendChild(script);
}

export default function PayinUrlPage() {
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

  const payment = useMemo(() => normalizeObject(tx?.payment), [tx?.payment]);

  const paymentUrl = useMemo(() => {
    if (!payment) return null;
    const url = payment.url ?? payment.payurl;
    return typeof url === "string" && url ? url : null;
  }, [payment]);

  const qrValue = useMemo(() => {
    if (!payment) return null;
    const ewm =
      (payment.ewm_str as unknown) ??
      (payment as unknown as { ewmStr?: unknown }).ewmStr ??
      null;
    return typeof ewm === "string" && ewm ? ewm : null;
  }, [payment]);

  useEffect(() => {
    if (!qrValue) return;

    ensureQrScriptLoaded(() => {
      const el = document.getElementById("payin-qr");
      if (!el) return;
      el.innerHTML = "";

      if (!window.QRCode) return;
      // eslint-disable-next-line no-new
      new window.QRCode(el, { text: qrValue, width: 220, height: 220 });
    });
  }, [qrValue]);

  if (loading && !tx) {
    return (
      <>
        <Breadcrumb pageName="Payin URL" />
        <div className="merchant-card p-8">
          <p className="text-dark-6">Loading...</p>
        </div>
      </>
    );
  }

  if (error && !tx) {
    return (
      <>
        <Breadcrumb pageName="Payin URL" />
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
  if (tx.type !== "deposit") {
    return (
      <>
        <Breadcrumb pageName={`Payin URL for #${tx.id}`} />
        <div className="merchant-card p-6">
          <p className="text-red-500">This transaction is not a deposit.</p>
          <div className="mt-4">
            <Link
              href={`/transactions/${tx.id}`}
              className="font-semibold text-primary transition hover:opacity-80"
            >
              Back to Transaction
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb pageName={`Payin URL for #${tx.id}`} />
        </div>
        <Link
          href={`/transactions/${tx.id}`}
          className="font-semibold text-primary transition hover:opacity-80"
        >
          ← Back to Transaction
        </Link>
      </div>

      <div className="space-y-6">
        <div className="merchant-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
            Payment Instructions
          </h3>

          {tx.provider_error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="font-semibold">Provider error</div>
              <div>
                Code:{" "}
                {tx.provider_error.code != null
                  ? String(tx.provider_error.code)
                  : "-"}
              </div>
              <div>Message: {tx.provider_error.message ?? "-"}</div>
            </div>
          )}

          {paymentUrl ? (
            <div className="mb-4">
              <a
                href={paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block font-semibold text-primary transition hover:opacity-80"
              >
                Open payment page
              </a>
            </div>
          ) : (
            <p className="mb-4 text-dark-6">No payment URL returned by provider.</p>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <div className="text-body-sm text-dark-6">QR Code</div>
              <div id="payin-qr" className="mt-3 flex items-center justify-center" />
              {!qrValue && (
                <p className="mt-2 text-dark-6">No QR payload returned by provider.</p>
              )}
            </div>

            <div>
              <div className="text-body-sm text-dark-6">Bank / Details</div>
              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <span className="text-dark-6">Serial:</span>{" "}
                  <span className="font-medium">
                    {payment?.serial_number ? String(payment.serial_number) : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-dark-6">Bank name:</span>{" "}
                  <span className="font-medium">
                    {payment?.bank_name ? String(payment.bank_name) : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-dark-6">Bank number:</span>{" "}
                  <span className="font-medium">
                    {payment?.bank_number ? String(payment.bank_number) : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-dark-6">Bank user:</span>{" "}
                  <span className="font-medium">
                    {payment?.bank_user ? String(payment.bank_user) : "-"}
                  </span>
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
            <div className="sm:col-span-2">
              <dt className="text-body-sm text-dark-6">Reference</dt>
              <dd className="font-medium text-dark dark:text-white">
                {tx.reference_id || "-"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
}

