import Signin from "@/components/Auth/Signin";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Logo } from "@/components/logo";
import { MerchantVisualPanel } from "@/components/merchant-visual-panel";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Merchant Sign In",
};

export default function SignIn() {
  return (
    <>
      <Breadcrumb pageName="Merchant Sign In" />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)] xl:items-center">
        <div className="w-full">
          <div className="goldpay-panel w-full p-4 sm:p-12.5 xl:p-15">
            <Signin />
          </div>
        </div>

        <div className="hidden w-full xl:block">
          <div className="px-4 sm:px-6 xl:px-10">
            <Link className="mb-10 inline-block" href="/">
              <Logo />
            </Link>
            <p className="mb-3 text-xl font-medium text-dark dark:text-white">
              Payment Service Merchant
            </p>

            <h1 className="mb-4 text-2xl font-bold text-dark dark:text-white sm:text-heading-3">
              Track your GoldPay transactions
            </h1>

            <p className="w-full max-w-[375px] font-medium text-dark-4 dark:text-dark-6">
              Use your merchant API key to review transaction activity,
              settlement updates, and notifications.
            </p>

            <div className="mt-10 max-w-[44rem]">
              <MerchantVisualPanel variant="hero" className="border-0 bg-transparent shadow-none" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
