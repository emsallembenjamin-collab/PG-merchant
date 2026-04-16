import { MerchantVisualPanel } from "@/components/merchant-visual-panel";
import { Suspense } from "react";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import { WalletCards } from "./_components/wallet-cards";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  await searchParams;

  return (
    <>

      {/* <MerchantVisualPanel variant="hero" /> */}

    <div className="flex flex-col gap-10">
        <WalletCards />

        <Suspense fallback={<OverviewCardsSkeleton />}>
          <OverviewCardsGroup />
        </Suspense>
    </div>
    </>
  );
}
