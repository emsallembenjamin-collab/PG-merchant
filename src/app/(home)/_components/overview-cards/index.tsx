import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const { transactions, volume, successful, successRate } = await getOverviewData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Transactions (30d)"
        data={{
          ...transactions,
          value: compactFormat(transactions.value),
        }}
        Icon={icons.Views}
      />

      <OverviewCard
        label="Volume (30d)"
        data={{
          ...volume,
          value: "$" + compactFormat(volume.value),
        }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Successful (30d)"
        data={{
          ...successful,
          value: compactFormat(successful.value),
        }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Success Rate"
        data={{
          ...successRate,
          value: `${successRate.value}%`,
        }}
        Icon={icons.Users}
      />
    </div>
  );
}
