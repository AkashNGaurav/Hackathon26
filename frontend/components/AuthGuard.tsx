"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken } from "@/lib/auth";
import { Spinner } from "flowbite-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsAuthenticated(false);
      setChecking(false);
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
      setChecking(false);
    }
  }, [router, pathname]);

  if (checking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f2ea] dark:bg-[#090b0a] text-[#101410] dark:text-[#f6f3ea]">
        <Spinner size="xl" color="success" />
        <p className="mt-4 text-xs sm:text-sm font-semibold text-[#5c6457] dark:text-[#b4ad9f] animate-pulse">
          Verifying security & authentication session...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthGuard;
