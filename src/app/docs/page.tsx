import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import {
  getGoldPayOrigin,
  getMerchantOpenApiJsonUrl,
  getMerchantSwaggerUrl,
} from "@/lib/goldpay-api/docs-urls";
import { GOLDPAY_API_BASE } from "@/lib/goldpay-api/config";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "API documentation",
  description:
    "How to integrate with the GoldPay merchant API: authentication, funding, transactions, webhooks.",
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-lg border border-line bg-surface-soft p-4 text-left text-sm text-ink dark:border-dark-3 dark:bg-dark-2 dark:text-white">
      <code>{children}</code>
    </pre>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="merchant-card scroll-mt-24 p-6 md:p-8">
      <h3 className="mb-4 text-lg font-semibold text-ink dark:text-white">
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function ApiDocsPage() {
  const origin = getGoldPayOrigin();
  const swaggerMerchant = getMerchantSwaggerUrl();
  const openApiMerchant = getMerchantOpenApiJsonUrl();

  return (
    <>
      <Breadcrumb pageName="API documentation" />

      <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-dark dark:text-white">
        <p className="font-medium">GoldPay API base (this portal)</p>
        <p className="mt-1 break-all font-mono text-body-sm text-dark-6">
          {GOLDPAY_API_BASE}
        </p>
        <p className="mt-3 text-dark-6">
          Configure <code className="rounded bg-white/60 px-1 dark:bg-dark-2">NEXT_PUBLIC_GOLDPAY_API_URL</code> in{" "}
          <code className="rounded bg-white/60 px-1 dark:bg-dark-2">.env.local</code> to match your GoldPay server
          origin (no trailing slash).
        </p>
      </div>

      <div className="space-y-6">
        <Section id="overview" title="Overview">
          <p className="text-body-sm leading-relaxed text-dark-6">
            Integrate with <strong className="text-dark dark:text-white">GoldPay only</strong> (REST + webhooks). The
            platform assigns one payment provider per merchant; you do not call DPay or other providers directly.
          </p>
          <ul className="mt-4 list-inside list-disc space-y-2 text-body-sm text-dark-6">
            <li>
              <strong className="text-dark dark:text-white">Protocol:</strong> HTTPS REST, JSON bodies
            </li>
            <li>
              <strong className="text-dark dark:text-white">Version:</strong> v1 — paths under{" "}
              <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">/api/v1</code>
            </li>
            <li>
              <strong className="text-dark dark:text-white">Auth:</strong> header{" "}
              <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">X-API-Key</code>
            </li>
            <li>
              <strong className="text-dark dark:text-white">Idempotency:</strong> optional{" "}
              <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">idempotency_key</code> on creates
            </li>
          </ul>
        </Section>

        <Section id="interactive" title="Interactive reference (GoldPay server)">
          <p className="text-body-sm text-dark-6">
            Open these on the <strong className="text-dark dark:text-white">GoldPay server host</strong> (
            <span className="font-mono text-xs">{origin}</span>):
          </p>
          <ul className="mt-3 space-y-2 text-body-sm">
            <li>
              <Link
                href={swaggerMerchant}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                Merchant Swagger UI
              </Link>
              <span className="text-dark-6"> — try requests with your API key</span>
            </li>
            <li>
              <Link
                href={openApiMerchant}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                OpenAPI JSON (merchant)
              </Link>
              <span className="text-dark-6"> — import into Postman or codegen</span>
            </li>
          </ul>
        </Section>

        <Section id="auth" title="Authentication">
          <p className="text-body-sm text-dark-6">
            Every request must include your API secret (created by the operator or rotated via{" "}
            <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">POST /merchants/me/api-keys/rotate</code>).
          </p>
          <CodeBlock>{`X-API-Key: <your_api_secret>`}</CodeBlock>
          <p className="mt-3 text-body-sm text-dark-6">
            If the merchant has <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">whitelisted_ips</code>, requests
            from other IPs return <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">403</code>.
          </p>
        </Section>

        <Section id="endpoints" title="Main endpoints (relative to /api/v1)">
          <p className="mb-4 text-body-sm font-medium text-dark dark:text-white">Profile</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-stroke dark:border-dark-3">
                  <th className="py-2 pr-4 font-semibold text-dark dark:text-white">Method</th>
                  <th className="py-2 pr-4 font-semibold text-dark dark:text-white">Path</th>
                  <th className="py-2 font-semibold text-dark dark:text-white">Description</th>
                </tr>
              </thead>
              <tbody className="text-dark-6">
                <tr className="border-b border-stroke/60 dark:border-dark-3/60">
                  <td className="py-2 pr-4 font-mono text-xs">GET</td>
                  <td className="py-2 pr-4 font-mono text-xs">/merchants/me</td>
                  <td className="py-2">Current merchant profile</td>
                </tr>
                <tr className="border-b border-stroke/60 dark:border-dark-3/60">
                  <td className="py-2 pr-4 font-mono text-xs">POST</td>
                  <td className="py-2 pr-4 font-mono text-xs">/merchants/me/api-keys/rotate</td>
                  <td className="py-2">Rotate API key</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-4 mt-8 text-body-sm font-medium text-dark dark:text-white">Funding (recommended)</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-stroke dark:border-dark-3">
                  <th className="py-2 pr-4 font-semibold text-dark dark:text-white">Method</th>
                  <th className="py-2 pr-4 font-semibold text-dark dark:text-white">Path</th>
                  <th className="py-2 font-semibold text-dark dark:text-white">Description</th>
                </tr>
              </thead>
              <tbody className="text-dark-6">
                <tr className="border-b border-stroke/60 dark:border-dark-3/60">
                  <td className="py-2 pr-4 font-mono text-xs">POST</td>
                  <td className="py-2 pr-4 font-mono text-xs">/funding/deposits</td>
                  <td className="py-2">Create deposit; response may include <code className="text-xs">payment</code></td>
                </tr>
                <tr className="border-b border-stroke/60 dark:border-dark-3/60">
                  <td className="py-2 pr-4 font-mono text-xs">POST</td>
                  <td className="py-2 pr-4 font-mono text-xs">/funding/withdrawals</td>
                  <td className="py-2">Create withdrawal</td>
                </tr>
                <tr className="border-b border-stroke/60 dark:border-dark-3/60">
                  <td className="py-2 pr-4 font-mono text-xs">POST</td>
                  <td className="py-2 pr-4 font-mono text-xs">/funding/bank-list</td>
                  <td className="py-2">DPay: banks for a <code className="text-xs">pay_type</code></td>
                </tr>
                <tr className="border-b border-stroke/60 dark:border-dark-3/60">
                  <td className="py-2 pr-4 font-mono text-xs">POST</td>
                  <td className="py-2 pr-4 font-mono text-xs">/funding/balance-inquiry</td>
                  <td className="py-2">DPay: balance inquiry</td>
                </tr>
                <tr className="border-b border-stroke/60 dark:border-dark-3/60">
                  <td className="py-2 pr-4 font-mono text-xs">POST</td>
                  <td className="py-2 pr-4 font-mono text-xs">/funding/payout-inquiry</td>
                  <td className="py-2">DPay: payout status inquiry</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-4 mt-8 text-body-sm font-medium text-dark dark:text-white">Transactions</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-stroke dark:border-dark-3">
                  <th className="py-2 pr-4 font-semibold text-dark dark:text-white">Method</th>
                  <th className="py-2 pr-4 font-semibold text-dark dark:text-white">Path</th>
                  <th className="py-2 font-semibold text-dark dark:text-white">Description</th>
                </tr>
              </thead>
              <tbody className="text-dark-6">
                <tr className="border-b border-stroke/60 dark:border-dark-3/60">
                  <td className="py-2 pr-4 font-mono text-xs">POST</td>
                  <td className="py-2 pr-4 font-mono text-xs">/transactions</td>
                  <td className="py-2">Create with body <code className="text-xs">type: deposit | withdrawal</code></td>
                </tr>
                <tr className="border-b border-stroke/60 dark:border-dark-3/60">
                  <td className="py-2 pr-4 font-mono text-xs">GET</td>
                  <td className="py-2 pr-4 font-mono text-xs">/transactions</td>
                  <td className="py-2">List (pagination / filters)</td>
                </tr>
                <tr className="border-b border-stroke/60 dark:border-dark-3/60">
                  <td className="py-2 pr-4 font-mono text-xs">GET</td>
                  <td className="py-2 pr-4 font-mono text-xs">/transactions/:id</td>
                  <td className="py-2">Get one transaction</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="create-body" title="Create deposit / withdrawal (body)">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-stroke dark:border-dark-3">
                  <th className="py-2 pr-4 font-semibold text-dark dark:text-white">Field</th>
                  <th className="py-2 pr-4 font-semibold text-dark dark:text-white">Notes</th>
                </tr>
              </thead>
              <tbody className="text-dark-6">
                <tr className="border-b border-stroke/60 dark:border-dark-3/60">
                  <td className="py-2 pr-4 font-mono text-xs">amount</td>
                  <td className="py-2">Required, number ≥ 0.01</td>
                </tr>
                <tr className="border-b border-stroke/60 dark:border-dark-3/60">
                  <td className="py-2 pr-4 font-mono text-xs">currency</td>
                  <td className="py-2">Optional; default USD (use VND for DPay coin amounts)</td>
                </tr>
                <tr className="border-b border-stroke/60 dark:border-dark-3/60">
                  <td className="py-2 pr-4 font-mono text-xs">reference_id</td>
                  <td className="py-2">Your order reference</td>
                </tr>
                <tr className="border-b border-stroke/60 dark:border-dark-3/60">
                  <td className="py-2 pr-4 font-mono text-xs">idempotency_key</td>
                  <td className="py-2">Same key returns the same stored response</td>
                </tr>
                <tr className="border-b border-stroke/60 dark:border-dark-3/60">
                  <td className="py-2 pr-4 font-mono text-xs">metadata</td>
                  <td className="py-2">Provider-specific fields (e.g. DPay pay_type, bank_code)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-body-sm text-dark-6">
            For <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">application/x-www-form-urlencoded</code>, send{" "}
            <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">metadata</code> as a JSON string.
          </p>
        </Section>

        <Section id="response" title="Response shape">
          <p className="text-body-sm text-dark-6">
            Successful creates return a merchant transaction object. Deposit instructions appear under{" "}
            <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">payment</code> when the provider returns them.
          </p>
          <CodeBlock>{`{
  "id": 42,
  "type": "deposit",
  "amount": 100000,
  "currency": "VND",
  "status": "processing",
  "provider": { "name": "dpay", "display_name": "DPay" },
  "payment": { "url": "https://...", "payurl": "https://..." },
  "provider_error": null
}`}</CodeBlock>
        </Section>

        <Section id="errors" title="HTTP errors & provider errors">
          <ul className="list-inside list-disc space-y-2 text-body-sm text-dark-6">
            <li>
              <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">400</code> — validation / business rule
            </li>
            <li>
              <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">401</code> — missing or invalid API key
            </li>
            <li>
              <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">403</code> — IP not allowlisted
            </li>
            <li>
              <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">404</code> — unknown transaction
            </li>
          </ul>
          <p className="mt-4 text-body-sm text-dark-6">
            When the upstream provider rejects an operation, you may still get HTTP 200 with{" "}
            <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">status: &quot;failed&quot;</code> and{" "}
            <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">provider_error</code> (e.g. DPay codes).
          </p>
        </Section>

        <Section id="webhooks" title="Webhooks (outbound)">
          <p className="text-body-sm text-dark-6">
            If <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">webhook_url</code> is set on your merchant,
            GoldPay can POST JSON events (e.g. <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">transaction.updated</code>).
          </p>
          <p className="mt-3 text-body-sm text-dark-6">
            When <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">webhook_secret</code> is set, verify header{" "}
            <code className="rounded bg-surface-soft px-1 dark:bg-dark-2">X-Webhook-Signature</code>: HMAC-SHA256 of the raw
            body, hex-encoded.
          </p>
        </Section>

        <Section id="checklist" title="Integration checklist">
          <ol className="list-inside list-decimal space-y-2 text-body-sm text-dark-6">
            <li>Confirm API base URL and prefix (usually <code className="text-xs">/api/v1</code>).</li>
            <li>Store and use <code className="text-xs">X-API-Key</code> securely.</li>
            <li>Implement deposits/withdrawals via <code className="text-xs">/funding/deposits</code> and{" "}
              <code className="text-xs">/funding/withdrawals</code>.</li>
            <li>Implement webhook endpoint and signature verification.</li>
            <li>Use Merchant Swagger on the GoldPay host to test live schemas.</li>
          </ol>
        </Section>
      </div>
    </>
  );
}
