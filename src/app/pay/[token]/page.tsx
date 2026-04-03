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
      <div className="flex min-h-screen w-full items-center justify-center px-4">
        <p className="text-sm text-gray-500">Loading payment details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Payment unavailable</h1>
        <p className="mt-2 max-w-md text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return <PublicDepositCheckout data={data} />;
}
