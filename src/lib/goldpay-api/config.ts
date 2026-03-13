/**
 * GoldPay API configuration.
 * Set NEXT_PUBLIC_GOLDPAY_API_URL in .env.local (e.g. http://localhost:4000).
 */
const baseUrl = process.env.NEXT_PUBLIC_GOLDPAY_API_URL ?? "http://localhost:4000";
const apiPrefix = process.env.NEXT_PUBLIC_GOLDPAY_API_PREFIX ?? "api/v1";

export const GOLDPAY_API_BASE = `${baseUrl}/${apiPrefix}`;

// Storage key for the merchant API credential used by the Merchant portal.
// This is an opaque string from the user's perspective (typically a GoldPay API key).
export const AUTH_TOKEN_KEY = "goldpay_merchant_api_key";
