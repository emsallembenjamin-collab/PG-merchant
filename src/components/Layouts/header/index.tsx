"use client";

import { SearchIcon } from "@/assets/icons";
import { Logo } from "@/components/logo";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";
import { formatLedgerAmount } from "@/lib/format-ledger";

const PAGE_COPY = {
  "/": {
    title: "Dashboard",
    subtitle: "A bird eye view on your portfolio",
  },
  "/transactions": {
    title: "Transactions",
    subtitle: "Track payment flow, sandbox runs, and live activity",
  },
  "/history": {
    title: "History",
    subtitle: "Review payment records and status changes",
  },
  "/pages/settings": {
    title: "Settings",
    subtitle: "Manage your merchant profile and workspace preferences",
  },
} as const;

export function Header() {
  const { user } = useAuth();
  const { toggleSidebar, isMobile } = useSidebarContext();
  const pathname = usePathname();
  const pageCopy =
    PAGE_COPY[pathname as keyof typeof PAGE_COPY] ?? PAGE_COPY["/"];
  const balanceRows = user?.balances;

  return (
    <header className="sticky top-4 z-30 px-4 md:px-6 2xl:px-10">
      <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 rounded-[30px] border border-white/85 bg-white/88 px-4 py-4 shadow-card-2 backdrop-blur-xl dark:border-dark-3/80 dark:bg-[#08111F]/90 md:px-6">
        <button
          onClick={toggleSidebar}
          className="merchant-icon-button lg:hidden"
        >
          <MenuIcon className="size-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>

        {isMobile && (
          <Link href={"/"} className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
            <Logo compact />
          </Link>
        )}

        <div className="max-w-[19rem] max-xl:hidden">
          <h1 className="text-[1.9rem] font-black leading-none tracking-[-0.045em] text-[#151515] dark:text-white">
            {pageCopy.title}
          </h1>
          <p className="mt-1.5 text-[13px] font-medium tracking-[-0.01em] text-[#AEA39A] dark:text-dark-6">
            {pageCopy.subtitle}
          </p>
        </div>

        <div className="hidden flex-1 items-center justify-center xl:flex">
          <div className="merchant-card flex min-w-[290px] max-w-md flex-col gap-2 px-4 py-2.5">
            {balanceRows && balanceRows.length > 0 ? (
              balanceRows.map((row) => (
                <div key={row.currency} className="flex flex-col gap-0.5 border-b border-stroke/40 pb-2 last:border-0 last:pb-0 dark:border-dark-3/60">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-6 dark:text-dark-6">
                      {row.currency} total
                    </p>
                    <p className="shrink-0 text-[15px] font-bold tracking-[-0.03em] text-dark dark:text-white">
                      {formatLedgerAmount(row.balance_total, row.currency)}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-[11px] text-gray-6 dark:text-dark-6">
                    <span>
                      Avail{" "}
                      <span className="font-semibold text-dark dark:text-dark-5">
                        {formatLedgerAmount(row.balance_available, row.currency)}
                      </span>
                    </span>
                    <span>
                      Locked{" "}
                      <span className="font-semibold text-dark dark:text-dark-5">
                        {formatLedgerAmount(row.balance_locked, row.currency)}
                      </span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-6 dark:text-dark-6">
                    Total balance
                  </p>
                  <p className="shrink-0 text-[15px] font-bold tracking-[-0.03em] text-dark dark:text-white">
                    {formatLedgerAmount(user?.balance_total, user?.balance_currency)}
                  </p>
                </div>
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-[11px] text-gray-6 dark:text-dark-6">
                  <span>
                    Avail{" "}
                    <span className="font-semibold text-dark dark:text-dark-5">
                      {formatLedgerAmount(user?.balance_available, user?.balance_currency)}
                    </span>
                  </span>
                  <span>
                    Locked{" "}
                    <span className="font-semibold text-dark dark:text-dark-5">
                      {formatLedgerAmount(user?.balance_locked, user?.balance_currency)}
                    </span>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-3 xl:flex-none">
          <div className="relative w-full max-w-[300px] xl:max-w-[250px]">
            <input
              type="search"
              placeholder="Search transactions and history"
              className="merchant-input h-12 rounded-full border-white/70 bg-[#FCF9F3] pl-[50px] pr-5 text-[13px] font-medium shadow-card placeholder:text-[#B4A79A] dark:border-dark-3 dark:bg-dark-2"
            />

            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-[#8A7A61] max-[1015px]:size-5 dark:text-dark-6" />
          </div>

          <ThemeToggleSwitch />

          <Notification />

          <div className="shrink-0">
            <UserInfo />
          </div>
        </div>
      </div>
    </header>
  );
}
