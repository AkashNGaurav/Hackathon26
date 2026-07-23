"use client";

import { useEffect, useState } from "react";
import { Badge } from "flowbite-react";

export interface MarketIndexItem {
  id: string;
  name: string;
  symbol: string;
  currentValue: string;
  priceChange: string;
  percentageChange: string;
  isPositive: boolean;
}

const DUMMY_INDICES: MarketIndexItem[] = [
  {
    id: "1",
    name: "STOXX Europe 600",
    symbol: "^STOXX",
    currentValue: "€515.35",
    priceChange: "+3.12",
    percentageChange: "+0.61%",
    isPositive: true,
  },
  {
    id: "2",
    name: "CAC 40 Paris",
    symbol: "^FCHI",
    currentValue: "€7,580.20",
    priceChange: "+45.30",
    percentageChange: "+0.60%",
    isPositive: true,
  },
  {
    id: "3",
    name: "DAX Germany",
    symbol: "^GDAXI",
    currentValue: "€18,420.10",
    priceChange: "+98.40",
    percentageChange: "+0.54%",
    isPositive: true,
  },
  {
    id: "4",
    name: "AEX Amsterdam",
    symbol: "^AEX",
    currentValue: "€912.45",
    priceChange: "+5.60",
    percentageChange: "+0.62%",
    isPositive: true,
  },
  {
    id: "5",
    name: "FTSE 100 (EUR)",
    symbol: "^FTSE",
    currentValue: "€9,640.00",
    priceChange: "-12.50",
    percentageChange: "-0.13%",
    isPositive: false,
  },
];

export function MarketIndicesBar() {
  const [indices, setIndices] = useState<MarketIndexItem[]>(DUMMY_INDICES);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    /*
    const fetchMarketIndices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/market/indices');
        if (!response.ok) {
          throw new Error('Failed to fetch market indices');
        }
        const data: MarketIndexItem[] = await response.json();
        setIndices(data);
      } catch (error) {
        console.error('Error fetching market indices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketIndices();
    */
  }, []);

  return (
    <div className="w-full border-b border-black/10 bg-[#f8f5ee]/80 py-3 dark:border-white/10 dark:bg-[#0e1210]">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#516246] dark:text-[#a7d48f]">
            Major Market Indices
          </span>
          <span className="text-xs text-[#5c6457] dark:text-[#b4ad9f]">
            Real-time Overview
          </span>
        </div>

        {/* Scrollable indices row */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1 scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10">
          {indices.map((item) => (
            <div
              key={item.id}
              className="flex shrink-0 min-w-[185px] items-center justify-between rounded-xl border border-black/10 bg-white/80 p-3 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#151816]"
            >
              <div>
                <p className="text-xs font-semibold text-[#4e574b] dark:text-[#c8c3b7]">
                  {item.name}
                </p>
                <p className="mt-0.5 text-base font-bold text-[#101410] dark:text-[#f6f3ea]">
                  {item.currentValue}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                {item.isPositive ? (
                  <Badge color="success" className="px-2 py-0.5 text-xs font-medium">
                    <span className="mr-0.5">▲</span> {item.percentageChange}
                  </Badge>
                ) : (
                  <Badge color="failure" className="px-2 py-0.5 text-xs font-medium">
                    <span className="mr-0.5">▼</span> {item.percentageChange}
                  </Badge>
                )}
                <span className="text-[11px] text-[#687063] dark:text-[#b4ad9f]">
                  {item.priceChange}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MarketIndicesBar;
