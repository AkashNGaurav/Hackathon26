"use client";

import React, { useState, useEffect, FormEvent, useMemo } from "react";
import { Spinner, TextInput, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Alert, Badge } from "flowbite-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Award, Briefcase, Globe, Info } from "lucide-react";

export interface EUAssetItem {
  symbol: string;
  name: string;
  asset_type: string;
  exchange: string;
  currency: string;
  current_price: number;
  nav?: number | null;
  previous_close?: number | null;
  day_high?: number | null;
  day_low?: number | null;
  volume?: number | null;
  price_change: number;
  percentage_change: number;
  is_positive: boolean;
  market_status: string;
}

export interface AssetHistoryData {
  date: string;
  price: number;
}

export interface AssetProfileData {
  sector?: string;
  industry?: string;
  website?: string;
  market_cap?: number;
  business_summary?: string;
}

const DEFAULT_STOCKS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"];

export default function StocksPage() {
  const [stocks, setStocks] = useState<EUAssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Expandable Row State
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<Record<string, AssetHistoryData[]>>({});
  const [profileData, setProfileData] = useState<Record<string, AssetProfileData>>({});
  const [detailsLoading, setDetailsLoading] = useState<Record<string, boolean>>({});

  const fetchStock = async (symbol: string): Promise<EUAssetItem> => {
    const res = await fetch(`http://localhost:8000/api/market/${symbol}`);
    if (!res.ok) throw new Error(`Failed to fetch ${symbol}`);
    return await res.json();
  };

  useEffect(() => {
    const fetchInitialStocks = async () => {
      setLoading(true);
      try {
        const fetchedStocks = await Promise.all(
          DEFAULT_STOCKS.map((ticker) => fetchStock(ticker))
        );
        setStocks(fetchedStocks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialStocks();
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    if (stocks.some(s => s.symbol.toUpperCase() === searchQuery.toUpperCase())) {
      setSearchQuery("");
      return;
    }

    setSearchLoading(true);
    setError(null);
    try {
      const newStock = await fetchStock(searchQuery);
      setStocks((prev) => [newStock, ...prev]);
      setSearchQuery("");
    } catch (err) {
      setError(`Could not find stock symbol: ${searchQuery}. Please try a valid Yahoo Finance ticker.`);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRowClick = async (symbol: string) => {
    if (expandedRow === symbol) {
      setExpandedRow(null); // Collapse if already open
      return;
    }
    setExpandedRow(symbol);
    
    // Only fetch if we haven't already
    if (!historyData[symbol] || !profileData[symbol]) {
      setDetailsLoading(prev => ({ ...prev, [symbol]: true }));
      try {
        const [histRes, profRes] = await Promise.all([
          fetch(`http://localhost:8000/api/market/${symbol}/history`),
          fetch(`http://localhost:8000/api/market/${symbol}/profile`)
        ]);
        
        if (histRes.ok && profRes.ok) {
          const hist = await histRes.json();
          const prof = await profRes.json();
          setHistoryData(prev => ({ ...prev, [symbol]: hist }));
          setProfileData(prev => ({ ...prev, [symbol]: prof }));
        }
      } catch (err) {
        console.error("Failed to fetch detailed data", err);
      } finally {
        setDetailsLoading(prev => ({ ...prev, [symbol]: false }));
      }
    }
  };

  // Compute Highlights
  const { stockOfTheDay, topGainers, topLosers } = useMemo(() => {
    if (stocks.length === 0) return { stockOfTheDay: null, topGainers: [], topLosers: [] };
    
    const sorted = [...stocks].sort((a, b) => b.percentage_change - a.percentage_change);
    const gainers = sorted.filter(s => s.is_positive).slice(0, 3);
    const losers = [...stocks].filter(s => !s.is_positive).sort((a, b) => a.percentage_change - b.percentage_change).slice(0, 3);
    
    return {
      stockOfTheDay: sorted[0], // Highest positive change
      topGainers: gainers,
      topLosers: losers,
    };
  }, [stocks]);

  return (
    <div className="p-8 max-w-[90rem] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#101410] dark:text-[#f6f3ea]">Stocks & Equities</h1>
        <p className="mt-2 text-sm text-[#5c6457] dark:text-[#b4ad9f]">
          Real-time price tracking, historical trends, and company profile analysis powered by Yahoo Finance.
        </p>
      </div>

      {/* Stock of the Day & Highlights Grid */}
      {stockOfTheDay && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stock of the Day */}
          <div className="md:col-span-1 rounded-2xl border border-black/10 bg-gradient-to-br from-[#2f6b4f]/10 to-[#2f6b4f]/5 p-6 backdrop-blur-sm dark:border-white/10 dark:from-[#a7d48f]/10 dark:to-[#a7d48f]/5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2f6b4f] dark:text-[#a7d48f] mb-3">
              <Award className="w-4 h-4" /> Stock of the Day
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stockOfTheDay.symbol}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{stockOfTheDay.name}</p>
              </div>
              <Badge color={stockOfTheDay.is_positive ? "success" : "failure"} className="text-sm font-bold">
                {stockOfTheDay.is_positive ? "+" : ""}{stockOfTheDay.percentage_change}%
              </Badge>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">${stockOfTheDay.current_price}</span>
              <span className="text-xs text-gray-500">{stockOfTheDay.currency}</span>
            </div>
          </div>

          {/* Top Gainers */}
          <div className="rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
              <TrendingUp className="w-4 h-4" /> Top Gainers
            </div>
            <div className="space-y-3">
              {topGainers.map((s) => (
                <div key={s.symbol} className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-800 dark:text-gray-200">{s.symbol}</span>
                  <span className="text-xs text-gray-500">${s.current_price}</span>
                  <Badge color="success">+{s.percentage_change}%</Badge>
                </div>
              ))}
              {topGainers.length === 0 && <p className="text-xs text-gray-400">No gainers today</p>}
            </div>
          </div>

          {/* Top Losers */}
          <div className="rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-3">
              <TrendingDown className="w-4 h-4" /> Top Losers
            </div>
            <div className="space-y-3">
              {topLosers.map((s) => (
                <div key={s.symbol} className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-800 dark:text-gray-200">{s.symbol}</span>
                  <span className="text-xs text-gray-500">${s.current_price}</span>
                  <Badge color="failure">{s.percentage_change}%</Badge>
                </div>
              ))}
              {topLosers.length === 0 && <p className="text-xs text-gray-400">No losers today</p>}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-4 max-w-lg">
        <div className="flex-1">
          <TextInput
            type="text"
            placeholder="Search stock ticker (e.g. TSLA, NFLX, MU)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={searchLoading} className="bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a]">
          {searchLoading ? <Spinner size="sm" /> : "Search Ticker"}
        </Button>
      </form>

      {error && <Alert color="failure">{error}</Alert>}

      {/* Stock Table */}
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/60 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80">
        <Table hoverable className="w-full text-left">
          <TableHead className="bg-[#f8f5ea] dark:bg-[#1a201c] text-[#5c6457] dark:text-[#a7c1b1]">
            <TableRow>
              <TableHeadCell>Symbol / Name</TableHeadCell>
              <TableHeadCell>Exchange</TableHeadCell>
              <TableHeadCell>Current Price</TableHeadCell>
              <TableHeadCell>Change ($)</TableHeadCell>
              <TableHeadCell>Change (%)</TableHeadCell>
              <TableHeadCell>Day Range</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y divide-black/5 dark:divide-white/5">
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Spinner size="lg" />
                  <p className="mt-2 text-sm text-gray-500">Fetching live market data...</p>
                </TableCell>
              </TableRow>
            ) : stocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No stocks found. Try searching for a ticker symbol above.
                </TableCell>
              </TableRow>
            ) : (
              stocks.map((stock) => (
                <React.Fragment key={stock.symbol}>
                  <TableRow 
                    onClick={() => handleRowClick(stock.symbol)}
                    className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <TableCell className="whitespace-nowrap font-bold text-gray-900 dark:text-white">
                      <div>{stock.symbol}</div>
                      <div className="text-xs font-normal text-gray-500 dark:text-gray-400 line-clamp-1">{stock.name}</div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 dark:text-gray-300">{stock.exchange}</TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-white">
                      ${stock.current_price} <span className="text-[10px] text-gray-400">{stock.currency}</span>
                    </TableCell>
                    <TableCell className={stock.is_positive ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                      {stock.is_positive ? "+" : ""}{stock.price_change}
                    </TableCell>
                    <TableCell>
                      <Badge color={stock.is_positive ? "success" : "failure"} className="w-fit">
                        {stock.is_positive ? "+" : ""}{stock.percentage_change}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {stock.day_low && stock.day_high ? `$${stock.day_low} - $${stock.day_high}` : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge color="info">{stock.market_status}</Badge>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row Content */}
                  {expandedRow === stock.symbol && (
                    <TableRow className="bg-black/[0.02] dark:bg-white/[0.02]">
                      <TableCell colSpan={7} className="p-6">
                        {detailsLoading[stock.symbol] ? (
                          <div className="flex items-center justify-center py-6 gap-3">
                            <Spinner size="md" />
                            <span className="text-sm text-gray-500">Loading charts & company profile...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Price Chart */}
                            <div className="lg:col-span-2 bg-white dark:bg-[#1a201c] p-4 rounded-xl border border-black/10 dark:border-white/10">
                              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-[#2f6b4f] dark:text-[#a7d48f]" />
                                30-Day Historical Price Trend
                              </h4>
                              <div className="h-64 w-full">
                                {historyData[stock.symbol] && historyData[stock.symbol].length > 0 ? (
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={historyData[stock.symbol]}>
                                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                                      <Tooltip 
                                        contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                                        formatter={(val: any) => [`$${val}`, 'Price']}
                                      />
                                      <Line 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke={stock.is_positive ? "#10b981" : "#ef4444"} 
                                        strokeWidth={2}
                                        dot={false}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                    No historical data available.
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Profile Info */}
                            <div className="bg-white dark:bg-[#1a201c] p-4 rounded-xl border border-black/10 dark:border-white/10 space-y-4">
                              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-[#2f6b4f] dark:text-[#a7d48f]" />
                                Company Profile
                              </h4>
                              
                              {profileData[stock.symbol] ? (
                                <div className="space-y-3 text-xs">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="text-gray-400">Sector</span>
                                      <p className="font-semibold text-gray-800 dark:text-gray-200">{profileData[stock.symbol].sector || "N/A"}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Industry</span>
                                      <p className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{profileData[stock.symbol].industry || "N/A"}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Market Cap</span>
                                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                                        {profileData[stock.symbol].market_cap 
                                          ? `$${(profileData[stock.symbol].market_cap! / 1e9).toFixed(2)}B` 
                                          : "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Website</span>
                                      {profileData[stock.symbol].website ? (
                                        <a href={profileData[stock.symbol].website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                          <Globe className="w-3 h-3" /> Visit <Info className="w-3 h-3" />
                                        </a>
                                      ) : <p className="text-gray-800 dark:text-gray-200">N/A</p>}
                                    </div>
                                  </div>

                                  <div>
                                    <span className="text-gray-400">Business Summary</span>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-4 leading-relaxed">
                                      {profileData[stock.symbol].business_summary || "No summary available."}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400">No profile data available.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
