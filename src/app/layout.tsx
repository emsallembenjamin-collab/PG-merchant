import "@/css/satoshi.css";
import "@/css/style.css";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import { AppShell } from "@/components/Layouts/app-shell";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s | GoldPay Merchant",
    default: "GoldPay Merchant",
  },
  description:
    "GoldPay merchant workspace for tracking transactions, payment history, settlements, and notification activity.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <NextTopLoader color="#5B6CFF" showSpinner={false} />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
