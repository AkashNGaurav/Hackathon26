import PortfolioNewsTicker from "@/components/PortfolioNewsTicker";
import MarketIndicesBar from "@/components/MarketIndicesBar";
import MarketInsightCard from "@/components/MarketInsightCard";
import MarketNewsFeed from "@/components/MarketNewsFeed";
import EUMarketTable from "@/components/EUMarketTable";
<<<<<<< HEAD
import PortfolioNewsTicker from "@/components/PortfolioNewsTicker";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
=======
>>>>>>> 63d58b2 (feat: implement backend Pydantic schemas and frontend ETF dashboard with market data integration)

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f2ea] text-[#101410] dark:bg-[#090b0a] dark:text-[#f6f3ea]">
      {/* 1. Portfolio News Ticker at top */}
      <PortfolioNewsTicker />

      {/* 2. Market Indices Quick-Stat Bar */}
      <MarketIndicesBar />

      {/* 3. Main Dashboard Content Area */}
      <main className="flex-1 p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Top Section: AI Market Insight Summary */}
          <section id="market-insights">
            <MarketInsightCard />
          </section>

          {/* Live EU Market Assets Table */}
          <section id="eu-markets">
            <EUMarketTable />
          </section>

          {/* Market News Feed & Grid */}
          <section id="market-news">
            <MarketNewsFeed />
          </section>
        </div>
      </main>
    </div>
  );
}
