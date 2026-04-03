"use client";

import { Logo } from "@/components/logo";
import type { PublicDepositInstructions } from "@/lib/goldpay-api";
import { useEffect, useMemo, useState } from "react";

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

function pickOrderId(
  data: PublicDepositInstructions,
  payment: Record<string, unknown> | null,
): string {
  if (data.public_code?.trim()) return data.public_code.trim();
  const s = payment?.serial_number;
  if (s != null && String(s).trim()) return String(s).trim();
  if (data.reference_id) return data.reference_id;
  return `TX-${data.transaction_id}`;
}

function pickTransferReference(
  data: PublicDepositInstructions,
  payment: Record<string, unknown> | null,
): string {
  const keys = [
    payment?.order_msg,
    payment?.remark,
    payment?.noidung,
    payment?.merchant_order,
    payment?.order,
    payment?.m_order,
  ];
  for (const v of keys) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  if (data.reference_id) return data.reference_id;
  return `TX-${data.transaction_id}`;
}

function parseExpiryMs(payment: Record<string, unknown> | null): number | null {
  if (!payment) return null;
  const candidates = [
    payment.expire_time,
    payment.expire_timestamp,
    payment.valid_end,
    payment.end_time,
    payment.timeout,
  ];
  for (const v of candidates) {
    if (typeof v === "number" && v > 0) {
      return v > 1e12 ? v : v * 1000;
    }
    if (typeof v === "string" && v.trim()) {
      const n = Number(v);
      if (!Number.isNaN(n) && n > 0) {
        return n > 1e12 ? n : n * 1000;
      }
      const d = Date.parse(v);
      if (!Number.isNaN(d)) return d;
    }
  }
  return null;
}

function CopyRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-200 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </div>
        <div
          className={`mt-1 break-all text-sm font-semibold ${
            highlight ? "text-red-600" : "text-gray-900"
          }`}
        >
          {value}
        </div>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-md bg-teal-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-600"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function ExpiryCountdown({ expiresAt }: { expiresAt: number | null }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!expiresAt) {
    return <span className="text-sm text-gray-400">—</span>;
  }

  const sec = Math.max(0, Math.floor((expiresAt - now) / 1000));
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  return (
    <span className="text-lg font-bold tabular-nums text-red-600">
      {mm}:{ss}
    </span>
  );
}

export function PublicDepositCheckout({
  data,
}: {
  data: PublicDepositInstructions;
}) {
  if (data.expired) {
    return (
      <div className="w-full px-4 py-16 md:px-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <Logo compact />
          </div>
          <h1 className="text-lg font-bold text-gray-900">
            Payment link expired
          </h1>
          <p className="mt-3 text-sm text-gray-700">
            {data.message ??
              "This payment link is no longer valid. Ask the merchant for a new deposit link."}
          </p>
          {data.public_code ? (
            <p className="mt-4 font-mono text-xs text-gray-500">
              Reference: {data.public_code}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-gray-600">
            {formatMoney(data.amount, data.currency)} · {data.status}
          </p>
        </div>
      </div>
    );
  }

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

  const orderId = useMemo(
    () => pickOrderId(data, payment),
    [data, payment],
  );
  const transferRef = useMemo(
    () => pickTransferReference(data, payment),
    [data, payment],
  );
  const expiresAt = useMemo(() => {
    if (data.payment_link_expires_at) {
      const t = Date.parse(data.payment_link_expires_at);
      if (!Number.isNaN(t)) return t;
    }
    return parseExpiryMs(payment);
  }, [data.payment_link_expires_at, payment]);

  const bankName = payment?.bank_name != null ? String(payment.bank_name) : "—";
  const bankNumber =
    payment?.bank_number != null ? String(payment.bank_number) : "—";
  const bankUser =
    payment?.bank_user != null ? String(payment.bank_user) : "—";

  useEffect(() => {
    document.title = `Pay ${formatMoney(data.amount, data.currency)} — GoldPay`;
  }, [data.amount, data.currency]);

  useEffect(() => {
    if (!qrValue) return;

    ensureQrScriptLoaded(() => {
      const el = document.getElementById("public-payin-qr");
      if (!el) return;
      el.innerHTML = "";

      if (!window.QRCode) return;
      // eslint-disable-next-line no-new
      new window.QRCode(el, { text: qrValue, width: 240, height: 240 });
    });
  }, [qrValue]);

  return (
    <div className="w-full px-4 py-6 md:px-8 md:py-10">
      <header className="mx-auto flex max-w-5xl flex-col gap-4 border-b border-gray-300/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          <span className="text-gray-600">Order ID </span>
          <span className="font-semibold text-gray-900">{orderId}</span>
        </div>
        <div className="flex flex-1 items-center justify-center gap-2 sm:justify-center">
          <span className="text-sm text-gray-600">Expires in</span>
          <ExpiryCountdown expiresAt={expiresAt} />
        </div>
        <div className="flex justify-end sm:min-w-[120px]">
          <Logo compact />
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="grid gap-0 md:grid-cols-2">
          <section className="border-b border-gray-200 p-6 md:border-b-0 md:border-r">
            <h2 className="text-base font-bold text-gray-900">
              Method 1: Transfer by QR code
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Open your banking app and scan the QR code.
            </p>
            <div
              id="public-payin-qr"
              className="mx-auto mt-6 flex min-h-[240px] max-w-[280px] items-center justify-center rounded-xl border border-gray-100 bg-white p-4"
            />
            {!qrValue && (
              <p className="mt-2 text-center text-sm text-gray-500">
                No QR payload for this payment method.
              </p>
            )}
            <p className="mt-6 text-center text-xl font-bold text-red-600">
              {formatMoney(data.amount, data.currency)}
            </p>
            {paymentUrl ? (
              <p className="mt-4 text-center">
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-teal-600 underline hover:text-teal-700"
                >
                  Open provider payment page
                </a>
              </p>
            ) : null}
          </section>

          <section className="p-6">
            <h2 className="text-base font-bold text-gray-900">
              Method 2: Manual bank transfer
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Copy each field exactly into your banking app.
            </p>
            <div className="mt-4 text-sm">
              <div
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                  data.status === "succeeded"
                    ? "bg-emerald-100 text-emerald-800"
                    : data.status === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-900"
                }`}
              >
                {data.status}
              </div>
              {data.provider?.display_name ? (
                <span className="ml-2 text-gray-500">
                  via {data.provider.display_name}
                </span>
              ) : null}
            </div>

            {data.provider_error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {data.provider_error.code != null
                  ? `Code ${String(data.provider_error.code)} — `
                  : null}
                {data.provider_error.message ?? "—"}
              </div>
            )}

            <div className="mt-4">
              <CopyRow label="Bank" value={bankName} />
              <CopyRow label="Account number" value={bankNumber} />
              <CopyRow label="Account holder" value={bankUser} />
              <CopyRow
                label="Transfer reference"
                value={transferRef}
                highlight
              />
              <CopyRow
                label="Amount"
                value={formatMoney(data.amount, data.currency)}
                highlight
              />
            </div>
          </section>
        </div>
      </div>

      <footer className="mx-auto mt-8 max-w-5xl">
        <h3 className="text-sm font-bold text-red-600">Important</h3>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-gray-600">
          <li>
            Transfer the exact amount and use the reference above. Wrong
            details may delay confirmation.
          </li>
          <li>
            If a one-time QR code is shown, do not refresh or reuse it unless
            instructed by your bank.
          </li>
          <li>
            Keep this page open until your payment is confirmed. If you need
            help, contact the merchant you are paying.
          </li>
        </ol>
      </footer>
    </div>
  );
}
