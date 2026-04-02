"use client";

import { Logo } from "@/components/logo";
import type { PublicDepositInstructions } from "@/lib/goldpay-api";
import { useEffect, useMemo } from "react";

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
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
  script.async = true;
  script.onload = () => onLoaded();
  script.onerror = () => onLoaded();
  document.body.appendChild(script);
}

function formatMoney(amount: number, currency: string) {
  const n = Number(amount);
  if (Number.isNaN(n)) return String(amount);
  if (currency.toUpperCase() === "VND") {
    return `${new Intl.NumberFormat(undefined).format(Math.round(n))} ${currency}`;
  }
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export function PublicDepositCheckout({
  data,
}: {
  data: PublicDepositInstructions;
}) {
  const payment = useMemo(() => normalizeObject(data.payment), [data.payment]);

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
    document.title = `Pay ${data.currency} — GoldPay`;
  }, [data.currency]);

  useEffect(() => {
    if (!qrValue) return;

    ensureQrScriptLoaded(() => {
      const el = document.getElementById("public-payin-qr");
      if (!el) return;
      el.innerHTML = "";

      if (!window.QRCode) return;
      // eslint-disable-next-line no-new
      new window.QRCode(el, { text: qrValue, width: 220, height: 220 });
    });
  }, [qrValue]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <Logo compact />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
              Secure payment
            </p>
            <h1 className="text-xl font-bold text-ink dark:text-white">
              Complete your deposit
            </h1>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface-soft px-5 py-3 text-right dark:border-dark-3 dark:bg-dark-2">
          <div className="text-xs text-ink-muted">Amount due</div>
          <div className="text-2xl font-bold tabular-nums text-ink dark:text-white">
            {formatMoney(data.amount, data.currency)}
          </div>
        </div>
      </div>

      <div className="merchant-card p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              data.status === "succeeded"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                : data.status === "failed"
                  ? "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300"
                  : "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
            }`}
          >
            {data.status}
          </span>
          {data.provider?.display_name ? (
            <span className="text-sm text-ink-muted">
              via {data.provider.display_name}
            </span>
          ) : null}
        </div>

        {data.provider_error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            <div className="font-semibold">Provider message</div>
            <div>
              {data.provider_error.code != null
                ? `Code ${String(data.provider_error.code)} — `
                : null}
              {data.provider_error.message ?? "—"}
            </div>
          </div>
        )}

        {paymentUrl ? (
          <div className="mb-6">
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-primary-600"
            >
              Open payment page
            </a>
          </div>
        ) : (
          <p className="mb-6 text-sm text-ink-muted">
            No redirect URL for this deposit. Use the QR code or bank details
            below if available.
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-ink-secondary">
              QR code
            </h2>
            <div
              id="public-payin-qr"
              className="flex min-h-[220px] items-center justify-center rounded-2xl border border-line bg-white p-4 dark:border-dark-3 dark:bg-dark-2"
            />
            {!qrValue && (
              <p className="mt-2 text-sm text-ink-muted">
                No QR payload for this payment method.
              </p>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-ink-secondary">
              Bank / transfer details
            </h2>
            <dl className="space-y-3 rounded-2xl border border-line bg-surface-soft p-4 text-sm dark:border-dark-3 dark:bg-dark-2">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Order / serial</dt>
                <dd className="font-medium text-ink dark:text-white">
                  {payment?.serial_number
                    ? String(payment.serial_number)
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Bank</dt>
                <dd className="font-medium text-ink dark:text-white">
                  {payment?.bank_name ? String(payment.bank_name) : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Account number</dt>
                <dd className="font-medium text-ink dark:text-white">
                  {payment?.bank_number ? String(payment.bank_number) : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Account name</dt>
                <dd className="font-medium text-ink dark:text-white">
                  {payment?.bank_user ? String(payment.bank_user) : "—"}
                </dd>
              </div>
              <div className="border-t border-line pt-3 dark:border-dark-3">
                <dt className="text-ink-muted">Your reference</dt>
                <dd className="mt-1 break-all font-mono text-xs text-ink dark:text-white">
                  {data.reference_id || `TX-${data.transaction_id}`}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-ink-muted">
          Do not close this page until your payment is confirmed. Questions?
          Contact the merchant you are paying.
        </p>
      </div>
    </div>
  );
}
