"use client";

import { getCurrentUser } from "@/lib/auth";
import MarketIndicesBar from "@/components/MarketIndicesBar";
import MarketInsightCard from "@/components/MarketInsightCard";
import MarketNewsFeed from "@/components/MarketNewsFeed";
import PortfolioNewsTicker from "@/components/PortfolioNewsTicker";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      const isKycCompleted = user?.kycCompleted ?? user?.kyc_completed ?? false;

      if (!user || !isKycCompleted) {
        router.replace("/login");
        return;
      }

      setHasAccess(true);
    }

    checkAuth();
  }, [router]);

  if (!hasAccess) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f2ea] text-[#101410] dark:bg-[#07111f] dark:text-[#f3f7fb]">
        <p className="text-sm text-[#4e574b] dark:text-[#a8bfd7]">Checking account access...</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f2ea] text-[#101410] dark:bg-[#07111f] dark:text-[#f3f7fb]">
      <PortfolioNewsTicker />
      <MarketIndicesBar />

      <main className="flex-1 p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section id="market-insights">
            <MarketInsightCard />
          </section>

          <section id="market-news">
            <MarketNewsFeed />
          </section>
        </div>
      </main>
    </div>
  );
}
