"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type PropsWithChildren } from "react";

function isAuthRoute(pathname: string | null) {
  return pathname?.startsWith("/auth") ?? false;
}

function isPublicPayRoute(pathname: string | null) {
  return pathname?.startsWith("/pay/") ?? false;
}

export function AuthGate({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const onAuthRoute = isAuthRoute(pathname);
  const onPublicPayRoute = isPublicPayRoute(pathname);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated && !onAuthRoute && !onPublicPayRoute) {
      router.replace("/auth/sign-in");
      return;
    }

    if (isAuthenticated && onAuthRoute) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, onAuthRoute, onPublicPayRoute, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-2 dark:bg-[#020d1a]">
        <div className="text-sm font-medium text-dark dark:text-white">
          Checking merchant session...
        </div>
      </div>
    );
  }

  if (
    (!isAuthenticated && !onAuthRoute && !onPublicPayRoute) ||
    (isAuthenticated && onAuthRoute)
  ) {
    return null;
  }

  return <>{children}</>;
}
