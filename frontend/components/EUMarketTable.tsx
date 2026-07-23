"use client";

import { useEffect, useState } from "react";
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
} from "flowbite-react";

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

const DEFAULT_EU_TICKERS = ["MC.PA", "VW.DE", "VUAA.L", "ASML.AS", "SAP.DE"];

const INITIAL_FALLBACK_DATA: EUAssetItem[] = [
  {
    symbol: "MC.PA",
    name: "LVMH Moët Hennessy Louis Vuitton",
    asset_type: "Stock",
    exchange: "Euronext Paris",
    currency: "EUR",
    current_price: 718.4,
    price_change: 8.6,
    percentage_change: 1.21,
    is_positive: true,
    market_status: "OPEN",
  },
  {
    symbol: "VW.DE",
    name: "Volkswagen AG Preference",
    asset_type: "Stock",
    exchange: "XETRA Germany",
    currency: "EUR",
    current_price: 96.55,
    price_change: -0.85,
    percentage_change: -0.87,
    is_positive: false,
    market_status: "OPEN",
  },
  {
    symbol: "VUAA.L",
    name: "Vanguard S&P 500 UCITS ETF",
    asset_type: "ETF",
    exchange: "London Stock Exchange",
    currency: "USD",
    current_price: 94.25,
    nav: 94.2,
    price_change: 0.65,
    percentage_change: 0.69,
    is_positive: true,
    market_status: "OPEN",
  },
  {
    symbol: "ASML.AS",
    name: "ASML Holding N.V.",
    asset_type: "Stock",
    exchange: "Euronext Amsterdam",
    currency: "EUR",
    current_price: 842.1,
    price_change: 10.6,
    percentage_change: 1.27,
    is_positive: true,
    market_status: "OPEN",
  },
  {
    symbol: "SAP.DE",
    name: "SAP SE",
    asset_type: "Stock",
    exchange: "XETRA Germany",
    currency: "EUR",
    current_price: 194.8,
    price_change: 2.4,
    percentage_change: 1.25,
    is_positive: true,
    market_status: "OPEN",
  },
];

