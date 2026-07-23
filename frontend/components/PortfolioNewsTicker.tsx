"use client";

import { useEffect, useState } from "react";

export interface NewsItem {
  id: string;
  symbol: string;
  headline: string;
  sentiment: "positive" | "neutral" | "negative";
}

const DUMMY_NEWS: NewsItem[] = [
  {
    id: "1",
    symbol: "AAPL",
    headline: "AAPL up 2.4% following record Q3 services revenue and new AI capabilities announcement",
    sentiment: "positive",
  },
  {
    id: "2",
    symbol: "S&P 500",
    headline: "S&P 500 flat ahead of upcoming Federal Reserve interest rate decision",
    sentiment: "neutral",
  },
  {
    id: "3",
    symbol: "NVDA",
    headline: "NVDA rallies 3.8% on surging demand for next-generation enterprise AI chips",
    sentiment: "positive",
  },
  {
    id: "4",
    symbol: "TSLA",
    headline: "TSLA down 1.5% amid European market supply chain adjustments",
    sentiment: "negative",
  },
  {
    id: "5",
    symbol: "MSFT",
    headline: "MSFT expands cloud infrastructure partnership with healthcare industry leaders",
    sentiment: "positive",
  },
];

export function PortfolioNewsTicker() {
  const [news, setNews] = useState<NewsItem[]>(DUMMY_NEWS);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    /*
    const fetchPortfolioNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/news/portfolio');
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio news');
        }
        const data: NewsItem[] = await response.json();
        setNews(data);
      } catch (error) {
        console.error('Error fetching portfolio news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioNews();
    */
  }, []);

  const getSentimentDetails = (sentiment: NewsItem["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return {
          badgeClass: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
          icon: "▲",
          label: "positive",
        };
      case "negative":
        return {
          badgeClass: "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/25",
          icon: "▼",
          label: "negative",
        };
      case "neutral":
      default:
        return {
          badgeClass: "text-zinc-700 dark:text-zinc-300 bg-zinc-500/10 border-zinc-500/25",
          icon: "▶",
          label: "neutral",
        };
    }
  };

  return (
    <div className="relative w-full overflow-hidden border-b border-black/10 bg-[#eae6d9] py-2.5 dark:border-white/10 dark:bg-[#121614] select-none">
      <div className="flex items-center">
        {/* Ticker Header Badge */}
        <div className="z-10 flex shrink-0 items-center gap-2 bg-[#eae6d9] px-4 py-0.5 dark:bg-[#121614] border-r border-black/10 dark:border-white/10 font-semibold text-xs tracking-wider uppercase text-[#516246] dark:text-[#a7d48f]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          Sliding News
        </div>

        {/* Continuous Marquee Ticker */}
        <div className="relative flex overflow-hidden w-full">
          <div className="animate-marquee flex shrink-0 items-center gap-8 pl-4">
            {/* Render duplicated list for seamless looping */}
            {[...news, ...news].map((item, index) => {
              const sentimentInfo = getSentimentDetails(item.sentiment);
              return (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center gap-2.5 text-sm whitespace-nowrap"
                >
                  <span className="font-bold text-xs px-2 py-0.5 rounded border bg-white/70 text-[#101410] dark:bg-[#1a1f1c] dark:text-[#f6f3ea] border-black/10 dark:border-white/10">
                    {item.symbol}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-medium text-xs px-2 py-0.5 rounded border ${sentimentInfo.badgeClass}`}
                  >
                    <span>{sentimentInfo.icon}</span>
                    <span className="capitalize">{sentimentInfo.label}</span>
                  </span>
                  <span className="text-[#3c423a] dark:text-[#d0cabf]">
                    {item.headline}
                  </span>
                  <span className="mx-2 text-black/20 dark:text-white/20">•</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioNewsTicker;
