/** localStorage key — must match settings upload-photo form */
export const MERCHANT_AVATAR_STORAGE_KEY = "goldpayMerchantAvatar";

/** Fired when the user saves or deletes their avatar on Settings (same tab). */
export const MERCHANT_AVATAR_CHANGED_EVENT = "goldpay-merchant-avatar-changed";

export function readStoredMerchantAvatar(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MERCHANT_AVATAR_STORAGE_KEY);
    if (raw?.startsWith("data:image")) return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function dispatchMerchantAvatarChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MERCHANT_AVATAR_CHANGED_EVENT));
}
