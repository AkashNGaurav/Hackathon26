import PortfolioNewsTicker from "@/components/PortfolioNewsTicker";
import MarketIndicesBar from "@/components/MarketIndicesBar";
import MarketInsightCard from "@/components/MarketInsightCard";
import MarketNewsFeed from "@/components/MarketNewsFeed";

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

          {/* Main Section: Market News Feed & Grid */}
          <section id="market-news">
            <MarketNewsFeed />
          </section>
        </div>
      </main>
    </div>
  );
}
