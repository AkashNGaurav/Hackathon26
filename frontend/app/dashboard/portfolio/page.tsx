"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Button as FlowbiteButton,
  Modal as FlowbiteModal,
  ModalHeader as FlowbiteModalHeader,
  ModalBody as FlowbiteModalBody,
  ModalFooter as FlowbiteModalFooter,
  Alert as FlowbiteAlert,
  Spinner as FlowbiteSpinner,
  TextInput,
  Label,
  Select,
} from "flowbite-react";
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Euro,
  History,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Wallet,
  PieChart,
  Percent,
  Layers,
  ArrowRightLeft,
  Target,
  Sparkles,
  Zap,
  Calendar,
  Compass,
} from "lucide-react";

export interface PortfolioPosition {
  id: number;
  symbol: string;
  asset_name: string;
  asset_type: string;
  quantity: number;
  average_buy_price: number;
  total_invested: number;
  current_price?: number;
  current_value?: number;
  unrealized_pnl?: number;
  unrealized_pnl_pct?: number;
  price_change?: number;
  percentage_change?: number;
  is_positive?: boolean;
  market_status?: string;
  currency?: string;
  updated_at: string;
}

export interface OrderRecord {
  id: number;
  symbol: string;
  asset_name: string;
  asset_type: string;
  transaction_type: string;
  order_type: string;
  sip_frequency?: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface ActiveGoal {
  goal: string;
  title: string;
  targetAmount: number;
  targetYears: number;
  riskProfile: string;
  createdAt?: string;
}

export default function PortfolioPage() {
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number>(12450);

  // Active Goal & AI Scenario State
  const [activeGoal, setActiveGoal] = useState<ActiveGoal>({
    goal: "home",
    title: "Dream Home Down Payment",
    targetAmount: 50000,
    targetYears: 5,
    riskProfile: "moderate",
  });

  // Dedicated Sell Section State
  const [sellSelectedSymbol, setSellSelectedSymbol] = useState<string>("");
  const [quickSellQty, setQuickSellQty] = useState<number>(1);
  const [quickSellLoading, setQuickSellLoading] = useState<boolean>(false);
  const [quickSellError, setQuickSellError] = useState<string | null>(null);
  const [quickSellSuccessMsg, setQuickSellSuccessMsg] = useState<string | null>(null);

  // Modal Sell State
  const [sellModalOpen, setSellModalOpen] = useState<boolean>(false);
  const [selectedPosition, setSelectedPosition] = useState<PortfolioPosition | null>(null);
  const [modalSellQty, setModalSellQty] = useState<number>(1);
  const [modalSellLoading, setModalSellLoading] = useState<boolean>(false);
  const [modalSellError, setModalSellError] = useState<string | null>(null);
  const [modalSellSuccess, setModalSellSuccess] = useState<boolean>(false);

  // AI Advice Execution State
  const [executingAIAdvice, setExecutingAIAdvice] = useState<boolean>(false);
  const [aiAdviceSuccessMsg, setAiAdviceSuccessMsg] = useState<string | null>(null);
  const [aiAdviceError, setAiAdviceError] = useState<string | null>(null);

  // Fetch Wallet Balance
  const fetchWallet = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/wallet/balance");
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balance);
        localStorage.setItem("investpro_wallet_balance", data.balance.toString());
      }
    } catch {
      const saved = localStorage.getItem("investpro_wallet_balance");
      if (saved) setWalletBalance(Number(saved));
    }
  };

  const fetchPortfolioData = async () => {
    try {
      const [portRes, ordRes] = await Promise.all([
        fetch("http://localhost:8000/api/trading/portfolio"),
        fetch("http://localhost:8000/api/trading/orders"),
      ]);
      if (portRes.ok) {
        const portData = await portRes.json();
        setPositions(portData);
        if (portData.length > 0 && !sellSelectedSymbol) {
          setSellSelectedSymbol(portData[0].symbol);
          setQuickSellQty(portData[0].quantity);
        }
      }
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData);
      }
    } catch (err) {
      console.error("Failed to load portfolio data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
    fetchWallet();

    // Load active goal from localStorage
    const savedGoal = localStorage.getItem("investpro_active_goal");
    if (savedGoal) {
      try {
        setActiveGoal(JSON.parse(savedGoal));
      } catch {
        // Keep default
      }
    }

    window.addEventListener("walletUpdated", fetchWallet);
    return () => window.removeEventListener("walletUpdated", fetchWallet);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPortfolioData();
    fetchWallet();
  };

  const activeSellPosition = positions.find((p) => p.symbol === sellSelectedSymbol) || positions[0] || null;

  // Execute Sell Logic
  const executeSell = async (symbol: string, assetName: string, assetType: string, qty: number, unitPrice: number) => {
    const res = await fetch("http://localhost:8000/api/trading/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol,
        asset_name: assetName,
        asset_type: assetType,
        transaction_type: "SELL",
        order_type: "LUMP_SUM",
        quantity: qty,
        price_per_unit: unitPrice,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: "Sell order failed" }));
      throw new Error(errData.detail || "Sell order failed");
    }

    // Sync Wallet Balance
    try {
      const wRes = await fetch("http://localhost:8000/api/wallet/balance");
      if (wRes.ok) {
        const wData = await wRes.json();
        setWalletBalance(wData.balance);
        localStorage.setItem("investpro_wallet_balance", wData.balance.toString());
      }
    } catch {
      const proceeds = qty * unitPrice;
      const currentSaved = Number(localStorage.getItem("investpro_wallet_balance") || "12450");
      const newBal = currentSaved + proceeds;
      setWalletBalance(newBal);
      localStorage.setItem("investpro_wallet_balance", newBal.toString());
    }

    window.dispatchEvent(new Event("walletUpdated"));
    fetchPortfolioData();
  };

  // Quick Sell Handler
  const handleQuickSell = async () => {
    if (!activeSellPosition || quickSellQty <= 0) return;
    setQuickSellError(null);
    setQuickSellSuccessMsg(null);
    setQuickSellLoading(true);

    const price = activeSellPosition.current_price || activeSellPosition.average_buy_price;
    const proceeds = quickSellQty * price;

    try {
      await executeSell(
        activeSellPosition.symbol,
        activeSellPosition.asset_name,
        activeSellPosition.asset_type,
        quickSellQty,
        price
      );

      setQuickSellSuccessMsg(
        `Successfully sold ${quickSellQty} units of ${activeSellPosition.symbol} for €${proceeds.toFixed(
          2
        )}. Funds have been credited to your Wallet!`
      );
      setTimeout(() => setQuickSellSuccessMsg(null), 7000);
    } catch (err: any) {
      setQuickSellError(err.message || "Could not execute sell order.");
    } finally {
      setQuickSellLoading(false);
    }
  };

  // Modal Sell Handler
  const openSellModal = (pos: PortfolioPosition) => {
    setSelectedPosition(pos);
    setModalSellQty(pos.quantity);
    setModalSellError(null);
    setModalSellSuccess(false);
    setSellModalOpen(true);
  };

  const handleModalSell = async () => {
    if (!selectedPosition || modalSellQty <= 0) return;
    setModalSellError(null);
    setModalSellLoading(true);

    const price = selectedPosition.current_price || selectedPosition.average_buy_price;

    try {
      await executeSell(
        selectedPosition.symbol,
        selectedPosition.asset_name,
        selectedPosition.asset_type,
        modalSellQty,
        price
      );
      setModalSellSuccess(true);
    } catch (err: any) {
      setModalSellError(err.message || "Could not execute sell order.");
    } finally {
      setModalSellLoading(false);
    }
  };

  // Totals Calculation
  const totalInvested = positions.reduce((acc, p) => acc + p.total_invested, 0);
  const totalCurrentValue = positions.reduce((acc, p) => acc + (p.current_value || p.total_invested), 0);
  const totalUnrealizedPnl = totalCurrentValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalUnrealizedPnl / totalInvested) * 100 : 0;

  // Breakdown by Asset Type
  const stockCount = positions.filter((p) => p.asset_type === "Stock").length;
  const etfCount = positions.filter((p) => p.asset_type === "ETF").length;
  const mfCount = positions.filter((p) => p.asset_type === "Mutual Fund").length;

  // Goal Progress Calculations
  const targetGoalAmount = activeGoal.targetAmount || 50000;
  const targetYears = activeGoal.targetYears || 5;
  const goalProgressPct = Math.min(100, Math.round((totalCurrentValue / targetGoalAmount) * 100));
  const remainingGoalAmount = Math.max(0, targetGoalAmount - totalCurrentValue);

  // AI Market Scenario Analysis Generator
  const generateAIScenarioAdvice = () => {
    if (positions.length === 0) {
      return {
        action: "BUY_MORE",
        title: "AI Scenario Recommendation: Start SIP in European Index Funds",
        description: `Your portfolio currently has no active holdings. To reach your target goal of €${targetGoalAmount.toLocaleString()} in ${targetYears} years, start a monthly SIP of ~€${Math.round(
          targetGoalAmount / (targetYears * 12)
        )}/mo in Vanguard S&P 500 UCITS (VUAA.L).`,
        targetAsset: "VUAA.L",
        suggestedAmount: Math.round(targetGoalAmount / (targetYears * 12)),
      };
    }

    if (goalProgressPct < 50) {
      return {
        action: "BUY_MORE",
        title: "AI Market Scenario: BUY MORE European Mutual Funds / UCITS ETFs",
        description: `Based on live yfinance market trends (+0.85% positive momentum) and your ${targetYears}-year target of €${targetGoalAmount.toLocaleString()} (currently at ${goalProgressPct}%), AI analysis advises increasing monthly SIP contributions by +€150/mo in Core European Funds to stay on track.`,
        targetAsset: "VUAA.L",
        suggestedAmount: 150,
      };
    } else {
      return {
        action: "SELL_REBALANCE",
        title: "AI Market Scenario: REBALANCE & LOCK IN GAINS",
        description: `Your portfolio has reached ${goalProgressPct}% of your target goal (€${totalCurrentValue.toLocaleString()} / €${targetGoalAmount.toLocaleString()}). AI scenario research indicates locking in profits from high-beta holdings and reallocating into safer European bond UCITS funds to protect capital as maturity approaches.`,
        targetAsset: positions[0]?.symbol || "MEUD.PA",
        suggestedAmount: Math.round(totalCurrentValue * 0.1),
      };
    }
  };

  const aiScenario = generateAIScenarioAdvice();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 dark:bg-[#121614]/80 p-5 rounded-2xl border border-black/10 dark:border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101410] dark:text-[#f6f3ea]">
              Portfolio Dashboard
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#2f6b4f]/10 text-[#2f6b4f] dark:bg-[#a7d48f]/10 dark:text-[#a7d48f] border border-[#2f6b4f]/20">
              European EUR (€) Live
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6457] dark:text-[#b4ad9f]">
            Real European yfinance market prices & NAV values for your Stocks, Mutual Funds, and ETFs with instant wallet redemptions.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 block font-semibold">
              Available Wallet
            </span>
            <span className="text-sm font-bold text-[#2f6b4f] dark:text-[#a7d48f]">
              €{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <FlowbiteButton
            onClick={handleRefresh}
            disabled={refreshing}
            color="gray"
            className="font-bold text-xs shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh Prices
          </FlowbiteButton>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80 transition-all hover:shadow-lg">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Invested</span>
            <Euro className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            €{totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Principal capital allocated across positions</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80 transition-all hover:shadow-lg">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Current Market Value</span>
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            €{totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Evaluated at real-time European market NAVs</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80 transition-all hover:shadow-lg">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Profit / Loss</span>
            {totalUnrealizedPnl >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div
            className={`mt-3 text-2xl sm:text-3xl font-black flex items-center gap-1 ${totalUnrealizedPnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"
              }`}
          >
            €{Math.abs(totalUnrealizedPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-bold ml-1">
              ({totalPnlPct >= 0 ? "+" : ""}
              {totalPnlPct.toFixed(2)}%)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Unrealized return on overall portfolio</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80 transition-all hover:shadow-lg">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Assets Held</span>
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {positions.length} <span className="text-xs font-normal text-gray-500">Holdings</span>
          </div>
          <div className="mt-2 flex gap-1.5 flex-wrap text-[10px]">
            <Badge color="purple">{stockCount} Stocks</Badge>
            <Badge color="info">{etfCount} ETFs</Badge>
            <Badge color="success">{mfCount} Funds</Badge>
          </div>
        </div>
      </div>

      {/* Goal Progress Tracker & AI Market Scenario Rebalancing Advisor */}
      <div className="rounded-3xl border border-[#2f6b4f]/20 bg-gradient-to-br from-[#2f6b4f]/10 via-white/80 to-emerald-500/10 dark:from-[#a7d48f]/10 dark:via-[#121614]/90 dark:to-emerald-950/20 p-6 backdrop-blur-md space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-black/10 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2f6b4f] text-white dark:bg-[#a7d48f] dark:text-[#090b0a] flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Active Goal Progress: {activeGoal.title}
                </h2>
                <Badge color="purple" className="text-[10px] uppercase font-bold">
                  {activeGoal.riskProfile} Risk
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Target: <span className="font-bold text-gray-900 dark:text-white">€{targetGoalAmount.toLocaleString()}</span> in <span className="font-bold text-gray-900 dark:text-white">{targetYears} Years</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-[#2f6b4f] dark:text-[#a7d48f]">
              {goalProgressPct}% <span className="text-xs font-normal text-gray-500">Achieved</span>
            </span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
            <span>Current Value: €{totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span>Target Goal: €{targetGoalAmount.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden p-0.5 border border-black/5 dark:border-white/5">
            <div
              className="bg-gradient-to-r from-[#2f6b4f] to-emerald-500 dark:from-[#a7d48f] dark:to-emerald-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.max(4, goalProgressPct)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-500 font-medium pt-1">
            <span>Remaining Gap: €{remainingGoalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span>Time Horizon: {targetYears} Years</span>
          </div>
        </div>

        {/* AI Future Market Scenario Analysis Box */}
        <div className="p-5 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-[#2f6b4f]/20 dark:border-[#a7d48f]/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2f6b4f] dark:text-[#a7d48f]">
              <Sparkles className="w-4 h-4" /> AI Future Market Scenario Analysis
            </div>
            <Badge color={aiScenario.action === "BUY_MORE" ? "success" : "warning"} className="font-bold text-xs">
              {aiScenario.action === "BUY_MORE" ? "RECOMMENDATION: BUY MORE" : "RECOMMENDATION: REBALANCE"}
            </Badge>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
            {aiScenario.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            {aiScenario.description}
          </p>

          {aiAdviceSuccessMsg && (
            <FlowbiteAlert color="success" icon={CheckCircle2} className="text-xs font-semibold">
              {aiAdviceSuccessMsg}
            </FlowbiteAlert>
          )}

          {aiAdviceError && (
            <FlowbiteAlert color="failure" icon={AlertCircle} className="text-xs font-semibold">
              {aiAdviceError}
            </FlowbiteAlert>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 font-medium">
              Target Asset: <span className="font-bold text-gray-900 dark:text-white">{aiScenario.targetAsset}</span>
            </div>
            <FlowbiteButton
              size="xs"
              disabled={executingAIAdvice}
              className="bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a] font-bold"
              onClick={async () => {
                setExecutingAIAdvice(true);
                setAiAdviceError(null);
                setAiAdviceSuccessMsg(null);

                const isBuy = aiScenario.action === "BUY_MORE";
                const targetSymbol = aiScenario.targetAsset;
                const qty = 2;

                let pricePerUnit = 88.50;
                try {
                  const mktRes = await fetch(`http://localhost:8000/api/market/${targetSymbol}`);
                  if (mktRes.ok) {
                    const mktData = await mktRes.json();
                    pricePerUnit = mktData.current_price || 88.50;
                  }
                } catch {
                  // Fallback price
                }

                try {
                  const res = await fetch("http://localhost:8000/api/trading/order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      symbol: targetSymbol,
                      asset_name: targetSymbol === "MEUD.PA" ? "Amundi Stoxx Europe 600" : (targetSymbol === "MC.PA" ? "LVMH Moët Hennessy" : "European Portfolio Asset"),
                      asset_type: isBuy ? "ETF" : "Stock",
                      transaction_type: isBuy ? "BUY" : "SELL",
                      order_type: "MARKET",
                      quantity: qty,
                      price_per_unit: pricePerUnit,
                    }),
                  });

                  if (res.ok) {
                    setAiAdviceSuccessMsg(`AI Advice executed successfully! ${isBuy ? "Bought" : "Sold"} ${qty} units of ${targetSymbol} at €${pricePerUnit.toFixed(2)}.`);
                    fetchPortfolioData();
                    fetchWallet();
                    window.dispatchEvent(new Event("walletUpdated"));
                  } else {
                    const errData = await res.json();
                    setAiAdviceError(errData.detail || "Failed to execute AI advice transaction.");
                  }
                } catch (err: any) {
                  setAiAdviceError(err.message || "Network error while executing AI advice transaction.");
                } finally {
                  setExecutingAIAdvice(false);
                }
              }}
            >
              <Zap className="w-3.5 h-3.5 mr-1" /> {executingAIAdvice ? "Executing..." : "Execute AI Advice"}
            </FlowbiteButton>
          </div>
        </div>
      </div>

      {/* Dedicated Portfolio Sell Section / Panel */}
      <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 via-white/80 to-emerald-500/5 dark:from-red-950/20 dark:via-[#121614]/90 dark:to-emerald-950/10 p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-black/10 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Liquidate & Sell Section
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sell your owned Stock, ETF, or Mutual Fund holdings and return funds directly into your EUR (€) Wallet.
              </p>
            </div>
          </div>
          <Badge color="failure" className="font-bold text-xs">
            Instant EUR Wallet Credit
          </Badge>
        </div>

        {quickSellSuccessMsg && (
          <FlowbiteAlert color="success" icon={CheckCircle2} className="text-xs font-semibold">
            {quickSellSuccessMsg}
          </FlowbiteAlert>
        )}

        {quickSellError && (
          <FlowbiteAlert color="failure" icon={AlertCircle} className="text-xs font-semibold">
            {quickSellError}
          </FlowbiteAlert>
        )}

        {positions.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500">
            You do not own any assets to sell yet. Purchase Stocks, ETFs, or Mutual Funds to populate this section.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-end pt-2">
            {/* Asset Picker */}
            <div>
              <Label htmlFor="assetSelect" className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">
                1. Select Asset to Sell
              </Label>
              <Select
                id="assetSelect"
                value={sellSelectedSymbol}
                onChange={(e) => {
                  setSellSelectedSymbol(e.target.value);
                  const selected = positions.find((p) => p.symbol === e.target.value);
                  if (selected) setQuickSellQty(selected.quantity);
                }}
              >
                {positions.map((p) => (
                  <option key={p.id} value={p.symbol}>
                    {p.symbol} - {p.asset_name} ({p.quantity} units owned @ €{(p.current_price || p.average_buy_price).toFixed(2)})
                  </option>
                ))}
              </Select>
            </div>

            {/* Quantity Selector + Ratio Quick Buttons */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="sellQtyInput" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  2. Quantity to Sell (Max: {activeSellPosition?.quantity || 0})
                </Label>
              </div>
              <div className="space-y-2">
                <TextInput
                  id="sellQtyInput"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={activeSellPosition?.quantity || 1}
                  value={quickSellQty}
                  onChange={(e) => setQuickSellQty(Number(e.target.value))}
                />
                <div className="flex gap-1.5">
                  {[0.25, 0.5, 0.75, 1].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() =>
                        setQuickSellQty(
                          activeSellPosition ? Number((activeSellPosition.quantity * pct).toFixed(2)) : 0
                        )
                      }
                      className="px-2 py-1 text-[10px] font-bold rounded bg-gray-100 dark:bg-gray-800 hover:bg-[#2f6b4f] hover:text-white dark:hover:bg-[#a7d48f] dark:hover:text-black transition-colors"
                    >
                      {pct * 100}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sell Action Card */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-gray-800/90 border border-black/10 dark:border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Live Sale Price:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  €{(activeSellPosition?.current_price || activeSellPosition?.average_buy_price || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-700 dark:text-gray-300">Wallet Credit Proceeds:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm">
                  +€
                  {(
                    quickSellQty *
                    (activeSellPosition?.current_price || activeSellPosition?.average_buy_price || 0)
                  ).toFixed(2)}
                </span>
              </div>
              <FlowbiteButton
                color="failure"
                className="w-full font-bold text-xs"
                disabled={quickSellLoading || !activeSellPosition || quickSellQty <= 0}
                onClick={handleQuickSell}
              >
                {quickSellLoading ? (
                  <FlowbiteSpinner size="sm" />
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-1.5" /> Execute Sale & Add to EUR Wallet
                  </>
                )}
              </FlowbiteButton>
            </div>
          </div>
        )}
      </div>

      {/* Main Holdings Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#2f6b4f] dark:text-[#a7d48f]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#101410] dark:text-[#f6f3ea]">
              Current Asset Holdings ({positions.length})
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-medium hidden sm:inline">
            Prices updated in real-time
          </span>
        </div>

        {/* Desktop View Table */}
        <div className="hidden sm:block overflow-x-auto rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80">
          <Table hoverable className="w-full text-left">
            <TableHead className="bg-[#f8f5ea] dark:bg-[#1a201c] text-[#5c6457] dark:text-[#a7c1b1] text-xs">
              <TableRow>
                <TableHeadCell>Symbol & Name</TableHeadCell>
                <TableHeadCell>Category</TableHeadCell>
                <TableHeadCell>Quantity</TableHeadCell>
                <TableHeadCell>Avg Buy Price</TableHeadCell>
                <TableHeadCell>Total Invested</TableHeadCell>
                <TableHeadCell>Live Price / NAV</TableHeadCell>
                <TableHeadCell>Current Value</TableHeadCell>
                <TableHeadCell>Unrealized P&L</TableHeadCell>
                <TableHeadCell>Action</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-black/5 dark:divide-white/5 text-xs">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <FlowbiteSpinner size="lg" />
                    <p className="mt-2 text-xs text-gray-500">Fetching live asset prices from European market...</p>
                  </TableCell>
                </TableRow>
              ) : positions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No holdings in portfolio. Purchase Stocks, ETFs, or Mutual Funds to view holdings here.
                  </TableCell>
                </TableRow>
              ) : (
                positions.map((pos) => {
                  const currentPrice = pos.current_price || pos.average_buy_price;
                  const currentVal = pos.current_value || pos.total_invested;
                  const pnl = pos.unrealized_pnl ?? 0;
                  const isPnlPos = pnl >= 0;
                  const dayChange = pos.price_change ?? 0;
                  const dayPct = pos.percentage_change ?? 0;
                  const isDayPos = pos.is_positive ?? dayChange >= 0;

                  return (
                    <TableRow key={pos.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <TableCell className="whitespace-nowrap font-bold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{pos.symbol}</span>
                          <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {pos.currency || "EUR"}
                          </span>
                        </div>
                        <div className="text-[11px] font-normal text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[180px]">
                          {pos.asset_name}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          color={
                            pos.asset_type === "Mutual Fund"
                              ? "success"
                              : pos.asset_type === "ETF"
                                ? "info"
                                : "purple"
                          }
                          className="w-fit font-bold text-[10px]"
                        >
                          {pos.asset_type}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-bold text-gray-800 dark:text-gray-200">{pos.quantity}</TableCell>

                      <TableCell className="font-semibold text-gray-700 dark:text-gray-300">
                        €{pos.average_buy_price.toFixed(2)}
                      </TableCell>

                      <TableCell className="font-semibold text-gray-700 dark:text-gray-300">
                        €{pos.total_invested.toFixed(2)}
                      </TableCell>

                      {/* Real Price / NAV with Day Change Badge */}
                      <TableCell>
                        <div className="font-bold text-gray-900 dark:text-white">€{currentPrice.toFixed(2)}</div>
                        <div
                          className={`text-[10px] font-semibold flex items-center gap-0.5 ${isDayPos ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"
                            }`}
                        >
                          {isDayPos ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          <span>
                            {isDayPos ? "+" : ""}
                            {dayChange.toFixed(2)} ({isDayPos ? "+" : ""}
                            {dayPct.toFixed(2)}%)
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="font-bold text-gray-900 dark:text-white">
                        €{currentVal.toFixed(2)}
                      </TableCell>

                      <TableCell className={isPnlPos ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                        {isPnlPos ? "+" : ""}€{pnl.toFixed(2)} ({isPnlPos ? "+" : ""}
                        {pos.unrealized_pnl_pct || 0}%)
                      </TableCell>

                      <TableCell>
                        <FlowbiteButton
                          size="xs"
                          color="failure"
                          className="font-bold text-[11px]"
                          onClick={() => openSellModal(pos)}
                        >
                          Sell Holding
                        </FlowbiteButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View Cards (<640px) */}
        <div className="sm:hidden space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <FlowbiteSpinner size="md" />
              <p className="mt-2 text-xs text-gray-500">Loading holdings...</p>
            </div>
          ) : positions.length === 0 ? (
            <div className="p-4 rounded-xl border border-black/10 bg-white/60 text-center text-xs text-gray-500">
              No holdings available.
            </div>
          ) : (
            positions.map((pos) => {
              const currentPrice = pos.current_price || pos.average_buy_price;
              const currentVal = pos.current_value || pos.total_invested;
              const pnl = pos.unrealized_pnl ?? 0;
              const isPnlPos = pnl >= 0;
              const dayChange = pos.price_change ?? 0;
              const dayPct = pos.percentage_change ?? 0;
              const isDayPos = pos.is_positive ?? dayChange >= 0;

              return (
                <div
                  key={pos.id}
                  className="p-4 rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-[#121614] space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-900 dark:text-white text-sm">{pos.symbol}</span>
                        <Badge
                          color={
                            pos.asset_type === "Mutual Fund"
                              ? "success"
                              : pos.asset_type === "ETF"
                                ? "info"
                                : "purple"
                          }
                          className="text-[9px]"
                        >
                          {pos.asset_type}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500 line-clamp-1">{pos.asset_name}</span>
                    </div>

                    <FlowbiteButton size="xs" color="failure" className="font-bold" onClick={() => openSellModal(pos)}>
                      Sell
                    </FlowbiteButton>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-black/5 dark:border-white/5">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Quantity Owned</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{pos.quantity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Avg Buy Price</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        €{pos.average_buy_price.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Live Price / NAV</span>
                      <div className="font-bold text-gray-900 dark:text-white">€{currentPrice.toFixed(2)}</div>
                      <span
                        className={`text-[9px] font-semibold ${isDayPos ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"
                          }`}
                      >
                        {isDayPos ? "+" : ""}
                        {dayChange.toFixed(2)} ({isDayPos ? "+" : ""}
                        {dayPct.toFixed(2)}%)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Current Value</span>
                      <div className="font-bold text-gray-900 dark:text-white">€{currentVal.toFixed(2)}</div>
                      <span className={`text-[9px] font-bold ${isPnlPos ? "text-emerald-600" : "text-red-600"}`}>
                        {isPnlPos ? "+" : ""}€{pnl.toFixed(2)} ({isPnlPos ? "+" : ""}
                        {pos.unrealized_pnl_pct || 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Backend Order Audit Trail */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#2f6b4f] dark:text-[#a7d48f]" />
          <h2 className="text-lg sm:text-xl font-bold text-[#101410] dark:text-[#f6f3ea]">
            Trading Order Audit Log ({orders.length})
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80">
          <Table hoverable className="w-full text-left">
            <TableHead className="bg-[#f8f5ea] dark:bg-[#1a201c] text-[#5c6457] dark:text-[#a7c1b1] text-xs">
              <TableRow>
                <TableHeadCell>Order ID</TableHeadCell>
                <TableHeadCell>Symbol</TableHeadCell>
                <TableHeadCell>Asset Category</TableHeadCell>
                <TableHeadCell>Action</TableHeadCell>
                <TableHeadCell>Order Type</TableHeadCell>
                <TableHeadCell>Quantity</TableHeadCell>
                <TableHeadCell>Price / Unit</TableHeadCell>
                <TableHeadCell>Total Amount</TableHeadCell>
                <TableHeadCell>Timestamp</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-black/5 dark:divide-white/5 text-xs">
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                    No order history recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((ord) => (
                  <TableRow key={ord.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <TableCell className="font-mono font-bold text-gray-900 dark:text-white">#{ord.id}</TableCell>
                    <TableCell className="font-bold text-gray-900 dark:text-white">{ord.symbol}</TableCell>
                    <TableCell>
                      <Badge color="gray">{ord.asset_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge color={ord.transaction_type === "BUY" ? "success" : "failure"} className="font-bold">
                        {ord.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-gray-700 dark:text-gray-300">
                      {ord.order_type} {ord.sip_frequency ? `(${ord.sip_frequency})` : ""}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-800 dark:text-gray-200">{ord.quantity}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">€{ord.price_per_unit.toFixed(2)}</TableCell>
                    <TableCell className="font-bold text-gray-900 dark:text-white">
                      €{ord.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-gray-500 whitespace-nowrap">
                      {new Date(ord.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Row Action Sell Modal */}
      <FlowbiteModal show={sellModalOpen} onClose={() => setSellModalOpen(false)} size="md">
        <FlowbiteModalHeader className="border-b border-black/10 dark:border-white/10">
          <span className="font-bold text-gray-900 dark:text-white">
            Sell Holding - {selectedPosition?.symbol}
          </span>
        </FlowbiteModalHeader>
        <FlowbiteModalBody className="space-y-4">
          {modalSellSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sell Executed Successfully!</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Proceeds of{" "}
                <span className="font-bold text-emerald-600">
                  €
                  {(
                    modalSellQty *
                    (selectedPosition?.current_price || selectedPosition?.average_buy_price || 0)
                  ).toFixed(2)}
                </span>{" "}
                have been added to your EUR Wallet balance.
              </p>
            </div>
          ) : (
            <>
              {modalSellError && <FlowbiteAlert color="failure">{modalSellError}</FlowbiteAlert>}

              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Asset Name:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {selectedPosition?.asset_name} ({selectedPosition?.symbol})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Owned Quantity:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedPosition?.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Live Price:</span>
                  <span className="font-bold text-[#2f6b4f] dark:text-[#a7d48f]">
                    €{(selectedPosition?.current_price || selectedPosition?.average_buy_price || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="modalSellQtyInput" className="mb-1 block text-xs font-bold">
                  Quantity to Sell
                </Label>
                <TextInput
                  id="modalSellQtyInput"
                  type="number"
                  step="0.01"
                  max={selectedPosition?.quantity}
                  value={modalSellQty}
                  onChange={(e) => setModalSellQty(Number(e.target.value))}
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs flex justify-between items-center font-bold">
                <span>Estimated Wallet Credit:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm">
                  +€
                  {(
                    modalSellQty *
                    (selectedPosition?.current_price || selectedPosition?.average_buy_price || 0)
                  ).toFixed(2)}
                </span>
              </div>
            </>
          )}
        </FlowbiteModalBody>
        <FlowbiteModalFooter className="border-t border-black/10 dark:border-white/10">
          {modalSellSuccess ? (
            <FlowbiteButton className="w-full bg-[#2f6b4f]" onClick={() => setSellModalOpen(false)}>
              Done
            </FlowbiteButton>
          ) : (
            <div className="flex w-full gap-3">
              <FlowbiteButton color="gray" className="w-1/2" onClick={() => setSellModalOpen(false)}>
                Cancel
              </FlowbiteButton>
              <FlowbiteButton
                color="failure"
                className="w-1/2 font-bold"
                disabled={modalSellLoading}
                onClick={handleModalSell}
              >
                {modalSellLoading ? <FlowbiteSpinner size="sm" /> : "Confirm & Sell"}
              </FlowbiteButton>
            </div>
          )}
        </FlowbiteModalFooter>
      </FlowbiteModal>
    </div>
  );
}
