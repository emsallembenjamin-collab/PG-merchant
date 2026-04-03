/**
 * Types matching GoldPay backend entities and API responses.
 */

export type MerchantStatus = "active" | "suspended" | "inactive";
export type ProviderStatus = "active" | "inactive";
export type NotificationCategory =
  | "system"
  | "account"
  | "security"
  | "transaction"
  | "reconciliation"
  | "webhook";
export type TransactionType = "deposit" | "withdrawal";
export type TransactionStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "reversed";
export type SandboxOutcome =
  | "success"
  | "failed"
  | "processing_then_success"
  | "processing_then_failed";
export type SandboxDeliveryMode = "direct" | "callback";

export interface Merchant {
  id: number;
  name: string;
  email: string;
  status: MerchantStatus;
  webhook_url: string | null;
  webhook_secret?: string | null;
  provider_id: number | null;
  /** Optional contact / display fields (merchant self-service profile). */
  phone?: string | null;
  username?: string | null;
  bio?: string | null;
  /** Internal ledger currency (ISO 4217). */
  balance_currency?: string;
  /** Spendable balance (numeric from API). */
  balance_available?: number;
  /** Reserved for in-flight withdrawals. */
  balance_locked?: number;
  /** Available + locked. */
  balance_total?: number;
  created_at: string;
  updated_at: string;
  provider?: { id: number; name: string; display_name: string } | null;
}

export interface UpdateMerchantProfileBody {
  name?: string;
  email?: string;
  phone?: string | null;
  username?: string | null;
  bio?: string | null;
}

export interface MerchantApiKey {
  id: number;
  name: string;
  status: string;
  key_prefix: string;
  last_used_at?: string | null;
  created_at: string;
}

export interface Provider {
  id: number;
  name: string;
  display_name: string;
  status: ProviderStatus;
  priority: number;
  fee_percentage: number | null;
  min_amount: number | null;
  max_amount: number | null;
  config?: string | null;
  created_at: string;
  updated_at: string;
}

/** Public `GET .../public/deposit/:token` — no API key. */
export interface PublicDepositInstructions {
  transaction_id: number;
  /** Same code as in the payment URL path when using `public_code`. */
  public_code?: string;
  type: "deposit";
  amount: number;
  currency: string;
  reference_id?: string;
  external_id?: string;
  status: string;
  failure_reason?: string;
  metadata?: Record<string, unknown>;
  provider?: {
    id: number;
    name: string;
    display_name: string;
  };
  payment?: Record<string, unknown>;
  provider_error?: {
    code?: string | number;
    message?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  merchant_id: number;
  /** Present on new deposits — legacy opaque token; still accepted in `/pay/{token}`. */
  public_token?: string;
  /** Human-readable checkout code (e.g. DS20260402…); preferred for `/pay/{code}` and `payment_url`. */
  public_code?: string;
  /** Absolute URL to the merchant portal checkout page (when GoldPay has `MERCHANT_PORTAL_PUBLIC_URL` set). */
  payment_url?: string;
  provider_id?: number;
  type: TransactionType;
  amount: string;
  currency: string;
  status: TransactionStatus;
  external_id?: string | null;
  reference_id?: string | null;
  /**
   * GoldPay stores merchant-facing metadata as JSON.
   * Depending on the backend mapping, it may arrive as an object or a JSON string.
   */
  metadata?: Record<string, unknown> | string | null;
  /** Provider business error (e.g. DPay code/message) when the provider request fails. */
  provider_error?: { code?: string | number; message?: string } | null;
  /**
   * Deposit/payment instructions (bank QR/code, redirect URL, etc.) when the provider returns them.
   * Not present for withdrawals in most provider flows.
   */
  payment?: Record<string, unknown> | null;
  failure_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionDetails extends Transaction {
  merchant?: { id: number; name: string; email: string };
  provider?: { id: number; name: string; display_name: string };
  attempts?: { id: number; status: string; attempted_at: string }[];
}

export interface TransactionAttempt {
  id: number;
  transaction_id: number;
  status: string;
  attempted_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MerchantSessionUser {
  id: number;
  name: string;
  email: string;
  status: MerchantStatus;
  provider_id: number | null;
  phone?: string | null;
  username?: string | null;
  bio?: string | null;
}

export interface AuthLoginResponse {
  access_token: string;
}

export interface CreateMerchantBody {
  name: string;
  email: string;
  webhook_url?: string;
}

export interface AssignProviderBody {
  providerId: number;
}

export interface CreateTransactionBody {
  type: TransactionType;
  amount: number;
  currency?: string;
  reference_id?: string;
  idempotency_key?: string;
  metadata?: Record<string, unknown>;
  sandbox?: {
    outcome?: SandboxOutcome;
    delivery_mode?: SandboxDeliveryMode;
    delay_ms?: number;
  };
}

/** Transaction with merchant & provider (admin list) */
export interface TransactionWithRelations extends Transaction {
  merchant?: { id: number; name: string; email: string };
  provider?: { id: number; name: string; display_name: string };
}

export interface AdminTransactionFilters {
  page?: number;
  limit?: number;
  merchantId?: number;
  providerId?: number;
  status?: TransactionStatus;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  sandbox?: boolean;
}

export interface AppNotification {
  id: number;
  category: NotificationCategory;
  title: string;
  message: string;
  metadata: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  data: AppNotification[];
  unreadCount: number;
}

// ——— Merchant Funding API ———
export type MerchantBankListResponse =
  | {
      success: true;
      code: number | string;
      message?: string;
      data: Array<{ code: number | string; bank_name: string }>;
    }
  | {
      success: false;
      provider_error?: { code?: string | number; message?: string };
      raw?: unknown;
    };

export interface CreateFundingDepositBody {
  amount: number;
  currency?: string;
  reference_id?: string;
  idempotency_key?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateFundingWithdrawalBody {
  amount: number;
  currency?: string;
  reference_id?: string;
  idempotency_key?: string;
  metadata?: Record<string, unknown>;
}
