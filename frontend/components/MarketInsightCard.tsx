"use client";

import { useEffect, useState } from "react";

export interface MarketInsight {
  id: string;
  title: string;
  timestamp: string;
  sentiment: "bullish" | "bearish" | "neutral";
  confidenceScore: number;
  keyTakeaways: string[];
}

const DUMMY_INSIGHT: MarketInsight = {
  id: "insight-1",
  title: "Daily Market Intelligence & AI Macro Summary",
  timestamp: "Updated 15 mins ago • AI Market Engine",
  sentiment: "bullish",
  confidenceScore: 86,
  keyTakeaways: [
    "Federal Reserve rate cut expectations continue to fuel tech sector rally, lifting semiconductor and cloud computing benchmarks.",
    "Crude oil prices stabilize near $78/bbl following US commercial stockpile drawdowns and steady demand forecasts.",
    "Institutional inflows into broad-market ETFs hit a 3-month high as corporate earnings previews indicate resilient margins.",
    "Crypto asset class consolidates above key support levels with heightened volume in digital asset treasury reserves.",
  ],
};

export function MarketInsightCard() {
  const [insight, setInsight] = useState<MarketInsight>(DUMMY_INSIGHT);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    /*
    const fetchMarketInsight = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/market/ai-insights');
        if (!response.ok) {
          throw new Error('Failed to fetch AI market insights');
        }
        const data: MarketInsight = await response.json();
        setInsight(data);
      } catch (error) {
        console.error('Error fetching market insight:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketInsight();
    */
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2f6b4f]/30 via-emerald-500/20 to-teal-500/20 p-[1px] shadow-sm">
      <div className="rounded-2xl bg-[#fcfaf4] p-6 backdrop-blur-md dark:bg-[#121614]">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            {/* AI Sparkle Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#2f6b4f] to-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-xs dark:from-[#a7d48f] dark:to-emerald-400 dark:text-[#090b0a]">
              <svg
                className="h-3.5 w-3.5 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
              </svg>
              AI Insight
            </span>

            <h2 className="text-lg font-bold tracking-tight text-[#101410] dark:text-[#f6f3ea]">
              {insight.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Sentiment: {insight.sentiment.toUpperCase()} ({insight.confidenceScore}% confidence)
            </span>
            <span className="text-xs text-[#687063] dark:text-[#b4ad9f]">
              {insight.timestamp}
            </span>
          </div>
        </div>

        {/* Takeaways List */}
        <div className="mt-5 space-y-3">
          {insight.keyTakeaways.map((takeaway, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f6b4f]/15 text-[#2f6b4f] dark:bg-[#a7d48f]/20 dark:text-[#a7d48f]">
                <svg
                  className="h-3 w-3 fill-current"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm leading-relaxed text-[#3c423a] dark:text-[#d0cabf]">
                {takeaway}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MarketInsightCard;
