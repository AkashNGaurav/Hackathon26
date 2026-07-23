"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Select,
  TextInput,
  Label,
  Alert,
} from "flowbite-react";
import { Search, Filter, Sparkles, TrendingUp, TrendingDown, DollarSign, CheckCircle2, ShoppingBag } from "lucide-react";

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

export interface AIRecommendationResult {
  recommended_symbol: string;
  recommended_name: string;
  recommendation_summary: string;
  analysis_details: string[];
  risk_profile: string;
}

const COMPREHENSIVE_TICKERS = [
  // European Stocks
  "MC.PA", "ASML.AS", "VW.DE", "SAP.DE", "OR.PA", "AIR.PA",
  // European ETFs
  "VUAA.L", "IWDA.AS", "MEUD.PA",
  // European Mutual Funds
  "C3M.PA", "EUEA.PA"
];

const INITIAL_FALLBACK_DATA: EUAssetItem[] = [
  { symbol: "MC.PA", name: "LVMH Moët Hennessy Louis Vuitton", asset_type: "Stock", exchange: "Euronext Paris", currency: "EUR", current_price: 718.40, price_change: 8.60, percentage_change: 1.21, is_positive: true, market_status: "OPEN" },
  { symbol: "ASML.AS", name: "ASML Holding N.V.", asset_type: "Stock", exchange: "Euronext Amsterdam", currency: "EUR", current_price: 842.10, price_change: 10.60, percentage_change: 1.27, is_positive: true, market_status: "OPEN" },
  { symbol: "VW.DE", name: "Volkswagen AG Preference", asset_type: "Stock", exchange: "XETRA Germany", currency: "EUR", current_price: 96.55, price_change: -0.85, percentage_change: -0.87, is_positive: false, market_status: "OPEN" },
  { symbol: "SAP.DE", name: "SAP SE", asset_type: "Stock", exchange: "XETRA Germany", currency: "EUR", current_price: 194.80, price_change: 2.40, percentage_change: 1.25, is_positive: true, market_status: "OPEN" },
  { symbol: "OR.PA", name: "L'Oréal S.A.", asset_type: "Stock", exchange: "Euronext Paris", currency: "EUR", current_price: 388.50, price_change: 3.30, percentage_change: 0.86, is_positive: true, market_status: "OPEN" },
  { symbol: "AIR.PA", name: "Airbus SE", asset_type: "Stock", exchange: "Euronext Paris", currency: "EUR", current_price: 134.60, price_change: 1.50, percentage_change: 1.13, is_positive: true, market_status: "OPEN" },
  { symbol: "VUAA.L", name: "Vanguard S&P 500 UCITS ETF (EUR)", asset_type: "ETF", exchange: "London Stock Exchange", currency: "EUR", current_price: 94.25, price_change: 0.65, percentage_change: 0.69, is_positive: true, market_status: "OPEN" },
  { symbol: "IWDA.AS", name: "iShares Core MSCI World UCITS ETF (EUR)", asset_type: "ETF", exchange: "Euronext Amsterdam", currency: "EUR", current_price: 88.50, price_change: 0.60, percentage_change: 0.68, is_positive: true, market_status: "OPEN" },
  { symbol: "MEUD.PA", name: "Amundi Stoxx Europe 600 UCITS ETF (EUR)", asset_type: "ETF", exchange: "Euronext Paris", currency: "EUR", current_price: 412.30, price_change: 1.80, percentage_change: 0.44, is_positive: true, market_status: "OPEN" },
  { symbol: "C3M.PA", name: "Amundi EUR Cash UCITS Mutual Fund", asset_type: "Mutual Fund", exchange: "Euronext Paris", currency: "EUR", current_price: 105.40, price_change: 0.05, percentage_change: 0.05, is_positive: true, market_status: "OPEN" },
  { symbol: "EUEA.PA", name: "iShares MSCI Europe UCITS Mutual Fund", asset_type: "Mutual Fund", exchange: "Euronext Paris", currency: "EUR", current_price: 76.20, price_change: 0.40, percentage_change: 0.53, is_positive: true, market_status: "OPEN" },
];

