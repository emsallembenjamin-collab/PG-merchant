"use client";

import { GOLDPAY_API_BASE, AUTH_TOKEN_KEY } from "./config";
import type {
  AppNotification,
  AssignProviderBody,
  CreateTransactionBody,
  CreateMerchantBody,
  Merchant,
  MerchantApiKey,
  MerchantSessionUser,
  NotificationListResponse,
  Reconciliation,
  ReconciliationFilters,
  ReconciliationWithDiscrepancies,
  TransactionWithRelations,
  Provider,
  Transaction,
  TransactionDetails,
  PaginatedResponse,
} from "./types";

function getStoredCredential(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function writeSessionCookie(credential: string | null): void {
  if (typeof document === "undefined") return;

  const secure = typeof window !== "undefined" && window.location.protocol === "https:"
    ? "; Secure"
    : "";

  if (!credential) {
    document.cookie = `${AUTH_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
    return;
  }

  document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(
    credential,
  )}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax${secure}`;
}

export function setAuthToken(credential: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, credential);
  writeSessionCookie(credential);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  writeSessionCookie(null);
}

function dispatchUnauthorized(): void {
  clearAuthToken();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("goldpay-unauthorized"));
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${GOLDPAY_API_BASE}/${path.replace(/^\//, "")}`;
  const credential = getStoredCredential();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Merchant portal authenticates using a GoldPay API key sent as X-API-Key.
  if (credential) {
    (headers as Record<string, string>)["X-API-Key"] = credential;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    dispatchUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const json = JSON.parse(text);
      message = json.message ?? json.error ?? text;
    } catch {
      // use text as message
    }
    throw new Error(message || `HTTP ${res.status}`);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// ——— Merchants (admin only, not used by merchant-facing pages today) ———
export const merchantsApi = {
  list: () => request<Merchant[]>("merchants"),
  get: (id: number) => request<Merchant>(`merchants/${id}`),
  create: (body: CreateMerchantBody) =>
    request<Merchant>("merchants", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (
    id: number,
    body: Partial<CreateMerchantBody> & { status?: string },
  ) =>
    request<Merchant>(`merchants/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  me: () => request<MerchantSessionUser>("merchants/me"),
  listApiKeys: (merchantId: number) =>
    request<MerchantApiKey[]>(`merchants/${merchantId}/api-keys`),
  createApiKey: (merchantId: number, name?: string) =>
    request<{ api_key: string }>(`merchants/${merchantId}/api-keys`, {
      method: "POST",
      body: JSON.stringify({ name: name ?? "Merchant key" }),
    }),
  revokeApiKey: (merchantId: number, keyId: number) =>
    request<{ message: string }>(
      `merchants/${merchantId}/api-keys/${keyId}/revoke`,
      { method: "POST" },
    ),
  rotateMyApiKey: (name?: string) =>
    request<{ api_key: string }>("merchants/me/api-keys/rotate", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  assignProvider: (merchantId: number, providerId: number) =>
    request<{
      message: string;
      merchant: { id: number; name: string; provider_id: number | null };
    }>(`merchants/${merchantId}/provider`, {
      method: "POST",
      body: JSON.stringify({ providerId } as AssignProviderBody),
    }),
  removeProvider: (merchantId: number) =>
    request<{
      message: string;
      merchant: { id: number; name: string; provider_id: number | null };
    }>(`merchants/${merchantId}/provider`, { method: "DELETE" }),
  getProvider: (merchantId: number) =>
    request<{ provider: Provider } | { message: string }>(
      `merchants/${merchantId}/provider`,
    ),
};

// ——— Providers (read-only) ———
export const providersApi = {
  list: () => request<Provider[]>("providers"),
  get: (id: number) => request<Provider>(`providers/${id}`),
};

// ——— Transactions (merchant-scoped via API key) ———
export const transactionsApi = {
  /** List transactions for the authenticated merchant (API key). */
  listMine: (
    params: {
      page?: number;
      limit?: number;
      status?: string;
      type?: string;
      sandbox?: boolean;
    } = {},
  ) => {
    const search = new URLSearchParams();
    const { page = 1, limit = 20, status, type, sandbox } = params;
    search.set("page", String(page));
    search.set("limit", String(limit));
    if (status) search.set("status", status);
    if (type) search.set("type", type);
    if (sandbox != null) search.set("sandbox", String(sandbox));
    return request<PaginatedResponse<Transaction>>(
      `transactions?${search.toString()}`,
    );
  },

  createMine: (body: CreateTransactionBody) =>
    request<Transaction>("transactions", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** Get a single transaction by ID for the authenticated merchant. */
  getMine: (id: number) =>
    request<TransactionDetails>(`transactions/${id}`),
  listAdmin: (
    params: {
      page?: number;
      limit?: number;
      merchantId?: number;
      providerId?: number;
      status?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
    } = {},
  ) => {
    const search = new URLSearchParams();
    const {
      page = 1,
      limit = 20,
      merchantId,
      providerId,
      status,
      type,
      startDate,
      endDate,
    } = params;
    search.set("page", String(page));
    search.set("limit", String(limit));
    if (merchantId != null) search.set("merchantId", String(merchantId));
    if (providerId != null) search.set("providerId", String(providerId));
    if (status) search.set("status", status);
    if (type) search.set("type", type);
    if (startDate) search.set("startDate", startDate);
    if (endDate) search.set("endDate", endDate);
    return request<PaginatedResponse<TransactionWithRelations>>(
      `admin/transactions?${search.toString()}`,
    );
  },
  get: (id: number) =>
    request<TransactionDetails>(`admin/transactions/${id}`),
};

export const reconciliationApi = {
  list: (filters?: ReconciliationFilters) => {
    const params = new URLSearchParams();
    if (filters?.type) params.set("type", filters.type);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.merchantId != null)
      params.set("merchantId", String(filters.merchantId));
    if (filters?.providerId != null)
      params.set("providerId", String(filters.providerId));
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
    const qs = params.toString();
    return request<Reconciliation[]>(
      `admin/reconciliation${qs ? `?${qs}` : ""}`,
    );
  },
  get: (id: number) =>
    request<ReconciliationWithDiscrepancies>(`admin/reconciliation/${id}`),
  resolveDiscrepancy: (
    id: number,
    resolutionNotes: string,
    resolvedBy: number,
  ) =>
    request(`admin/reconciliation/discrepancies/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolutionNotes, resolvedBy }),
    }),
};

export const notificationsApi = {
  listMerchant: (params: { unreadOnly?: boolean; limit?: number } = {}) => {
    const search = new URLSearchParams();
    if (params.unreadOnly != null) {
      search.set("unreadOnly", String(params.unreadOnly));
    }
    if (params.limit != null) {
      search.set("limit", String(params.limit));
    }
    return request<NotificationListResponse>(
      `notifications/merchant?${search.toString()}`,
    );
  },
  markReadMerchant: (notificationId: number) =>
    request<AppNotification>(`notifications/merchant/${notificationId}/read`, {
      method: "PATCH",
    }),
  markAllReadMerchant: () =>
    request<{ updated: number }>("notifications/merchant/read-all", {
      method: "PATCH",
    }),
};

export const goldpayApi = {
  merchants: merchantsApi,
  providers: providersApi,
  transactions: transactionsApi,
  reconciliation: reconciliationApi,
  notifications: notificationsApi,
};
