"use client";

import { useState } from "react";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { useAuth } from "@/contexts/auth-context";

export function ApiAccessSection() {
  const { user, rotateApiKey } = useAuth();
  const [keyName, setKeyName] = useState("");
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);

  const handleRotate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRotating(true);
    setError(null);
    setNewKey(null);

    try {
      const nextKey = await rotateApiKey(keyName.trim() || undefined);
      setNewKey(nextKey);
      setKeyName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rotate API key");
    } finally {
      setRotating(false);
    }
  };

  return (
    <ShowcaseSection title="API Access" className="!p-7">
      <div className="space-y-5">
        <div className="rounded-[20px] border border-[#E8DED0] bg-[#FCFAF7] p-4 dark:border-dark-3 dark:bg-dark-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted dark:text-dark-6">
            Authenticated Merchant
          </p>
          <p className="mt-2 text-base font-semibold text-dark dark:text-white">
            {user?.name ?? "Merchant"}
          </p>
          <p className="mt-1 text-sm text-dark-6">{user?.email ?? "No email available"}</p>
        </div>

        {error && <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}

        {newKey && (
          <div className="rounded-lg border border-[#219653] bg-[#219653]/[0.08] p-4">
            <p className="mb-2 text-sm font-medium text-[#219653]">
              New API key (copy now, it will not be shown again):
            </p>
            <code className="block break-all rounded bg-white/80 px-2 py-2 text-dark dark:bg-dark-2 dark:text-white">
              {newKey}
            </code>
          </div>
        )}

        <form onSubmit={handleRotate} className="space-y-4">
          <div>
            <label className="merchant-label">New key name</label>
            <input
              type="text"
              value={keyName}
              onChange={(event) => setKeyName(event.target.value)}
              placeholder="e.g. Merchant portal"
              className="merchant-input"
            />
          </div>

          <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            Rotating replaces the API key currently signed into this portal. After rotation, this session
            switches to the new key automatically and the previous key stops working immediately.
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={rotating}
              className="merchant-primary-button disabled:opacity-70"
            >
              {rotating ? "Rotating..." : "Rotate API Key"}
            </button>
          </div>
        </form>
      </div>
    </ShowcaseSection>
  );
}
