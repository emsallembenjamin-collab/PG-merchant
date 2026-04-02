import { cn } from "@/lib/utils";

type MerchantVisualPanelProps = {
  variant: "hero" | "sandbox";
  className?: string;
};

const copy = {
  hero: {
    badge: "Merchant Flow",
    title: "Keep every payment touchpoint visible.",
    body: "A clearer merchant workspace for transaction monitoring, settlement updates, and day-to-day payment review.",
  },
  sandbox: {
    badge: "Sandbox Lab",
    title: "Simulate payment outcomes before going live.",
    body: "Create test flows, review callback behavior, and validate merchant webhook handling from one place.",
  },
} as const;

export function MerchantVisualPanel({
  variant,
  className,
}: MerchantVisualPanelProps) {
  const content = copy[variant];
  const isHero = variant === "hero";

  return (
    <section
      className={cn(
        "merchant-card relative mb-8 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,91,255,0.16),transparent_22%),radial-gradient(circle_at_left_center,rgba(216,164,77,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(250,245,237,0.9))]" />

      <div className="relative z-10 grid gap-8 p-6 md:p-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(320px,1.08fr)] xl:items-center">
        <div className="max-w-[30rem]">
          <span className="inline-flex rounded-full border border-white/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary shadow-card dark:border-dark-3 dark:bg-dark/80 dark:text-white">
            {content.badge}
          </span>
          <h2 className="mt-5 text-[2rem] font-bold leading-tight tracking-[-0.03em] text-dark dark:text-white">
            {content.title}
          </h2>
          <p className="mt-3 text-base leading-7 text-dark-4 dark:text-dark-6">
            {content.body}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="merchant-status-pill merchant-status-pill-success">
              {isHero ? "live visibility" : "test safe"}
            </span>
            <span className="merchant-status-pill merchant-status-pill-neutral">
              {isHero ? "settlement ready" : "callback ready"}
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-brand-gold/10 via-transparent to-primary/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[30px] border border-white/80 bg-[#FCF8F1] p-3 shadow-card-2 dark:border-dark-3 dark:bg-dark-2">
            <div className="rounded-[24px] border border-white/80 bg-[linear-gradient(135deg,#fffaf4_0%,#f8f4ed_42%,#eef1ff_100%)] p-5 dark:border-dark-3 dark:bg-[linear-gradient(135deg,#101828_0%,#111c2d_55%,#1b2d4a_100%)]">
              <div className="flex items-center justify-between rounded-[22px] border border-white/70 bg-white/92 px-4 py-3 shadow-card dark:border-dark-3 dark:bg-dark/80">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                    {isHero ? "Live Overview" : "Test Session"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {isHero ? "Merchant operations" : "Webhook simulator"}
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    isHero
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
                  )}
                >
                  {isHero ? "Healthy" : "Sandbox"}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[22px] border border-white/70 bg-white/92 p-4 shadow-card dark:border-dark-3 dark:bg-dark/80">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted dark:text-dark-6">
                        {isHero ? "Processed volume" : "Scenario runs"}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                        {isHero ? "$248.4k" : "128"}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                      {isHero ? "+12.8%" : "+18 today"}
                    </p>
                  </div>

                  <div className="mt-5 flex h-28 items-end gap-2">
                    {[36, 52, 48, 76, 68, 88, 96].map((height, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex-1 rounded-t-[18px]",
                          isHero
                            ? "bg-gradient-to-t from-brand-gold via-[#EDC675] to-[#F5E0AE]"
                            : "bg-gradient-to-t from-primary via-[#8A80FF] to-[#B9B4FF]",
                        )}
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {(isHero
                    ? [
                        ["Settlements queued", "14"],
                        ["Disputes open", "2"],
                        ["Success rate", "98.4%"],
                      ]
                    : [
                        ["Callbacks verified", "24"],
                        ["Failure cases", "6"],
                        ["Average latency", "182ms"],
                      ]).map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[22px] border border-white/70 bg-white/92 p-4 shadow-card dark:border-dark-3 dark:bg-dark/80"
                    >
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted dark:text-dark-6">
                        {label}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
