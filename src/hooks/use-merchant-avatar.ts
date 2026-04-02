"use client";

import {
  MERCHANT_AVATAR_CHANGED_EVENT,
  MERCHANT_AVATAR_STORAGE_KEY,
  readStoredMerchantAvatar,
} from "@/lib/merchant-avatar";
import { useEffect, useState } from "react";

/**
 * Data URL from localStorage (Settings → Your Photo), or null for default placeholder.
 */
export function useMerchantAvatar(): string | null {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setSrc(readStoredMerchantAvatar());
    sync();

    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === MERCHANT_AVATAR_STORAGE_KEY) {
        sync();
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(MERCHANT_AVATAR_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(MERCHANT_AVATAR_CHANGED_EVENT, sync);
    };
  }, []);

  return src;
}
