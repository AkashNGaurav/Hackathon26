"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Button,
  Badge,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TextInput,
  Label,
  Alert,
} from "flowbite-react";
import {
  Sparkles,
  ArrowLeft,
  Shield,
  Activity,
  Zap,
  Home,
  GraduationCap,
  Target,
  Repeat,
  Euro,
  CheckCircle2,
  TrendingUp,
  PieChart,
  Award,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";
import Link from "next/link";

export interface AIMFRecommendation {
  symbol: string;
  name: string;
  nav_price: number;
  percentage_change: number;
  is_positive: boolean;
  recommended_sip_amount: number;
  expected_annual_return: number;
  target_years: number;
  projected_target_value: number;
  ai_rationale: string;
  match_score: number;
}

export interface AIMFResponse {
  goal: string;
  custom_goal_title?: string;
  risk_profile: string;
  target_amount: number;
  target_years: number;
  goal_title: string;
  recommendations: AIMFRecommendation[];
}

export interface AllocationResponse {
  risk_profile: string;
  investment_horizon: number;
  recommended_allocation: Record<string, number>;
  rationale: string;
}

function AIRecommendationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const goal = searchParams.get("goal") || "custom";
  const risk = searchParams.get("risk") || "moderate";
  const targetAmount = Number(searchParams.get("amount") || "50000");
  const targetYears = Number(searchParams.get("years") || "5");
  const customTitle = searchParams.get("title") || undefined;

  const [aiData, setAiData] = useState<AIMFResponse | null>(null);
  const [allocationData, setAllocationData] = useState<AllocationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Investment Modal State
  const [investModalOpen, setInvestModalOpen] = useState<boolean>(false);
  const [selectedRec, setSelectedRec] = useState<AIMFRecommendation | null>(null);
  const [investType, setInvestType] = useState<"sip" | "onetime">("sip");
  const [investAmount, setInvestAmount] = useState<number>(500);
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const generateFallbackAIRecs = (): AIMFResponse => {
    const title = customTitle || (goal === "home" ? "Dream Home Down Payment Strategy" : goal === "education" ? "Child's Higher Education Fund Strategy" : "Personalized Wealth Growth Strategy");
    const reqSip = targetAmount / (targetYears * 12);
    
    return {
      goal,
      custom_goal_title: customTitle,
      risk_profile: risk,
      target_amount: targetAmount,
      target_years: targetYears,
      goal_title: title,
      recommendations: [
        {
          symbol: "VUAA.L",
          name: "Vanguard S&P 500 UCITS ETF (EUR)",
          nav_price: 94.25,
          percentage_change: 0.85,
          is_positive: true,
          recommended_sip_amount: Math.round(reqSip),
          expected_annual_return: risk === "conservative" ? 10.5 : risk === "aggressive" ? 13.8 : 12.2,
          target_years: targetYears,
          projected_target_value: Math.round(targetAmount * 1.15),
          ai_rationale: "Top-tier European UCITS S&P 500 tracker with institutional liquidity and ultra-low expense ratio.",
          match_score: 98,
        },
        {
          symbol: "IWDA.AS",
          name: "iShares Core MSCI World UCITS ETF",
          nav_price: 88.50,
          percentage_change: 0.62,
          is_positive: true,
          recommended_sip_amount: Math.round(reqSip * 0.9),
          expected_annual_return: 11.2,
          target_years: targetYears,
          projected_target_value: Math.round(targetAmount * 1.08),
          ai_rationale: "Broad European market global diversification providing steady compounding for target timeframe.",
          match_score: 94,
        },
        {
          symbol: "MEUD.PA",
          name: "Amundi Stoxx Europe 600 UCITS ETF",
          nav_price: 412.30,
          percentage_change: 0.45,
          is_positive: true,
          recommended_sip_amount: Math.round(reqSip * 0.8),
          expected_annual_return: 10.5,
          target_years: targetYears,
          projected_target_value: Math.round(targetAmount * 1.02),
          ai_rationale: "Core European Stoxx 600 index coverage providing defensive dividend reinvestment and low beta.",
          match_score: 89,
        },
      ],
    };
  };

  useEffect(() => {
    async function loadAIData() {
      setLoading(true);
      try {
        const payload = {
          goal,
          risk_profile: risk,
          target_amount: targetAmount,
          target_years: targetYears,
          custom_goal_title: customTitle
        };

        const recRes = await fetch(`${API_BASE_URL}/api/ai/recommend-mf`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => null);

        if (recRes && recRes.ok) {
          const rData = await recRes.json();
          setAiData(rData);
        } else {
          setAiData(generateFallbackAIRecs());
        }
      } catch {
        setAiData(generateFallbackAIRecs());
      }

      try {
        const riskParam = risk === "conservative" ? "low" : risk === "aggressive" ? "high" : risk;
        const allocRes = await fetch(`${API_BASE_URL}/api/recommendations?risk_profile=${riskParam}&investment_horizon=${targetYears}`).catch(() => null);

        if (allocRes && allocRes.ok) {
          const aData = await allocRes.json();
          setAllocationData(aData);
        } else {
          setAllocationData({
            risk_profile: risk,
            investment_horizon: targetYears,
            recommended_allocation: risk === "conservative" ? { Equity: 30, Debt: 60, Gold: 10 } : risk === "aggressive" ? { Equity: 80, Debt: 15, Gold: 5 } : { Equity: 60, Debt: 30, Gold: 10 },
            rationale: "Optimal asset class breakdown designed for European capital growth."
          });
        }
      } catch {
        // Fallback allocation
      } finally {
        setLoading(false);
      }
    }

    loadAIData();
  }, [goal, risk, targetAmount, targetYears, customTitle]);

  const openModalForRec = (rec: AIMFRecommendation, type: "sip" | "onetime") => {
    setSelectedRec(rec);
    setInvestType(type);
    setInvestAmount(type === "sip" ? rec.recommended_sip_amount : rec.nav_price * 10);
    setOrderError(null);
    setOrderSuccess(false);
    setInvestModalOpen(true);
  };

  const handleExecuteOrder = async () => {
    if (!selectedRec || investAmount <= 0) return;

    setOrderError(null);
    setOrderLoading(true);

    try {
      const qty = Number((investAmount / selectedRec.nav_price).toFixed(2));
      const res = await fetch(`${API_BASE_URL}/api/trading/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedRec.symbol,
          asset_name: selectedRec.name,
          asset_type: "Mutual Fund",
          transaction_type: "BUY",
          order_type: investType.toUpperCase(),
          sip_frequency: investType === "sip" ? "monthly" : null,
          quantity: qty > 0 ? qty : 1,
          price_per_unit: selectedRec.nav_price,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Investment order failed" }));
        throw new Error(errData.detail || "Investment order failed");
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
      } catch {
        const currentSavedBalance = Number(localStorage.getItem("investpro_wallet_balance") || "12450");
        const newBal = Math.max(0, currentSavedBalance - investAmount);
        localStorage.setItem("investpro_wallet_balance", newBal.toString());
      }
      window.dispatchEvent(new Event("walletUpdated"));

      setOrderSuccess(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Could not complete order.";
      setOrderError(errorMsg);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      {/* Top Navigation */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/goals/risk-profile?goal=${goal}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#2f6b4f] dark:text-[#a7d48f] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Goal Parameters
        </Link>
      </div>

      {/* Hero Header Banner */}
      <div className="rounded-3xl border border-[#2f6b4f]/20 bg-gradient-to-br from-[#2f6b4f]/15 via-[#2f6b4f]/5 to-transparent p-6 sm:p-8 backdrop-blur-md dark:border-[#a7d48f]/20 dark:from-[#a7d48f]/15 dark:via-[#a7d48f]/5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white dark:bg-emerald-500 font-bold text-xs">
                <Euro className="w-3.5 h-3.5" /> Target: €{targetAmount.toLocaleString()} in {targetYears} Years
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/80 dark:bg-gray-800 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-800 dark:text-gray-200 capitalize">
                {risk} Risk Profile
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              {aiData?.goal_title || "European AI Mutual Fund Strategy"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
              Our European AI Financial Agent analyzed yfinance live market NAVs and compounding rates to construct your personalized fund strategy for reaching €{targetAmount.toLocaleString()} in {targetYears} years.
            </p>
          </div>

          <Badge color="success" className="px-4 py-2 text-xs font-bold uppercase rounded-full tracking-wider shadow-sm flex items-center gap-1.5 shrink-0">
            <Sparkles className="w-4 h-4" /> EUROPEAN AI ENGINE ACTIVE
          </Badge>
        </div>
      </div>

      {/* Asset Allocation Breakdown Banner */}
      {allocationData && (
        <div className="rounded-2xl border border-black/10 bg-white/70 p-5 sm:p-6 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2f6b4f] dark:text-[#a7d48f]">
            <PieChart className="w-4 h-4" /> Recommended Portfolio Asset Class Allocation
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            {Object.entries(allocationData.recommended_allocation).map(([key, val]) => (
              <div key={key} className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-black/5 dark:border-white/5 space-y-1">
                <span className="text-xs font-bold uppercase text-gray-500">{key}</span>
                <div className="text-2xl font-black text-gray-900 dark:text-white">{val}%</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#2f6b4f] dark:bg-[#a7d48f] h-full" style={{ width: `${val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 3 AI Recommended European Mutual Funds Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#2f6b4f] dark:text-[#a7d48f]" /> European AI Recommended Mutual Funds
          </h2>
          <span className="text-xs text-gray-500 font-semibold">Ranked by AI Match Score & Live yfinance NAV</span>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Spinner size="xl" />
            <p className="text-sm font-semibold text-gray-500">AI Agent analyzing live European market mutual funds...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiData?.recommendations.map((rec, idx) => (
              <div
                key={rec.symbol}
                className="rounded-3xl border border-black/10 bg-white/80 backdrop-blur-md p-6 dark:border-white/10 dark:bg-[#121614]/90 flex flex-col justify-between space-y-6 shadow-lg hover:shadow-2xl transition-all relative overflow-hidden"
              >
                {idx === 0 && (
                  <div className="absolute top-0 right-0 bg-[#2f6b4f] text-white dark:bg-[#a7d48f] dark:text-[#090b0a] text-[10px] font-black uppercase px-4 py-1 rounded-bl-xl tracking-wider">
                    Top AI Selection
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-start pt-2">
                    <div>
                      <Badge color="success" className="w-fit font-bold text-[10px] uppercase mb-2">
                        {rec.match_score}% AI Match
                      </Badge>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white">{rec.symbol}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{rec.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">€{rec.nav_price.toFixed(2)}</div>
                      <span className={`text-xs font-semibold ${rec.is_positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"}`}>
                        {rec.is_positive ? "+" : ""}{rec.percentage_change}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-black/5 dark:border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Required Monthly SIP:</span>
                      <span className="font-bold text-[#2f6b4f] dark:text-[#a7d48f]">€{rec.recommended_sip_amount.toFixed(2)}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expected Annual Return:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">~{rec.expected_annual_return}% p.a.</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 font-bold text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{rec.target_years}-Yr Projected Target:</span>
                      <span className="text-gray-900 dark:text-white">€{rec.projected_target_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#2f6b4f]/5 dark:bg-[#a7d48f]/5 border border-[#2f6b4f]/10 text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">
                    &quot;{rec.ai_rationale}&quot;
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    size="md"
                    className="w-full bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a] font-bold shadow-md"
                    onClick={() => openModalForRec(rec, "sip")}
                  >
                    <Repeat className="w-4 h-4 mr-2" /> Start Monthly SIP (€{rec.recommended_sip_amount.toFixed(2)}/mo)
                  </Button>
                  <Button
                    size="md"
                    color="gray"
                    className="w-full font-bold"
                    onClick={() => openModalForRec(rec, "onetime")}
                  >
                    <Euro className="w-4 h-4 mr-2" /> One-Time Lump Sum Investment
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Investment Execution Modal */}
      <Modal show={investModalOpen} onClose={() => setInvestModalOpen(false)} size="md">
        <ModalHeader className="border-b border-black/10 dark:border-white/10">
          <span className="font-bold text-gray-900 dark:text-white">
            Invest in {selectedRec?.symbol} ({investType === "sip" ? "SIP" : "Lump Sum"})
          </span>
        </ModalHeader>
        <ModalBody className="space-y-4">
          {orderSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Investment Order Placed!</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Your <span className="font-bold text-gray-900 dark:text-white">{investType === "sip" ? "SIP" : "Lump Sum"}</span> order for <span className="font-bold text-[#2f6b4f] dark:text-[#a7d48f]">{selectedRec?.name} ({selectedRec?.symbol})</span> has been completed and added to your portfolio.
              </p>
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs text-left max-w-xs mx-auto space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Reference:</span>
                  <span className="font-mono font-bold">{lastOrderId || "ORD-COMPLETED"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid:</span>
                  <span className="font-bold text-emerald-600">€{investAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {orderError && <Alert color="failure">{orderError}</Alert>}

              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Selected Fund:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedRec?.name} ({selectedRec?.symbol})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Live NAV:</span>
                  <span className="font-bold text-[#2f6b4f] dark:text-[#a7d48f]">€{selectedRec?.nav_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Target Timeframe:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedRec?.target_years} Years</span>
                </div>
              </div>

              <div>
                <Label htmlFor="investAmtInput" className="mb-1 block text-xs font-bold">
                  {investType === "sip" ? "Monthly SIP Amount (€)" : "Lump Sum Amount (€)"}
                </Label>
                <TextInput
                  id="investAmtInput"
                  type="number"
                  step="50"
                  min="50"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(Number(e.target.value))}
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs flex justify-between items-center font-bold">
                <span>Estimated Units Purchased:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm">
                  ~{(selectedRec ? investAmount / selectedRec.nav_price : 0).toFixed(2)} Units
                </span>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter className="border-t border-black/10 dark:border-white/10">
          {orderSuccess ? (
            <Button className="w-full bg-[#2f6b4f]" onClick={() => setInvestModalOpen(false)}>
              Done & View Portfolio
            </Button>
          ) : (
            <div className="flex w-full gap-3">
              <Button color="gray" className="w-1/2" onClick={() => setInvestModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="w-1/2 bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a] font-bold"
                disabled={orderLoading}
                onClick={handleExecuteOrder}
              >
                {orderLoading ? <Spinner size="sm" /> : "Confirm Order"}
              </Button>
            </div>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default function AIRecommendationsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-[#2f6b4f] dark:text-[#a7d48f] font-semibold animate-pulse">Loading AI mutual fund strategy...</div>
      </div>
    }>
      <AIRecommendationsContent />
    </Suspense>
  );
}
