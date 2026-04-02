import "server-only";

import * as logos from "@/assets/logos";
import { AUTH_TOKEN_KEY, GOLDPAY_API_BASE } from "@/lib/goldpay-api/config";
import type { PaginatedResponse, Transaction } from "@/lib/goldpay-api/types";
import { cookies } from "next/headers";
import { cache } from "react";

type DashboardMetadata = {
  dashboard?: {
    channel?: string;
    device?: string;
    visitors?: number;
    fee_amount?: number;
  };
};

type DayChartPoint = {
  x: string;
  y: number;
};

type EnrichedTransaction = Transaction & {
  parsedMetadata: DashboardMetadata;
};

type TopChannelRow = {
  name: string;
  visitors: number;
  revenues: number;
  sales: number;
  conversion: number;
  logo: typeof logos.google;
};

type OverviewMetric = {
  value: number;
  growthRate: number;
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CHANNEL_LOGOS: Record<string, typeof logos.google> = {
  Google: logos.google,
  Facebook: logos.facebook,
  Github: logos.github,
  "X.com": logos.x,
  Vimeo: logos.vimeo,
};
const DEVICE_ORDER = ["Desktop", "Mobile", "Tablet", "Unknown"] as const;

function parseMetadata(metadata: unknown): DashboardMetadata {
  if (!metadata) {
    return {};
  }

  try {
    const parsed =
      typeof metadata === "string" ? JSON.parse(metadata) : metadata;
    return parsed && typeof parsed === "object" ? (parsed as DashboardMetadata) : {};
  } catch {
    return {};
  }
}

function amountOf(transaction: Transaction): number {
  return Number(transaction.amount ?? 0);
}

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return round(((current - previous) / previous) * 100);
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isBetween(date: Date, start: Date, end: Date): boolean {
  return date >= start && date < end;
}

async function requestMerchantApi<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  const credential = cookieStore.get(AUTH_TOKEN_KEY)?.value;

  if (!credential) {
    return null;
  }

  const response = await fetch(`${GOLDPAY_API_BASE}/${path.replace(/^\//, "")}`, {
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": credential,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<T>;
}

export const getMerchantTransactions = cache(async (): Promise<EnrichedTransaction[]> => {
  const firstPage = await requestMerchantApi<PaginatedResponse<Transaction>>("transactions?page=1&limit=100");
  if (!firstPage) {
    return [];
  }

  const transactions = [...firstPage.data];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const nextPage = await requestMerchantApi<PaginatedResponse<Transaction>>(
      `transactions?page=${page}&limit=100`,
    );

    if (!nextPage) {
      break;
    }

    transactions.push(...nextPage.data);
  }

  return transactions.map((transaction) => ({
    ...transaction,
    parsedMetadata: parseMetadata(transaction.metadata),
  }));
});

export const getOverviewMetrics = cache(async (): Promise<{
  transactions: OverviewMetric;
  volume: OverviewMetric;
  successful: OverviewMetric;
  successRate: OverviewMetric;
}> => {
  const transactions = await getMerchantTransactions();
  const today = startOfDay(new Date());
  const currentStart = addDays(today, -29);
  const currentEnd = addDays(today, 1);
  const previousStart = addDays(currentStart, -30);

  const currentPeriod = transactions.filter((transaction) =>
    isBetween(new Date(transaction.created_at), currentStart, currentEnd),
  );
  const previousPeriod = transactions.filter((transaction) =>
    isBetween(new Date(transaction.created_at), previousStart, currentStart),
  );

  const currentTotal = currentPeriod.length;
  const previousTotal = previousPeriod.length;
  const currentVolume = currentPeriod.reduce((sum, transaction) => sum + amountOf(transaction), 0);
  const previousVolume = previousPeriod.reduce((sum, transaction) => sum + amountOf(transaction), 0);
  const currentSuccessful = currentPeriod.filter((transaction) => transaction.status === "succeeded").length;
  const previousSuccessful = previousPeriod.filter((transaction) => transaction.status === "succeeded").length;
  const currentSuccessRate = currentTotal === 0 ? 0 : (currentSuccessful / currentTotal) * 100;
  const previousSuccessRate = previousTotal === 0 ? 0 : (previousSuccessful / previousTotal) * 100;

  return {
    transactions: {
      value: currentTotal,
      growthRate: calculateGrowthRate(currentTotal, previousTotal),
    },
    volume: {
      value: round(currentVolume),
      growthRate: calculateGrowthRate(currentVolume, previousVolume),
    },
    successful: {
      value: currentSuccessful,
      growthRate: calculateGrowthRate(currentSuccessful, previousSuccessful),
    },
    successRate: {
      value: round(currentSuccessRate),
      growthRate: calculateGrowthRate(currentSuccessRate, previousSuccessRate),
    },
  };
});

export const getPaymentsOverview = cache(async (timeFrame?: string) => {
  const transactions = await getMerchantTransactions();

  if (timeFrame === "yearly") {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, index) => currentYear - 4 + index);

    return {
      received: years.map((year) => ({
        x: year,
        y: round(
          transactions
            .filter(
              (transaction) =>
                new Date(transaction.created_at).getFullYear() === year &&
                transaction.status === "succeeded",
            )
            .reduce((sum, transaction) => sum + amountOf(transaction), 0),
        ),
      })),
      due: years.map((year) => ({
        x: year,
        y: round(
          transactions
            .filter((transaction) => {
              const createdAt = new Date(transaction.created_at);
              return (
                createdAt.getFullYear() === year &&
                (transaction.status === "pending" || transaction.status === "processing")
              );
            })
            .reduce((sum, transaction) => sum + amountOf(transaction), 0),
        ),
      })),
    };
  }

  const currentYear = new Date().getFullYear();
  const emptySeries = MONTH_LABELS.map((label) => ({ x: label, y: 0 }));
  const received = [...emptySeries];
  const due = [...emptySeries];

  for (const transaction of transactions) {
    const createdAt = new Date(transaction.created_at);
    if (createdAt.getFullYear() !== currentYear) {
      continue;
    }

    const monthIndex = createdAt.getMonth();
    const amount = amountOf(transaction);

    if (transaction.status === "succeeded") {
      received[monthIndex] = { x: MONTH_LABELS[monthIndex], y: round(received[monthIndex].y + amount) };
    }

    if (transaction.status === "pending" || transaction.status === "processing") {
      due[monthIndex] = { x: MONTH_LABELS[monthIndex], y: round(due[monthIndex].y + amount) };
    }
  }

  return { received, due };
});