export function EUMarketTable() {
  const [assets, setAssets] = useState<EUAssetItem[]>(INITIAL_FALLBACK_DATA);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"All" | "Stock" | "ETF" | "Mutual Fund">("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [riskProfile, setRiskProfile] = useState<string>("moderate");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIRecommendationResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Buy Asset Modal State
  const [buyModalOpen, setBuyModalOpen] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<EUAssetItem | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [buyLoading, setBuyLoading] = useState<boolean>(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buySuccess, setBuySuccess] = useState<boolean>(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const openBuyModal = (asset: EUAssetItem) => {
    setSelectedAsset(asset);
    setBuyQuantity(1);
    setBuyError(null);
    setBuySuccess(false);
    setBuyModalOpen(true);
  };

  const handleExecuteBuy = async () => {
    if (!selectedAsset || buyQuantity <= 0) return;
    setBuyError(null);
    setBuyLoading(true);

    try {
      const totalCost = Number((buyQuantity * selectedAsset.current_price).toFixed(2));
      const res = await fetch("http://localhost:8000/api/trading/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedAsset.symbol,
          asset_name: selectedAsset.name,
          asset_type: selectedAsset.asset_type,
          transaction_type: "BUY",
          order_type: "LUMP_SUM",
          quantity: buyQuantity,
          price_per_unit: selectedAsset.current_price,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Order failed" }));
        throw new Error(errData.detail || "Order failed");
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
      setBuyError(err.message || "Could not complete asset purchase.");
    } finally {
      setBuyLoading(false);
    }
  };

  useEffect(() => {
    async function loadAllAssets() {
      setLoading(true);
      try {
        const fetched = await Promise.all(
          COMPREHENSIVE_TICKERS.map(async (ticker) => {
            const res = await fetch(`http://localhost:8000/api/market/${ticker}`);
            if (res.ok) return await res.json();
            return null;
          })
        );
        const valid = fetched.filter((item): item is EUAssetItem => item !== null);
        if (valid.length > 0) {
          setAssets(valid);
        }
      } catch (err) {
        console.error("Failed to load combined asset market data", err);
      } finally {
        setLoading(false);
      }
    }
    loadAllAssets();
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesTab = activeTab === "All" || asset.asset_type === activeTab;
      const matchesSearch =
        searchQuery === "" ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [assets, activeTab, searchQuery]);

  const handleGetAiRecommendation = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const symbols = assets.map((a) => a.symbol);
      const response = await fetch("http://localhost:8000/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols, risk_profile: riskProfile }),
      });
      if (response.ok) {
        const data: AIRecommendationResult = await response.json();
        setAiResult(data);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("AI Recommendation Error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const getAssetBadgeColor = (type: string) => {
    switch (type) {
      case "Stock": return "purple";
      case "ETF": return "info";
      case "Mutual Fund": return "success";
      default: return "gray";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#101410] dark:text-[#f6f3ea]">
            Global Asset Universe
          </h2>
          <p className="mt-1 text-xs text-[#5c6457] dark:text-[#b4ad9f]">
            Explore and filter real-time Stocks, ETFs, and Mutual Funds in a single unified view.
          </p>
        </div>

        {/* AI Advisor Trigger */}
        <div className="flex items-center gap-3">
          <Select
            value={riskProfile}
            onChange={(e) => setRiskProfile(e.target.value)}
            className="text-xs"
          >
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </Select>
          <Button
            onClick={handleGetAiRecommendation}
            disabled={aiLoading}
            className="bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a] font-bold text-xs shadow-md"
          >
            {aiLoading ? <Spinner size="sm" className="mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            AI Recommendation
          </Button>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/80">
          {(["All", "Stock", "ETF", "Mutual Fund"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === tab
                  ? "bg-white dark:bg-gray-700 text-[#2f6b4f] dark:text-[#a7d48f] shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              {tab === "All" ? "All Assets" : `${tab}s`}
            </button>
          ))}
        </div>

        {/* Quick Filter Search */}
        <div className="w-full sm:w-72">
          <TextInput
            type="text"
            placeholder="Search symbol or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>
      </div>

      {/* Unified Asset Table */}
      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white/60 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80">
        <Table hoverable className="w-full text-left">
          <TableHead className="bg-[#f8f5ea] dark:bg-[#1a201c] text-[#5c6457] dark:text-[#a7c1b1]">
            <TableRow>
              <TableHeadCell>Asset Name / Symbol</TableHeadCell>
              <TableHeadCell>Asset Category</TableHeadCell>
              <TableHeadCell>Exchange</TableHeadCell>
              <TableHeadCell>Current Price</TableHeadCell>
              <TableHeadCell>Change ($)</TableHeadCell>
              <TableHeadCell>Change (%)</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Trade Action</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y divide-black/5 dark:divide-white/5">
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Spinner size="lg" />
                  <p className="mt-2 text-xs text-gray-500">Loading asset market data...</p>
                </TableCell>
              </TableRow>
            ) : filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-xs text-gray-500">
                  No assets matching your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset) => (
                <TableRow key={asset.symbol} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <TableCell className="whitespace-nowrap font-bold text-gray-900 dark:text-white">
                    <div>{asset.symbol}</div>
                    <div className="text-xs font-normal text-gray-500 dark:text-gray-400 line-clamp-1">{asset.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge color={getAssetBadgeColor(asset.asset_type)} className="w-fit font-bold">
                      {asset.asset_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600 dark:text-gray-300">{asset.exchange}</TableCell>
                  <TableCell className="font-semibold text-gray-900 dark:text-white">
                    €{asset.current_price} <span className="text-[10px] text-gray-400">{asset.currency}</span>
                  </TableCell>
                  <TableCell className={asset.is_positive ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                    {asset.is_positive ? "+" : ""}{asset.price_change}
                  </TableCell>
                  <TableCell>
                    <Badge color={asset.is_positive ? "success" : "failure"} className="w-fit font-bold">
                      {asset.is_positive ? "+" : ""}{asset.percentage_change}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge color="info">{asset.market_status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="xs"
                      className="bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a] font-bold"
                      onClick={() => openBuyModal(asset)}
                    >
                      <ShoppingBag className="w-3 h-3 mr-1" /> Buy Asset
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Buy Asset Modal */}
      <Modal show={buyModalOpen} onClose={() => setBuyModalOpen(false)} size="md">
        <ModalHeader className="border-b border-black/10 dark:border-white/10">
          <span className="font-bold text-gray-900 dark:text-white">Buy {selectedAsset?.symbol} ({selectedAsset?.asset_type})</span>
        </ModalHeader>
        <ModalBody className="space-y-4">
          {buySuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Trade Executed Successfully!</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Bought <span className="font-bold text-gray-900 dark:text-white">{buyQuantity} units</span> of <span className="font-bold text-[#2f6b4f] dark:text-[#a7d48f]">{selectedAsset?.symbol}</span>. Total cost of <span className="font-bold text-emerald-600">${(buyQuantity * (selectedAsset?.current_price || 0)).toFixed(2)}</span> has been deducted from your Digital Wallet.
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
                  <span className="font-bold text-gray-900 dark:text-white">{selectedAsset?.name} ({selectedAsset?.symbol})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedAsset?.asset_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Market Price:</span>
                  <span className="font-bold text-[#2f6b4f] dark:text-[#a7d48f]">€{selectedAsset?.current_price}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="assetQty" className="mb-1 block text-xs font-bold">Quantity to Buy</Label>
                <TextInput
                  id="assetQty"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(Number(e.target.value))}
                />
              </div>

              <div className="p-3 rounded-lg bg-[#2f6b4f]/10 dark:bg-[#a7d48f]/10 border border-[#2f6b4f]/20 text-xs flex justify-between items-center font-bold">
                <span>Total Cost (Deducted from Wallet):</span>
                <span className="text-[#2f6b4f] dark:text-[#a7d48f] text-sm">
                  €{(buyQuantity * (selectedAsset?.current_price || 0)).toFixed(2)}
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

      {/* AI Recommendation Modal */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalHeader className="border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2f6b4f] dark:text-[#a7d48f]" />
            <span className="font-bold text-gray-900 dark:text-white">AI Asset Recommendation</span>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-4">
          {aiResult && (
            <>
              <div className="p-4 rounded-xl bg-[#2f6b4f]/10 dark:bg-[#a7d48f]/10 border border-[#2f6b4f]/20 dark:border-[#a7d48f]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase text-[#2f6b4f] dark:text-[#a7d48f]">Recommended Asset</span>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{aiResult.recommended_symbol}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{aiResult.recommended_name}</p>
                  </div>
                  <Badge color="success" className="text-xs uppercase font-bold">{aiResult.risk_profile} Risk</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Investment Rationale</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  {aiResult.recommendation_summary}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Key Analysis Insights</h4>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300 list-disc list-inside">
                  {aiResult.analysis_details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setIsModalOpen(false)} className="w-full">
            Close Analysis
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default EUMarketTable;
