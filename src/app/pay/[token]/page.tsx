"use client";

import { PublicDepositCheckout } from "@/components/public-deposit-checkout";
import { fetchPublicDepositInstructions } from "@/lib/goldpay-api/public-deposit";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { PublicDepositInstructions } from "@/lib/goldpay-api";

export default function PublicDepositPage() {
  const params = useParams();
  const token = typeof params.token === "string" ? params.token : "";
  const [data, setData] = useState<PublicDepositInstructions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Invalid payment link.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPublicDepositInstructions(token)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load payment.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="merchant-card p-10 text-center">
        <p className="text-ink-muted">Loading payment details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="merchant-card p-10 text-center">
        <h1 className="text-lg font-semibold text-ink dark:text-white">
          Payment unavailable
        </h1>
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return <PublicDepositCheckout data={data} />;
}
