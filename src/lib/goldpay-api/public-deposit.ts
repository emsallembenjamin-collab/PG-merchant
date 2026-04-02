import { GOLDPAY_API_BASE } from "./config";
import type { PublicDepositInstructions } from "./types";

/**
 * Fetches deposit payment instructions without an API key (browser / public page).
 */
export async function fetchPublicDepositInstructions(
  token: string,
): Promise<PublicDepositInstructions> {
  const t = token.trim();
  if (!t) {
    throw new Error("Missing payment link token.");
  }
  const url = `${GOLDPAY_API_BASE}/public/deposit/${encodeURIComponent(t)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) {
    throw new Error(
      "This payment link is invalid or no longer available.",
    );
  }
  if (!res.ok) {
    const text = await res.text();
    let message = `Request failed (${res.status})`;
    try {
      const json = JSON.parse(text) as { message?: string };
      if (json.message) message = json.message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }
  return res.json() as Promise<PublicDepositInstructions>;
}
