import { ArrowDownIcon, ArrowUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import type { JSX, SVGProps } from "react";

type PropsType = {
  label: string;
  data: {
    value: number | string;
    growthRate: number;
  };
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

export function OverviewCard({ label, data, Icon }: PropsType) {
  const isDecreasing = data.growthRate < 0;

  return (
    <div className="merchant-card p-6">
      <div className="flex items-start justify-between gap-4">
        <dl>
          <dd className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted dark:text-dark-6">
            {label}
          </dd>
          <dt className="text-heading-6 font-bold text-dark dark:text-white">
            {data.value}
          </dt>
        </dl>

        <div className="grid size-12 place-items-center rounded-2xl bg-[#FBF6EF] text-brand-gold dark:bg-dark-2 dark:text-yellow-light">
          <Icon className="size-6" />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="text-sm text-dark-6">Compared with previous period</span>

        <dl className={cn("text-sm font-semibold", isDecreasing ? "text-red" : "text-green")}>
          <dt className="flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1 dark:bg-dark-2">
            {data.growthRate}%
            {isDecreasing ? (
              <ArrowDownIcon aria-hidden />
            ) : (
              <ArrowUpIcon aria-hidden />
            )}
          </dt>

          <dd className="sr-only">
            {label} {isDecreasing ? "Decreased" : "Increased"} by{" "}
            {data.growthRate}%
          </dd>
        </dl>
      </div>
    </div>
  );
}
