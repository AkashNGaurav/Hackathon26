"use client";

import React, { useState, useEffect, FormEvent, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Spinner, TextInput, Button, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Alert, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Label, Select } from "flowbite-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Award, Briefcase, Globe, Info, Home, GraduationCap, Target, Activity, BarChart2, DollarSign, Calendar, Repeat, CreditCard, CheckCircle2, ShieldCheck, Calculator, ArrowRight, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/auth";
import { openAIChatbot } from "@/components/AIChatbotWidget";

export interface AIMFRecommendation {
  symbol: string;
  name: string;
  nav_price: number;
  percentage_change: number;
  is_positive: boolean;
  recommended_sip_amount: number;
  expected_annual_return: number;
  projected_5yr_value: number;
  ai_rationale: string;
  match_score: number;
}

export interface AIMFResponse {
  goal: string;
  risk_profile: string;
  goal_title: string;
  recommendations: AIMFRecommendation[];
}

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

const DEFAULT_MFS = [
  "C3M.PA", "EUEA.PA", "VUAA.L", "IWDA.AS", "MEUD.PA",
  "LU0996177134.PA", "FR0010149302.PA", "LU0251128657.PA"
];
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

function MutualFundContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRisk = searchParams.get("risk") || "moderate";

  const [goalRisk, setGoalRisk] = useState<string>(initialRisk);
  const [allGoalRecs, setAllGoalRecs] = useState<Record<string, AIMFRecommendation>>({});
  const [aiLoading, setAiLoading] = useState<boolean>(true);

  const [mfs, setMfs] = useState<EUAssetItem[]>([]);
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

  // Investment Modal State
  const [investModalOpen, setInvestModalOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState<EUAssetItem | null>(null);
  const [investType, setInvestType] = useState<"sip" | "onetime">("sip");
  const [sipFrequency, setSipFrequency] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [investAmount, setInvestAmount] = useState<number>(500);
  const [sipDate, setSipDate] = useState<string>("5");
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_debit");
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const fetchAIRecommendations = async (risk: string) => {
    setAiLoading(true);
    try {
      const [homeRes, eduRes, customRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/ai/recommend-mf`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goal: "home", risk_profile: risk }),
        }),
        fetch(`${API_BASE_URL}/api/ai/recommend-mf`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goal: "education", risk_profile: risk }),
        }),
        fetch(`${API_BASE_URL}/api/ai/recommend-mf`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goal: "custom", risk_profile: risk }),
        }),
      ]);

      const recMap: Record<string, AIMFRecommendation> = {};
      if (homeRes.ok) {
        const d = await homeRes.json();
        if (d.recommendations?.length > 0) recMap["home"] = d.recommendations[0];
      }
      if (eduRes.ok) {
        const d = await eduRes.json();
        if (d.recommendations?.length > 0) recMap["education"] = d.recommendations[0];
      }
      if (customRes.ok) {
        const d = await customRes.json();
        if (d.recommendations?.length > 0) recMap["custom"] = d.recommendations[0];
      }
      setAllGoalRecs(recMap);
    } catch (err) {
      console.error("Failed to fetch AI goal recommendations", err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAIRecommendations(goalRisk);
  }, [goalRisk]);

  const fetchStock = async (symbol: string): Promise<EUAssetItem> => {
    const res = await fetch(`${API_BASE_URL}/api/market/${symbol}`);
    if (!res.ok) throw new Error(`Failed to fetch ${symbol}`);
    return await res.json();
  };

  const fetchHistory = async (symbol: string, period: string) => {
    const res = await fetch(`${API_BASE_URL}/api/market/${symbol}/history?period=${period}`);
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
          DEFAULT_MFS.map((ticker) => fetchStock(ticker))
        );
        setMfs(fetchedStocks);
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

      setMfs((prevMfs) =>
        prevMfs.map((s) => {
          const delta = (Math.random() - 0.49) * (s.current_price * 0.0006);
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

          const delta = (Math.random() - 0.49) * ((lastCandle.price || 100) * 0.0006);
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
            mfs.map((s) => fetchStock(s.symbol))
          );
          setMfs(fetchedStocks);
        } catch (err) {
          console.error("API sync error", err);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isLiveMode, mfs, expandedRow, selectedPeriod]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (mfs.some(s => s.symbol.toUpperCase() === searchQuery.toUpperCase())) {
      setSearchQuery("");
      return;
    }

    setSearchLoading(true);
    setError(null);
    try {
      const newStock = await fetchStock(searchQuery);
      if (newStock.asset_type !== "Mutual Fund") {
        setError(`Symbol ${searchQuery} is a ${newStock.asset_type}, not a Mutual Fund.`);
        setSearchLoading(false);
        return;
      }
      setMfs((prev) => [newStock, ...prev]);
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
          fetch(`${API_BASE_URL}/api/market/${symbol}/history?period=${selectedPeriod}`),
          fetch(`${API_BASE_URL}/api/market/${symbol}/profile`)
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

  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderLoading, setOrderLoading] = useState<boolean>(false);

  const openInvestModal = (fund: EUAssetItem, initialType: "sip" | "onetime" = "sip") => {
    setSelectedFund(fund);
    setInvestType(initialType);
    setOrderError(null);
    setOrderSuccess(false);
    setInvestModalOpen(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedFund || !investAmount || investAmount <= 0) return;
    setOrderError(null);
    setOrderLoading(true);

    try {
      const qty = Number((investAmount / selectedFund.current_price).toFixed(4));
      const res = await fetch(`${API_BASE_URL}/api/trading/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedFund.symbol,
          asset_name: selectedFund.name,
          asset_type: "Mutual Fund",
          transaction_type: "BUY",
          order_type: investType === "sip" ? "SIP" : "LUMP_SUM",
          sip_frequency: investType === "sip" ? sipFrequency : null,
          quantity: qty,
          price_per_unit: selectedFund.current_price,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Order execution failed" }));
        throw new Error(errData.detail || "Order execution failed");
      }

      const orderData = await res.json();
      setLastOrderId(`ORD-#${orderData.id}`);

      // Sync wallet balance from backend
      try {
        const wRes = await fetch(`${API_BASE_URL}/api/wallet/balance`);
        if (wRes.ok) {
          const wData = await wRes.json();
          localStorage.setItem("investpro_wallet_balance", wData.balance.toString());
        }
      } catch (e) {
        const currentSavedBalance = Number(localStorage.getItem("investpro_wallet_balance") || "12450");
        const newBal = Math.max(0, currentSavedBalance - investAmount);
        localStorage.setItem("investpro_wallet_balance", newBal.toString());
      }
      window.dispatchEvent(new Event("walletUpdated"));

      setOrderSuccess(true);
    } catch (err: any) {
      setOrderError(err.message || "Could not complete transaction.");
    } finally {
      setOrderLoading(false);
    }
  };

  const { mfOfTheDay, topGainers, topLosers } = useMemo(() => {
    if (mfs.length === 0) return { mfOfTheDay: null, topGainers: [], topLosers: [] };

    const sorted = [...mfs].sort((a, b) => b.percentage_change - a.percentage_change);
    const gainers = sorted.filter(s => s.is_positive).slice(0, 3);
    const losers = [...mfs].filter(s => !s.is_positive).sort((a, b) => a.percentage_change - b.percentage_change).slice(0, 3);

    return {
      mfOfTheDay: sorted[0],
      topGainers: gainers,
      topLosers: losers,
    };
  }, [mfs]);

  // Projected Value Calculation
  const estimatedProjections = useMemo(() => {
    if (!investAmount || investAmount <= 0) return { yr1: 0, yr3: 0, yr5: 0 };
    const annualReturn = 0.12; // 12% benchmark return for mutual funds
    if (investType === "onetime") {
      return {
        yr1: Math.round(investAmount * Math.pow(1 + annualReturn, 1)),
        yr3: Math.round(investAmount * Math.pow(1 + annualReturn, 3)),
        yr5: Math.round(investAmount * Math.pow(1 + annualReturn, 5)),
      };
    } else {
      // Monthly SIP formula: FV = P * [((1 + i)^n - 1) / i] * (1 + i)
      const i = annualReturn / 12;
      const calcSip = (months: number) => {
        return Math.round(investAmount * (((Math.pow(1 + i, months) - 1) / i) * (1 + i)));
      };
      return {
        yr1: calcSip(12),
        yr3: calcSip(36),
        yr5: calcSip(60),
      };
    }
  }, [investAmount, investType]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[90rem] mx-auto space-y-6 lg:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101410] dark:text-[#f6f3ea]">Mutual Fund Dashboard</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#5c6457] dark:text-[#b4ad9f]">
            Comprehensive overview of Mutual Funds, SIP calculators, and goal-based investing.
          </p>
        </div>

        {/* AI Specialist & Live Market Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => openAIChatbot("mutual-funds")}
            className="bg-[#2f6b4f] hover:bg-[#255740] text-white dark:bg-[#a7d48f] dark:text-[#090b0a] font-bold text-xs shadow-md rounded-full"
          >
            <Sparkles className="w-4 h-4 mr-2 text-amber-300 dark:text-[#090b0a]" />
            Ask AI Mutual Fund Specialist
          </Button>
          <Button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 transition-all text-xs font-bold ${isLiveMode
                ? "bg-emerald-600 text-white dark:bg-emerald-500 animate-pulse"
                : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
          >
            <Activity className="w-4 h-4" />
            {isLiveMode ? "LIVE UPDATES ACTIVE (0.5s)" : "Enable Live Mode (0.5s)"}
          </Button>
        </div>
      </div>



      {/* Mutual Fund of the Day & Highlights Grid */}
      {mfOfTheDay && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 rounded-2xl border border-black/10 bg-gradient-to-br from-[#2f6b4f]/10 to-[#2f6b4f]/5 p-6 backdrop-blur-sm dark:border-white/10 dark:from-[#a7d48f]/10 dark:to-[#a7d48f]/5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2f6b4f] dark:text-[#a7d48f] mb-3">
              <Award className="w-4 h-4" /> Mutual Fund of the Day
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{mfOfTheDay.symbol}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{mfOfTheDay.name}</p>
              </div>
              <Badge color={mfOfTheDay.is_positive ? "success" : "failure"} className="text-sm font-bold">
                {mfOfTheDay.is_positive ? "+" : ""}{mfOfTheDay.percentage_change}%
              </Badge>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">€{mfOfTheDay.current_price}</span>
                <span className="text-xs text-gray-500 ml-1">{mfOfTheDay.currency}</span>
              </div>
              <Button size="xs" className="bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a] font-bold" onClick={() => openInvestModal(mfOfTheDay, "sip")}>
                <Repeat className="w-3.5 h-3.5 mr-1" /> Start SIP
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
            placeholder="Search Mutual Fund ticker (e.g. VFIAX, VTSAX)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={searchLoading} className="bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a]">
          {searchLoading ? <Spinner size="sm" /> : "Search Fund"}
        </Button>
      </form>

      {error && <Alert color="failure">{error}</Alert>}

      {/* Mutual Fund Table */}
      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white/60 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80">
        <Table hoverable className="w-full text-left">
          <TableHead className="bg-[#f8f5ea] dark:bg-[#1a201c] text-[#5c6457] dark:text-[#a7c1b1]">
            <TableRow>
              <TableHeadCell>Symbol / Name</TableHeadCell>
              <TableHeadCell>Exchange</TableHeadCell>
              <TableHeadCell>NAV / Price</TableHeadCell>
              <TableHeadCell>Change (€)</TableHeadCell>
              <TableHeadCell>Change (%)</TableHeadCell>
              <TableHeadCell>Day Range</TableHeadCell>
              <TableHeadCell>Invest Options</TableHeadCell>
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
            ) : mfs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No Mutual Funds found. Try searching for a ticker symbol above.
                </TableCell>
              </TableRow>
            ) : (
              mfs.map((stock) => (
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
                      €{stock.current_price} <span className="text-[10px] text-gray-400">{stock.currency}</span>
                    </TableCell>
                    <TableCell className={stock.is_positive ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                      {stock.is_positive ? "+" : ""}€{stock.price_change}
                    </TableCell>
                    <TableCell>
                      <Badge color={stock.is_positive ? "success" : "failure"} className="w-fit">
                        {stock.is_positive ? "+" : ""}{stock.percentage_change}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {stock.day_low && stock.day_high ? `€${stock.day_low} - €${stock.day_high}` : "N/A"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Button
                          size="xs"
                          className="bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a] font-bold"
                          onClick={() => openInvestModal(stock, "sip")}
                        >
                          <Repeat className="w-3 h-3 mr-1" /> SIP
                        </Button>
                        <Button
                          size="xs"
                          color="gray"
                          className="font-bold"
                          onClick={() => openInvestModal(stock, "onetime")}
                        >
                          <DollarSign className="w-3 h-3 mr-1" /> Lump Sum
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row Content */}
                  {expandedRow === stock.symbol && (
                    <TableRow className="bg-black/[0.02] dark:bg-white/[0.02]">
                      <TableCell colSpan={7} className="p-6">
                        {detailsLoading[stock.symbol] ? (
                          <div className="flex items-center justify-center py-6 gap-3">
                            <Spinner size="md" />
                            <span className="text-sm text-gray-500">Loading charts & Fund profile...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Interactive Price Chart with Period & Type Selectors */}
                            <div className="lg:col-span-2 bg-white dark:bg-[#1a201c] p-5 rounded-xl border border-black/10 dark:border-white/10 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-3">
                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                  {PERIOD_OPTIONS.map((period) => (
                                    <button
                                      key={period.value}
                                      onClick={() => handlePeriodChange(stock.symbol, period.value)}
                                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedPeriod === period.value
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
                                    className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all ${chartType === "line"
                                        ? "bg-white dark:bg-gray-700 text-[#2f6b4f] dark:text-[#a7d48f] shadow-sm"
                                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                      }`}
                                  >
                                    <TrendingUp className="w-3.5 h-3.5" /> Line
                                  </button>
                                  <button
                                    onClick={() => setChartType("candlestick")}
                                    className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all ${chartType === "candlestick"
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

                            {/* Profile Info & Quick Investment Card */}
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
                                        <span className="text-gray-400">Fund Family</span>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{profileData[stock.symbol].fund_family || "N/A"}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Total Assets</span>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                          {profileData[stock.symbol].total_assets
                                            ? `$${(profileData[stock.symbol].total_assets! / 1e9).toFixed(2)}B`
                                            : "N/A"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">YTD Return</span>
                                        <p className="font-semibold text-[#2f6b4f] dark:text-[#a7d48f]">
                                          {profileData[stock.symbol].ytd_return
                                            ? `${(profileData[stock.symbol].ytd_return! * 100).toFixed(2)}%`
                                            : "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400">No profile data available.</p>
                                )}
                              </div>

                              {/* Prominent Buy Action Box */}
                              <div className="p-4 rounded-xl bg-gradient-to-r from-[#2f6b4f]/10 to-emerald-500/10 border border-[#2f6b4f]/20 dark:border-[#a7d48f]/20 space-y-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#2f6b4f] dark:text-[#a7d48f]">
                                  Ready to Invest?
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                  <Button size="sm" className="bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a] font-bold" onClick={() => openInvestModal(stock, "sip")}>
                                    <Repeat className="w-3.5 h-3.5 mr-1" /> Start SIP
                                  </Button>
                                  <Button size="sm" color="gray" className="font-bold" onClick={() => openInvestModal(stock, "onetime")}>
                                    <DollarSign className="w-3.5 h-3.5 mr-1" /> Lump Sum
                                  </Button>
                                </div>
                              </div>
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

      {/* Financial Goals Planner Section */}
      <div className="pt-12 mt-12 border-t border-black/10 dark:border-white/10">
        <h2 className="text-2xl font-bold text-[#101410] dark:text-[#f6f3ea] mb-6">Financial Goals Planner</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/goals/risk-profile?goal=home" className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-xl dark:border-white/10 dark:bg-[#121614]/80 block">
            <div className="absolute -right-6 -top-6 rounded-full bg-blue-500/10 p-12 transition-transform group-hover:scale-110 dark:bg-blue-500/5">
              <Home size={64} className="text-blue-500/20" />
            </div>
            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm">
                <Home size={24} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Plan Your Dream Home</h3>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Calculate the monthly SIP required to afford the down payment of your future house.
              </p>
              <div className="flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                Start Planning <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/goals/risk-profile?goal=education" className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-xl dark:border-white/10 dark:bg-[#121614]/80 block">
            <div className="absolute -right-6 -top-6 rounded-full bg-purple-500/10 p-12 transition-transform group-hover:scale-110 dark:bg-purple-500/5">
              <GraduationCap size={64} className="text-purple-500/20" />
            </div>
            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 shadow-sm">
                <GraduationCap size={24} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Child's Education</h3>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Secure your child's future by planning for their higher education expenses early.
              </p>
              <div className="flex items-center text-sm font-bold text-purple-600 dark:text-purple-400 group-hover:underline">
                Start Planning <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/goals/risk-profile?goal=custom" className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-xl dark:border-white/10 dark:bg-[#121614]/80 block">
            <div className="absolute -right-6 -top-6 rounded-full bg-[#2f6b4f]/10 p-12 transition-transform group-hover:scale-110 dark:bg-[#a7d48f]/5">
              <Target size={64} className="text-[#2f6b4f]/20 dark:text-[#a7d48f]/20" />
            </div>
            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-[#2f6b4f]/10 p-3 text-[#2f6b4f] dark:bg-[#a7d48f]/20 dark:text-[#a7d48f] shadow-sm">
                <Target size={24} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Create Custom Goal</h3>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Have a unique goal in mind? Build a tailored mutual fund investment plan to achieve it.
              </p>
              <div className="flex items-center text-sm font-bold text-[#2f6b4f] dark:text-[#a7d48f] group-hover:underline">
                Start Planning <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Investment Modal */}
      <Modal show={investModalOpen} onClose={() => setInvestModalOpen(false)} size="xl">
        <ModalHeader className="border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Badge color="success" className="font-bold">{selectedFund?.symbol}</Badge>
            <span className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
              Invest in {selectedFund?.name}
            </span>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-6">
          {orderSuccess ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in duration-300">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                Investment Confirmed!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Your <span className="font-bold text-emerald-600">{investType === "sip" ? `${sipFrequency.toUpperCase()} SIP` : "Lump Sum Payment"}</span> of <span className="font-bold text-gray-900 dark:text-white">${investAmount}</span> for <span className="font-bold text-gray-900 dark:text-white">{selectedFund?.name} ({selectedFund?.symbol})</span> has been placed successfully.
              </p>
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-mono font-bold">{lastOrderId || "ORD-COMPLETED"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Mode:</span>
                  <span className="font-semibold">Auto Debit (Bank Account)</span>
                </div>
                {investType === "sip" && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Next SIP Debit Date:</span>
                    <span className="font-semibold">5th of Next Month</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {orderError && <Alert color="failure">{orderError}</Alert>}
              {/* Type Switcher: SIP vs Lump Sum */}
              <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setInvestType("sip")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${investType === "sip"
                      ? "bg-white dark:bg-gray-700 text-[#2f6b4f] dark:text-[#a7d48f] shadow-md"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  <Repeat size={16} /> SIP (Recurring)
                </button>
                <button
                  type="button"
                  onClick={() => setInvestType("onetime")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${investType === "onetime"
                      ? "bg-white dark:bg-gray-700 text-[#2f6b4f] dark:text-[#a7d48f] shadow-md"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  <DollarSign size={16} /> One-Time Lump Sum
                </button>
              </div>

              {/* SIP Specific Settings */}
              {investType === "sip" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sip-freq" className="mb-2 block text-xs font-bold text-gray-700 dark:text-gray-300">
                      SIP Frequency
                    </Label>
                    <Select
                      id="sip-freq"
                      value={sipFrequency}
                      onChange={(e: any) => setSipFrequency(e.target.value as any)}
                    >
                      <option value="monthly">Monthly SIP</option>
                      <option value="quarterly">Quarterly SIP</option>
                      <option value="yearly">Yearly SIP</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sip-date" className="mb-2 block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Preferred Debit Date
                    </Label>
                    <Select
                      id="sip-date"
                      value={sipDate}
                      onChange={(e: any) => setSipDate(e.target.value)}
                    >
                      <option value="1">1st of every period</option>
                      <option value="5">5th of every period</option>
                      <option value="10">10th of every period</option>
                      <option value="15">15th of every period</option>
                      <option value="25">25th of every period</option>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Zap size={16} /> Lump Sum / One-Time investment lets you purchase units immediately at today's NAV (${selectedFund?.current_price}).
                </div>
              )}

              {/* Amount Selection */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {investType === "sip" ? "Monthly SIP Amount ($)" : "One-Time Investment Amount ($)"}
                </Label>
                <TextInput
                  id="amount"
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                  required
                />
                {/* Presets */}
                <div className="flex gap-2 pt-1">
                  {[100, 250, 500, 1000, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setInvestAmount(preset)}
                      className={`px-3 py-1 rounded-md text-xs font-bold border transition-all ${investAmount === preset
                          ? "border-[#2f6b4f] bg-[#2f6b4f]/10 text-[#2f6b4f] dark:border-[#a7d48f] dark:bg-[#a7d48f]/20 dark:text-[#a7d48f]"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                        }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Returns Projection Breakdown Card */}
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50/80 dark:bg-gray-800/50 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Calculator size={14} className="text-[#2f6b4f] dark:text-[#a7d48f]" /> Estimated Growth Projection
                  </span>
                  <Badge color="info">~12% Expected Return</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-black/5 dark:border-white/5">
                    <span className="text-gray-400">1 Year</span>
                    <p className="font-bold text-gray-900 dark:text-white mt-1">${estimatedProjections.yr1.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-black/5 dark:border-white/5">
                    <span className="text-gray-400">3 Years</span>
                    <p className="font-bold text-gray-900 dark:text-white mt-1">${estimatedProjections.yr3.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-[#2f6b4f]/30 dark:border-[#a7d48f]/30 bg-[#2f6b4f]/5 dark:bg-[#a7d48f]/5">
                    <span className="text-[#2f6b4f] dark:text-[#a7d48f] font-bold">5 Years</span>
                    <p className="font-extrabold text-[#2f6b4f] dark:text-[#a7d48f] mt-1">${estimatedProjections.yr5.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label htmlFor="payment" className="mb-2 block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Payment Method
                </Label>
                <Select
                  id="payment"
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                >
                  <option value="bank_debit">Auto Debit - Chase Bank (**** 4892)</option>
                  <option value="card">Visa Debit Card (**** 1094)</option>
                  <option value="net_banking">Net Banking / Direct Pay</option>
                </Select>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter className="border-t border-black/10 dark:border-white/10 justify-between">
          {orderSuccess ? (
            <Button
              className="w-full bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a] font-bold"
              onClick={() => setInvestModalOpen(false)}
            >
              Done
            </Button>
          ) : (
            <>
              <Button color="gray" onClick={() => setInvestModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-[#2f6b4f] to-emerald-600 hover:from-[#255740] hover:to-emerald-700 dark:from-[#a7d48f] dark:to-emerald-400 dark:text-[#090b0a] font-bold px-6"
                onClick={handlePlaceOrder}
              >
                Confirm & Invest ${investAmount} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default function MutualFundPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-[#2f6b4f] dark:text-[#a7d48f] font-semibold animate-pulse">Loading Mutual Fund Dashboard & AI recommendations...</div>
      </div>
    }>
      <MutualFundContent />
    </Suspense>
  );
}
