/**
 * Build GoldPay server URLs for merchant documentation (Swagger, OpenAPI).
 * Uses NEXT_PUBLIC_GOLDPAY_API_URL (origin only, e.g. https://pay.example.com).
 */

const defaultOrigin = "http://localhost:4000";

export function getGoldPayOrigin(): string {
  const raw =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_GOLDPAY_API_URL ?? defaultOrigin
      : defaultOrigin;
  return raw.replace(/\/+$/, "");
}

/** Merchant-scoped Swagger UI on the GoldPay server. */
export function getMerchantSwaggerUrl(): string {
  return `${getGoldPayOrigin()}/api/docs/merchant`;
}

/** OpenAPI JSON for merchant APIs (codegen / Postman). */
export function getMerchantOpenApiJsonUrl(): string {
  return `${getGoldPayOrigin()}/api/docs/merchant-json`;
}

/** Full platform Swagger (admin, etc.). */
export function getPlatformSwaggerUrl(): string {
  return `${getGoldPayOrigin()}/api/docs`;
}
