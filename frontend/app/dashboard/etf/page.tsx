"use client";

import React, { useState, useEffect, FormEvent, useMemo } from "react";
import { Spinner, TextInput, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Alert, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Label } from "flowbite-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Award, Briefcase, Globe, Info, Activity, BarChart2, ShoppingBag, CheckCircle2, ArrowRight, DollarSign } from "lucide-react";

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
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

export interface AssetProfileData {
  sector?: string;
  industry?: string;
  website?: string;
  market_cap?: number;
  business_summary?: string;
  total_assets?: number;
  yield_pct?: number;
  ytd_return?: number;
  category?: string;
  fund_family?: string;
}

const DEFAULT_ETFS = ["VUAA.L", "IWDA.AS", "MEUD.PA", "EUEA.PA", "C3M.PA"];
const PERIOD_OPTIONS = [
  { label: "1D", value: "1d" },
  { label: "5D", value: "5d" },
  { label: "1M", value: "1mo" },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
  { label: "MAX", value: "max" },
];

function CandlestickChart({ data }: { data: AssetHistoryData[] }) {
  if (!data || data.length === 0) return <div className="flex h-64 items-center justify-center text-xs text-gray-400">No data available</div>;

  const minPrice = Math.min(...data.map(d => d.low ?? d.price));
  const maxPrice = Math.max(...data.map(d => d.high ?? d.price));
  const priceRange = maxPrice - minPrice || 1;

  const width = 650;
  const height = 240;
  const padding = 35;

  const candleWidth = Math.max(2, Math.floor((width - padding * 2) / data.length) - 2);

  const getY = (val: number) => {
    return height - padding - ((val - minPrice) / priceRange) * (height - padding * 2);
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 select-none">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + ratio * (height - padding * 2);
          const priceVal = (maxPrice - ratio * priceRange).toFixed(2);
          return (
            <g key={ratio}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#374151" strokeDasharray="3 3" opacity={0.2} />
              <text x={width - padding + 4} y={y + 3} fill="#9ca3af" fontSize="9">{priceVal}</text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const step = (width - padding * 2) / data.length;
          const x = padding + i * step + step / 2;
          const open = d.open ?? d.price;
          const close = d.close ?? d.price;
          const high = d.high ?? Math.max(open, close);
          const low = d.low ?? Math.min(open, close);
          const isGreen = close >= open;

          const yOpen = getY(open);
          const yClose = getY(close);
          const yHigh = getY(high);
          const yLow = getY(low);

          const bodyTop = Math.min(yOpen, yClose);
          const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
          const color = isGreen ? "#10b981" : "#ef4444";

          return (
            <g key={i} className="group cursor-pointer">
              <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth={1.5} />
              <rect
                x={x - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={color}
                rx={1}
              />
              <title>{`${d.date}\nOpen: $${open}\nHigh: $${high}\nLow: $${low}\nClose: $${close}\nVolume: ${d.volume ?? 0}`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function ETFPage() {
  const [etfs, setEtfs] = useState<EUAssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(true);
  
  // Expandable Row State
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1mo");
  const [historyData, setHistoryData] = useState<Record<string, AssetHistoryData[]>>({});
  const [profileData, setProfileData] = useState<Record<string, AssetProfileData>>({});
  const [detailsLoading, setDetailsLoading] = useState<Record<string, boolean>>({});

  // Buy ETF Modal State
  const [buyModalOpen, setBuyModalOpen] = useState<boolean>(false);
  const [selectedEtf, setSelectedEtf] = useState<EUAssetItem | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [buyLoading, setBuyLoading] = useState<boolean>(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buySuccess, setBuySuccess] = useState<boolean>(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const fetchStock = async (symbol: string): Promise<EUAssetItem> => {
    const res = await fetch(`http://localhost:8000/api/market/${symbol}`);
    if (!res.ok) throw new Error(`Failed to fetch ${symbol}`);
    return await res.json();
  };

  const fetchHistory = async (symbol: string, period: string) => {
    const res = await fetch(`http://localhost:8000/api/market/${symbol}/history?period=${period}`);
    if (res.ok) {
      const hist = await res.json();
      setHistoryData(prev => ({ ...prev, [symbol]: hist }));
    }
  };

  useEffect(() => {
    const fetchInitialStocks = async () => {
      setLoading(true);
      try {
        const fetchedStocks = await Promise.all(
          DEFAULT_ETFS.map((ticker) => fetchStock(ticker))
        );
        setEtfs(fetchedStocks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialStocks();
  }, []);

  // Live Auto-Refresh Effect (0.5s updates default)
  useEffect(() => {
    if (!isLiveMode) return;

    let tickCount = 0;
    const interval = setInterval(async () => {
      tickCount++;

      setEtfs((prevEtfs) =>
        prevEtfs.map((s) => {
          const delta = (Math.random() - 0.49) * (s.current_price * 0.0008);
          const newPrice = Number((s.current_price + delta).toFixed(2));
          const newChange = Number((newPrice - (s.previous_close || newPrice)).toFixed(2));
          const newPct = Number((((newPrice - (s.previous_close || newPrice)) / (s.previous_close || newPrice)) * 100).toFixed(2));

          return {
            ...s,
            current_price: newPrice,
            price_change: newChange,
            percentage_change: newPct,
            is_positive: newChange >= 0,
            day_high: s.day_high ? Math.max(s.day_high, newPrice) : newPrice,
            day_low: s.day_low ? Math.min(s.day_low, newPrice) : newPrice,
          };
        })
      );

      if (expandedRow) {
        setHistoryData((prevHist) => {
          const currentHist = prevHist[expandedRow];
          if (!currentHist || currentHist.length === 0) return prevHist;

          const updatedHist = [...currentHist];
          const lastCandle = { ...updatedHist[updatedHist.length - 1] };

          const delta = (Math.random() - 0.49) * ((lastCandle.price || 100) * 0.0008);
          const newPrice = Number(((lastCandle.price || 100) + delta).toFixed(2));

          lastCandle.price = newPrice;
          lastCandle.close = newPrice;
          lastCandle.high = Math.max(lastCandle.high ?? newPrice, newPrice);
          lastCandle.low = Math.min(lastCandle.low ?? newPrice, newPrice);

          updatedHist[updatedHist.length - 1] = lastCandle;

          return {
            ...prevHist,
            [expandedRow]: updatedHist,
          };
        });
      }

      if (tickCount % 10 === 0) {
        try {
          const fetchedStocks = await Promise.all(
            etfs.map((s) => fetchStock(s.symbol))
          );
          setEtfs(fetchedStocks);
        } catch (err) {
          console.error("API sync error", err);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isLiveMode, etfs, expandedRow, selectedPeriod]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    if (etfs.some(s => s.symbol.toUpperCase() === searchQuery.toUpperCase())) {
      setSearchQuery("");
      return;
    }

    setSearchLoading(true);
    setError(null);
    try {
      const newStock = await fetchStock(searchQuery);
      if (newStock.asset_type !== "ETF") {
        setError(`Symbol ${searchQuery} is a ${newStock.asset_type}, not an ETF.`);
        setSearchLoading(false);
        return;
      }
      setEtfs((prev) => [newStock, ...prev]);
      setSearchQuery("");
    } catch (err) {
      setError(`Could not find stock symbol: ${searchQuery}. Please try a valid Yahoo Finance ticker.`);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRowClick = async (symbol: string) => {
    if (expandedRow === symbol) {
      setExpandedRow(null);
      return;
    }
    setExpandedRow(symbol);
    
    if (!historyData[symbol] || !profileData[symbol]) {
      setDetailsLoading(prev => ({ ...prev, [symbol]: true }));
      try {
        const [histRes, profRes] = await Promise.all([
          fetch(`http://localhost:8000/api/market/${symbol}/history?period=${selectedPeriod}`),
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

  const handlePeriodChange = async (symbol: string, period: string) => {
    setSelectedPeriod(period);
    setDetailsLoading(prev => ({ ...prev, [symbol]: true }));
    await fetchHistory(symbol, period);
    setDetailsLoading(prev => ({ ...prev, [symbol]: false }));
  };

  const openBuyModal = (etf: EUAssetItem) => {
    setSelectedEtf(etf);
    setBuyQuantity(1);
    setBuyError(null);
    setBuySuccess(false);
    setBuyModalOpen(true);
  };

  const handleExecuteBuy = async () => {
    if (!selectedEtf || buyQuantity <= 0) return;
    setBuyError(null);
    setBuyLoading(true);

    try {
      const totalCost = Number((buyQuantity * selectedEtf.current_price).toFixed(2));
      const res = await fetch("http://localhost:8000/api/trading/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedEtf.symbol,
          asset_name: selectedEtf.name,
          asset_type: "ETF",
          transaction_type: "BUY",
          order_type: "LUMP_SUM",
          quantity: buyQuantity,
          price_per_unit: selectedEtf.current_price,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "ETF order failed" }));
        throw new Error(errData.detail || "ETF order failed");
      }

      const orderData = await res.json();
      setLastOrderId(`ORD-#${orderData.id}`);

      // Sync wallet balance from backend
      try {
        const wRes = await fetch("http://localhost:8000/api/wallet/balance");
        if (wRes.ok) {
          const wData = await wRes.json();
          localStorage.setItem("investpro_wallet_balance", wData.balance.toString());
        }
      } catch (e) {
        const currentSavedBalance = Number(localStorage.getItem("investpro_wallet_balance") || "12450");
        const newBal = Math.max(0, currentSavedBalance - totalCost);
        localStorage.setItem("investpro_wallet_balance", newBal.toString());
      }
      window.dispatchEvent(new Event("walletUpdated"));

      setBuySuccess(true);
    } catch (err: any) {
      setBuyError(err.message || "Could not complete ETF purchase.");
    } finally {
      setBuyLoading(false);
    }
  };

  const { etfOfTheDay, topGainers, topLosers } = useMemo(() => {
    if (etfs.length === 0) return { etfOfTheDay: null, topGainers: [], topLosers: [] };
    
    const sorted = [...etfs].sort((a, b) => b.percentage_change - a.percentage_change);
    const gainers = sorted.filter(s => s.is_positive).slice(0, 3);
    const losers = [...etfs].filter(s => !s.is_positive).sort((a, b) => a.percentage_change - b.percentage_change).slice(0, 3);
    
    return {
      etfOfTheDay: sorted[0],
      topGainers: gainers,
      topLosers: losers,
    };
  }, [etfs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[90rem] mx-auto space-y-6 lg:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101410] dark:text-[#f6f3ea]">ETF Dashboard</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#5c6457] dark:text-[#b4ad9f]">
            Comprehensive overview of Exchange Traded Funds, fund metrics, and real-time performance analysis.
          </p>
        </div>

        {/* Live Market Toggle */}
        <Button
          onClick={() => setIsLiveMode(!isLiveMode)}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 transition-all text-xs font-bold ${
            isLiveMode 
              ? "bg-emerald-600 text-white dark:bg-emerald-500 animate-pulse" 
              : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          <Activity className="w-4 h-4" />
          {isLiveMode ? "LIVE UPDATES ACTIVE (0.5s)" : "Enable Live Mode (0.5s)"}
        </Button>
      </div>

      {/* Highlights Grid */}
      {etfOfTheDay && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 rounded-2xl border border-black/10 bg-gradient-to-br from-[#2f6b4f]/10 to-[#2f6b4f]/5 p-6 backdrop-blur-sm dark:border-white/10 dark:from-[#a7d48f]/10 dark:to-[#a7d48f]/5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2f6b4f] dark:text-[#a7d48f] mb-3">
              <Award className="w-4 h-4" /> ETF of the Day
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{etfOfTheDay.symbol}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{etfOfTheDay.name}</p>
              </div>
              <Badge color={etfOfTheDay.is_positive ? "success" : "failure"} className="text-sm font-bold">
                {etfOfTheDay.is_positive ? "+" : ""}{etfOfTheDay.percentage_change}%
              </Badge>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">€{etfOfTheDay.current_price}</span>
                <span className="text-xs text-gray-500 ml-1">{etfOfTheDay.currency}</span>
              </div>
              <Button size="xs" className="bg-[#2f6b4f] font-bold" onClick={() => openBuyModal(etfOfTheDay)}>
                Buy ETF Units
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
              <TrendingUp className="w-4 h-4" /> Top Gainers
            </div>
            <div className="space-y-3">
              {topGainers.map((s) => (
                <div key={s.symbol} className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-800 dark:text-gray-200">{s.symbol}</span>
                  <span className="text-xs text-gray-500">€{s.current_price}</span>
                  <Badge color="success">+{s.percentage_change}%</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-3">
              <TrendingDown className="w-4 h-4" /> Top Losers
            </div>
            <div className="space-y-3">
              {topLosers.map((s) => (
                <div key={s.symbol} className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-800 dark:text-gray-200">{s.symbol}</span>
                  <span className="text-xs text-gray-500">€{s.current_price}</span>
                  <Badge color="failure">{s.percentage_change}%</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-4 max-w-lg">
        <div className="flex-1">
          <TextInput
            type="text"
            placeholder="Search ETF ticker (e.g. SPY, QQQ, VTI)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={searchLoading} className="bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a]">
          {searchLoading ? <Spinner size="sm" /> : "Search ETF"}
        </Button>
      </form>

      {error && <Alert color="failure">{error}</Alert>}

      {/* ETF Table */}
      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white/60 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80">
        <Table hoverable className="w-full text-left">
          <TableHead className="bg-[#f8f5ea] dark:bg-[#1a201c] text-[#5c6457] dark:text-[#a7c1b1]">
            <TableRow>
              <TableHeadCell>Symbol / Name</TableHeadCell>
              <TableHeadCell>Exchange</TableHeadCell>
              <TableHeadCell>NAV / Price</TableHeadCell>
              <TableHeadCell>Change ($)</TableHeadCell>
              <TableHeadCell>Change (%)</TableHeadCell>
              <TableHeadCell>Day Range</TableHeadCell>
              <TableHeadCell>Trade Action</TableHeadCell>
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
            ) : etfs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No ETFs found. Try searching for a ticker symbol above.
                </TableCell>
              </TableRow>
            ) : (
              etfs.map((stock) => (
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button size="xs" className="bg-[#2f6b4f] hover:bg-[#255740] font-bold" onClick={() => openBuyModal(stock)}>
                        Buy Units
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row Content */}
                  {expandedRow === stock.symbol && (
                    <TableRow className="bg-black/[0.02] dark:bg-white/[0.02]">
                      <TableCell colSpan={7} className="p-6">
                        {detailsLoading[stock.symbol] ? (
                          <div className="flex items-center justify-center py-6 gap-3">
                            <Spinner size="md" />
                            <span className="text-sm text-gray-500">Loading charts & ETF profile...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Interactive Price Chart */}
                            <div className="lg:col-span-2 bg-white dark:bg-[#1a201c] p-5 rounded-xl border border-black/10 dark:border-white/10 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-3">
                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                  {PERIOD_OPTIONS.map((period) => (
                                    <button
                                      key={period.value}
                                      onClick={() => handlePeriodChange(stock.symbol, period.value)}
                                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                                        selectedPeriod === period.value
                                          ? "bg-white dark:bg-gray-700 text-[#2f6b4f] dark:text-[#a7d48f] shadow-sm"
                                          : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                      }`}
                                    >
                                      {period.label}
                                    </button>
                                  ))}
                                </div>

                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                  <button
                                    onClick={() => setChartType("line")}
                                    className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all ${
                                      chartType === "line"
                                        ? "bg-white dark:bg-gray-700 text-[#2f6b4f] dark:text-[#a7d48f] shadow-sm"
                                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                                  >
                                    <TrendingUp className="w-3.5 h-3.5" /> Line
                                  </button>
                                  <button
                                    onClick={() => setChartType("candlestick")}
                                    className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all ${
                                      chartType === "candlestick"
                                        ? "bg-white dark:bg-gray-700 text-[#2f6b4f] dark:text-[#a7d48f] shadow-sm"
                                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                                  >
                                    <BarChart2 className="w-3.5 h-3.5" /> Candlestick
                                  </button>
                                </div>
                              </div>

                              <div className="h-64 w-full">
                                {chartType === "line" ? (
                                  historyData[stock.symbol] && historyData[stock.symbol].length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={historyData[stock.symbol]}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                                        <Tooltip 
                                          contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                                          formatter={(val: any) => [`$${val}`, 'NAV Price']}
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
                                      No line history data available.
                                    </div>
                                  )
                                ) : (
                                  <CandlestickChart data={historyData[stock.symbol] || []} />
                                )}
                              </div>
                            </div>

                            {/* Profile Info */}
                            <div className="bg-white dark:bg-[#1a201c] p-5 rounded-xl border border-black/10 dark:border-white/10 space-y-4 flex flex-col justify-between">
                              <div>
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                                  <Briefcase className="w-4 h-4 text-[#2f6b4f] dark:text-[#a7d48f]" />
                                  Fund Profile & Metrics
                                </h4>
                                
                                {profileData[stock.symbol] ? (
                                  <div className="space-y-3 text-xs">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-gray-400">Category</span>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{profileData[stock.symbol].category || "N/A"}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Total Assets</span>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                          {profileData[stock.symbol].total_assets 
                                            ? `$${(profileData[stock.symbol].total_assets! / 1e9).toFixed(2)}B` 
                                            : "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400">No profile data available.</p>
                                )}
                              </div>

                              <Button className="w-full bg-[#2f6b4f] hover:bg-[#255740] font-bold" onClick={() => openBuyModal(stock)}>
                                <ShoppingBag className="w-4 h-4 mr-2" /> Buy {stock.symbol} Units
                              </Button>
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

      {/* Buy ETF Modal */}
      <Modal show={buyModalOpen} onClose={() => setBuyModalOpen(false)} size="md">
        <ModalHeader className="border-b border-black/10 dark:border-white/10">
          <span className="font-bold text-gray-900 dark:text-white">Buy {selectedEtf?.symbol} Units</span>
        </ModalHeader>
        <ModalBody className="space-y-4">
          {buySuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">ETF Purchase Complete!</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                You bought <span className="font-bold text-gray-900 dark:text-white">{buyQuantity} units</span> of <span className="font-bold text-[#2f6b4f] dark:text-[#a7d48f]">{selectedEtf?.symbol}</span>. Total cost of <span className="font-bold text-emerald-600">${(buyQuantity * (selectedEtf?.current_price || 0)).toFixed(2)}</span> has been deducted from your Digital Wallet.
              </p>
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs text-left max-w-xs mx-auto space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-mono font-bold">{lastOrderId || "ORD-COMPLETED"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-semibold text-emerald-600">COMPLETED</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {buyError && <Alert color="failure">{buyError}</Alert>}

              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Asset:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedEtf?.name} ({selectedEtf?.symbol})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">NAV Price:</span>
                  <span className="font-bold text-gray-900 dark:text-white">${selectedEtf?.current_price}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="etfQty" className="mb-1 block text-xs font-bold">Number of Units to Buy</Label>
                <TextInput
                  id="etfQty"
                  type="number"
                  min="1"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(Number(e.target.value))}
                />
              </div>

              <div className="p-3 rounded-lg bg-[#2f6b4f]/10 dark:bg-[#a7d48f]/10 border border-[#2f6b4f]/20 text-xs flex justify-between items-center font-bold">
                <span>Total Cost (Deducted from Wallet):</span>
                <span className="text-[#2f6b4f] dark:text-[#a7d48f] text-sm">
                  ${(buyQuantity * (selectedEtf?.current_price || 0)).toFixed(2)}
                </span>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter className="border-t border-black/10 dark:border-white/10">
          {buySuccess ? (
            <Button className="w-full bg-[#2f6b4f]" onClick={() => setBuyModalOpen(false)}>Done</Button>
          ) : (
            <div className="flex w-full gap-3">
              <Button color="gray" className="w-1/2" onClick={() => setBuyModalOpen(false)}>Cancel</Button>
              <Button
                className="w-1/2 bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a] font-bold"
                disabled={buyLoading}
                onClick={handleExecuteBuy}
              >
                {buyLoading ? <Spinner size="sm" /> : "Confirm & Buy"}
              </Button>
            </div>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}