export const getWeeklyProfit = cache(async (timeFrame?: string) => {
  const transactions = await getMerchantTransactions();
  const rangeEnd = startOfDay(new Date());
  const end = timeFrame === "last week" ? addDays(rangeEnd, -6) : addDays(rangeEnd, 1);
  const start = addDays(end, -7);
  const labels = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(start, index);
    return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(day);
  });

  const sales: DayChartPoint[] = labels.map((label) => ({ x: label, y: 0 }));
  const revenue: DayChartPoint[] = labels.map((label) => ({ x: label, y: 0 }));

  for (const transaction of transactions) {
    const createdAt = new Date(transaction.created_at);
    if (!isBetween(createdAt, start, end)) {
      continue;
    }

    const dayIndex = Math.floor(
      (startOfDay(createdAt).getTime() - startOfDay(start).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (dayIndex < 0 || dayIndex > 6) {
      continue;
    }

    const amount = amountOf(transaction);
    const feeAmount = Number(transaction.parsedMetadata.dashboard?.fee_amount ?? 0);

    if (transaction.status === "succeeded") {
      sales[dayIndex] = { x: sales[dayIndex].x, y: round(sales[dayIndex].y + amount) };
      revenue[dayIndex] = { x: revenue[dayIndex].x, y: round(revenue[dayIndex].y + feeAmount) };
    }
  }

  return { sales, revenue };
});

export const getDeviceBreakdown = cache(async (timeFrame?: string) => {
  const transactions = await getMerchantTransactions();
  const now = new Date();
  const windowStart = addDays(now, timeFrame === "yearly" ? -365 : -30);
  const deviceCounts = new Map<string, number>();

  for (const device of DEVICE_ORDER) {
    deviceCounts.set(device, 0);
  }

  for (const transaction of transactions) {
    const createdAt = new Date(transaction.created_at);
    if (!isBetween(createdAt, windowStart, addDays(now, 1))) {
      continue;
    }

    const device = transaction.parsedMetadata.dashboard?.device ?? "Unknown";
    deviceCounts.set(device, (deviceCounts.get(device) ?? 0) + 1);
  }

  return Array.from(deviceCounts.entries())
    .map(([name, amount]) => ({ name, amount }))
    .filter((entry) => entry.amount > 0);
});

export const getChannelPerformance = cache(async (): Promise<TopChannelRow[]> => {
  const transactions = await getMerchantTransactions();
  const grouped = new Map<
    string,
    { visitors: number; revenues: number; sales: number; logo: string }
  >();

  for (const transaction of transactions) {
    const channel = transaction.parsedMetadata.dashboard?.channel ?? "Google";
    const current = grouped.get(channel) ?? {
      visitors: 0,
      revenues: 0,
      sales: 0,
      logo: CHANNEL_LOGOS[channel] ?? logos.google,
    };

    current.visitors += Number(transaction.parsedMetadata.dashboard?.visitors ?? 1);
    current.sales += 1;

    if (transaction.status === "succeeded") {
      current.revenues += amountOf(transaction);
    }

    grouped.set(channel, current);
  }

  return Array.from(grouped.entries())
    .map(([name, values]) => ({
      name,
      visitors: values.visitors,
      revenues: round(values.revenues),
      sales: values.sales,
      conversion: values.visitors === 0 ? 0 : round((values.sales / values.visitors) * 100),
      logo: values.logo,
    }))
    .sort((left, right) => right.revenues - left.revenues)
    .slice(0, 5);
});
