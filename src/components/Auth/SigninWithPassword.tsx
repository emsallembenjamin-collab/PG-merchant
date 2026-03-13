"use client";
import { PasswordIcon } from "@/assets/icons";
import React, { useState } from "react";
import InputGroup from "../FormElements/InputGroup";
import { useAuth } from "@/contexts/auth-context";

const demoApiKey =
  process.env.NEXT_PUBLIC_DEMO_API_KEY || "gpk_sandbox_merchant_alpha_001";

export default function SigninWithPassword() {
  const { login } = useAuth();
  const [data, setData] = useState({
    apiKey: demoApiKey,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(data.apiKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 rounded-lg border border-primary/20 bg-primary/[0.06] p-4 dark:border-primary/30 dark:bg-primary/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-dark dark:text-white">
              Merchant API key access
            </p>
            <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
              Sign in with a GoldPay merchant API key to view your payment activity.
            </p>
            <p className="mt-3 text-sm text-dark dark:text-white">
              {demoApiKey
                ? "A local demo key is available for quick testing."
                : "Enter an active API key generated from the admin portal."}
            </p>
          </div>

          {demoApiKey && (
            <button
              type="button"
              onClick={() => setData({ apiKey: demoApiKey })}
              className="rounded-md border border-primary px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
            >
              Use Demo
            </button>
          )}
        </div>
      </div>

      <InputGroup
        type="text"
        label="API Key"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your GoldPay API key"
        name="apiKey"
        handleChange={handleChange}
        value={data.apiKey}
        icon={<PasswordIcon />}
      />

      {error && (
        <p className="mb-4 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      <div className="mb-4.5">
        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-70"
        >
          Access Merchant Portal
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
        </button>
      </div>
    </form>
  );
}