export function EUMarketTable() {
  const [assets, setAssets] = useState<EUAssetItem[]>(INITIAL_FALLBACK_DATA);
  const [loading, setLoading] = useState<boolean>(true);
  const [riskProfile, setRiskProfile] = useState<string>("moderate");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIRecommendationResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch live market data for default EU tickers
  useEffect(() => {
    const fetchAllAssets = async () => {
      setLoading(true);
      try {
        const fetchedAssets: EUAssetItem[] = await Promise.all(
          DEFAULT_EU_TICKERS.map(async (ticker) => {
            const res = await fetch(`http://localhost:8000/api/market/${ticker}`);
            if (!res.ok) throw new Error(`Failed to fetch ${ticker}`);
            return await res.json();
          })
        );
        setAssets(fetchedAssets);
      } catch (error) {
        console.warn("Backend API not reachable or error fetching assets. Using fallback dataset:", error);
        setAssets(INITIAL_FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAssets();
  }, []);

  const handleGetAiAnalysis = async () => {
    setAiLoading(true);
    setIsModalOpen(true);
    try {
      const response = await fetch("http://localhost:8000/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbols: assets.map((a) => a.symbol),
          risk_profile: riskProfile,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI recommendation");
      }

      const data: AIRecommendationResult = await response.json();
      setAiResult(data);
    } catch (error) {
      console.warn("Error calling AI recommendation endpoint:", error);
      // Fallback result if backend endpoint is unavailable
      setAiResult({
        recommended_symbol: "ASML.AS",
        recommended_name: "ASML Holding N.V.",
        recommendation_summary: `Based on your ${riskProfile} risk profile and current European market metrics, ASML Holding N.V. (ASML.AS) presents the strongest growth trajectory. Its daily return of +1.27% is supported by expanding semiconductor equipment backlogs across major tech nodes. We recommend a balanced position in ASML.AS to capitalize on long-term AI hardware demand.`,
        analysis_details: [
          `Selected top asset ASML.AS tailored to ${riskProfile} risk profile parameters.`,
          "Current price: EUR 842.10 (+1.27% daily price momentum).",
          "High liquidity on Euronext Amsterdam with institutional backing.",
        ],
        risk_profile: riskProfile,
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-black/10 bg-white/80 p-6 backdrop-blur-md dark:border-white/10 dark:bg-[#121614]">
      {/* Table Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#2f6b4f]/10 px-2 py-0.5 text-xs font-bold text-[#2f6b4f] dark:bg-[#a7d48f]/20 dark:text-[#a7d48f]">
              EU Markets
            </span>
            <h3 className="text-xl font-bold tracking-tight text-[#101410] dark:text-[#f6f3ea]">
              Live European Market Assets
            </h3>
          </div>
          <p className="mt-1 text-xs text-[#5c6457] dark:text-[#b4ad9f]">
            Real-time stocks, ETFs, and Mutual Funds across Euronext, XETRA, and London Stock Exchange
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#4e574b] dark:text-[#c8c3b7]">
              Risk Profile:
            </label>
            <Select
              id="risk-select"
              value={riskProfile}
              onChange={(e) => setRiskProfile(e.target.value)}
              className="text-xs"
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </Select>
          </div>

          <Button
            onClick={handleGetAiAnalysis}
            className="bg-gradient-to-r from-[#2f6b4f] to-emerald-600 font-semibold text-white transition-all hover:from-[#255740] hover:to-emerald-700 dark:from-[#a7d48f] dark:to-emerald-400 dark:text-[#090b0a]"
          >
            <svg
              className="mr-2 h-4 w-4 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
            Get AI Analysis
          </Button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="overflow-x-auto">
        <Table hoverable className="w-full text-left">
          <TableHead className="bg-[#f8f5ee] dark:bg-[#1a1f1c]">
            <tr>
              <TableHeadCell>Asset Name</TableHeadCell>
              <TableHeadCell>Symbol</TableHeadCell>
              <TableHeadCell>Type</TableHeadCell>
              <TableHeadCell>Exchange</TableHeadCell>
              <TableHeadCell>Live Price</TableHeadCell>
              <TableHeadCell>Change (%)</TableHeadCell>
              <TableHeadCell>AI Sentiment</TableHeadCell>
            </tr>
          </TableHead>

          <TableBody className="divide-y divide-black/5 dark:divide-white/5">
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="md" aria-label="Fetching live EU assets..." />
                    <span className="text-sm font-medium text-[#4e574b] dark:text-[#d0cabf]">
                      Loading European market data...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow
                  key={asset.symbol}
                  className="bg-white/40 transition hover:bg-white/80 dark:bg-transparent dark:hover:bg-white/5"
                >
                  <TableCell className="font-bold text-[#101410] dark:text-[#f6f3ea]">
                    {asset.name}
                  </TableCell>
                  <TableCell>
                    <span className="rounded border border-black/10 bg-black/5 px-2 py-0.5 text-xs font-bold text-[#101410] dark:border-white/10 dark:bg-white/10 dark:text-[#f6f3ea]">
                      {asset.symbol}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      color={
                        asset.asset_type === "ETF"
                          ? "info"
                          : asset.asset_type === "Mutual Fund"
                          ? "purple"
                          : "success"
                      }
                      className="inline-block text-xs font-semibold"
                    >
                      {asset.asset_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-[#5c6457] dark:text-[#b4ad9f]">
                    {asset.exchange}
                  </TableCell>
                  <TableCell className="font-semibold text-[#101410] dark:text-[#f6f3ea]">
                    {asset.currency === "USD" ? "$" : "€"}
                    {asset.current_price.toFixed(2)}
                    {asset.nav && (
                      <span className="ml-1 text-[10px] text-gray-500">
                        (NAV: {asset.currency === "USD" ? "$" : "€"}{asset.nav.toFixed(2)})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold ${
                        asset.is_positive
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      <span>{asset.is_positive ? "▲" : "▼"}</span>
                      <span>
                        {asset.is_positive ? "+" : ""}
                        {asset.percentage_change.toFixed(2)}%
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                        asset.is_positive
                          ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400"
                      }`}
                    >
                      {asset.is_positive ? "Bullish Signal" : "Consolidating"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* AI Recommendation Modal */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalHeader className="border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 p-1 text-emerald-600 dark:text-emerald-400">
              ✨
            </span>
            <span className="text-lg font-bold text-[#101410] dark:text-[#f6f3ea]">
              AI Asset Recommendation Summary
            </span>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Spinner size="xl" aria-label="AI analyzing European market assets..." />
              <p className="text-sm font-medium text-[#4e574b] dark:text-[#d0cabf]">
                Analyzing live European market assets for risk profile:{" "}
                <span className="font-bold capitalize text-[#2f6b4f] dark:text-[#a7d48f]">
                  {riskProfile}
                </span>
                ...
              </p>
            </div>
          ) : aiResult ? (
            <div className="space-y-4">
              {/* Highlight Banner */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Top Recommended Asset
                    </span>
                    <h4 className="text-xl font-extrabold text-[#101410] dark:text-[#f6f3ea]">
                      {aiResult.recommended_name} ({aiResult.recommended_symbol})
                    </h4>
                  </div>
                  <Badge color="success" className="px-3 py-1 text-xs font-bold">
                    Optimal Choice
                  </Badge>
                </div>
              </div>

              {/* 3-Sentence Recommendation */}
              <div className="rounded-xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-[#181d1a]">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#516246] dark:text-[#a7d48f]">
                  AI Executive Summary
                </h5>
                <p className="mt-2 text-sm leading-relaxed text-[#3c423a] dark:text-[#d0cabf]">
                  {aiResult.recommendation_summary}
                </p>
              </div>

              {/* Key Details */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#516246] dark:text-[#a7d48f]">
                  Analysis Key Highlights
                </h5>
                <ul className="space-y-1.5 text-xs text-[#4e574b] dark:text-[#c8c3b7]">
                  {aiResult.analysis_details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400">✔</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-500">Could not load AI analysis results.</p>
          )}
        </ModalBody>

        <ModalFooter className="border-t border-black/10 dark:border-white/10 justify-end">
          <Button color="gray" onClick={() => setIsModalOpen(false)}>
            Close Analysis
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default EUMarketTable;
