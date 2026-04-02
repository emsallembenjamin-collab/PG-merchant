"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PropsType = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function ShowcaseSection({ title, children, className }: PropsType) {
  return (
    <div className="merchant-card overflow-hidden">
      <h2 className="border-b border-line px-5 py-4 text-lg font-semibold text-ink dark:border-dark-3 dark:text-white sm:px-6 xl:px-7.5">
        {title}
      </h2>

      <div className={cn("p-4 sm:p-6 xl:p-10", className)}>{children}</div>
    </div>
  );
}
