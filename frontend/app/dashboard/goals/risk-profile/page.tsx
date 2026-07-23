"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  Activity,
  Zap,
  ArrowRight,
  Home,
  GraduationCap,
  Target,
  Calendar,
  Euro,
  Lock,
  Edit3,
  Sparkles,
  Calculator,
  CheckCircle2,
} from "lucide-react";
import { Button, TextInput, Label, Badge } from "flowbite-react";

function RiskProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialGoal = searchParams.get("goal") || "custom";

  const [goalType, setGoalType] = useState<string>(initialGoal);
  const [customGoalTitle, setCustomGoalTitle] = useState<string>("Buying an Electric Car");
  const [targetAmount, setTargetAmount] = useState<number>(50000);
  const [targetYears, setTargetYears] = useState<number>(5);
  const [selectedProfile, setSelectedProfile] = useState<string>("moderate");

  const profiles = [
    {
      id: "conservative",
      title: "Conservative",
      icon: <Shield className="w-8 h-8 text-blue-500 mb-3" />,
      description: "Focus on European capital preservation & low beta. Ideal for shorter timeframes or conservative risk tolerance.",
      allocation: "80% Bonds / 20% Equity",
      color: "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10",
      estReturn: 10.5,
    },
    {
      id: "moderate",
      title: "Moderate",
      icon: <Activity className="w-8 h-8 text-purple-500 mb-3" />,
      description: "Balanced growth across European blue-chips & global UCITS ETFs with drawdown protection.",
      allocation: "50% Debt / 50% Equity",
      color: "border-purple-500 bg-purple-50/50 dark:bg-purple-900/10",
      estReturn: 12.2,
    },
    {
      id: "aggressive",
      title: "Aggressive",
      icon: <Zap className="w-8 h-8 text-emerald-500 mb-3" />,
      description: "Maximize long-term compounding CAGR via European tech growth funds & global index funds.",
      allocation: "20% Debt / 80% Equity",
      color: "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10",
      estReturn: 13.8,
    },
  ];

  const getGoalPresetInfo = () => {
    switch (goalType) {
      case "home":
        return {
          title: "Dream Home Down Payment",
          icon: <Home className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />,
          isEditable: false,
        };
      case "education":
        return {
          title: "Child's Higher Education Fund",
          icon: <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />,
          isEditable: false,
        };
      case "retirement":
        return {
          title: "European Retirement Wealth Fund",
          icon: <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          isEditable: false,
        };
      default:
        return {
          title: customGoalTitle.trim() || "Custom Personal Goal",
          icon: <Edit3 className="w-5 h-5 text-[#2f6b4f] dark:text-[#a7d48f] shrink-0" />,
          isEditable: true,
        };
    }
  };

  const presetInfo = getGoalPresetInfo();

  // Live Monthly SIP Estimation Calculation
  const estimatedMonthlySIP = useMemo(() => {
    if (targetAmount <= 0 || targetYears <= 0) return 0;
    const profileObj = profiles.find((p) => p.id === selectedProfile) || profiles[1];
    const monthlyR = profileObj.estReturn / 100 / 12;
    const totalMonths = targetYears * 12;
    const annuityFactor = (((Math.pow(1 + monthlyR, totalMonths) - 1) / monthlyR) * (1 + monthlyR));
    return Math.round(targetAmount / annuityFactor);
  }, [targetAmount, targetYears, selectedProfile]);

  const handleContinue = () => {
    if (!selectedProfile || targetAmount <= 0 || targetYears <= 0) return;

    const finalTitle = goalType === "custom" ? (customGoalTitle.trim() || "Custom Personal Goal") : presetInfo.title;

    // Save Active Goal to LocalStorage
    const activeGoal = {
      goal: goalType,
      title: finalTitle,
      targetAmount,
      targetYears,
      riskProfile: selectedProfile,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("investpro_active_goal", JSON.stringify(activeGoal));

    router.push(
      `/dashboard/goals/recommendations?goal=${encodeURIComponent(goalType)}&risk=${encodeURIComponent(
        selectedProfile
      )}&amount=${targetAmount}&years=${targetYears}${
        goalType === "custom" ? `&title=${encodeURIComponent(finalTitle)}` : ""
      }`
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto min-h-[85vh] flex flex-col justify-center space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      {/* Top Banner Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#121614]/80 border border-black/10 dark:border-white/10 backdrop-blur-md shadow-xs">
          <Sparkles className="w-4 h-4 text-[#2f6b4f] dark:text-[#a7d48f]" />
          <span className="text-xs font-bold text-[#101410] dark:text-[#f6f3ea]">
            European Financial Goal AI Engine
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#101410] dark:text-[#f6f3ea]">
          AI Financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2f6b4f] to-emerald-500 dark:from-[#a7d48f] dark:to-emerald-300">Goal Calculator</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#5c6457] dark:text-[#b4ad9f] max-w-2xl mx-auto leading-relaxed">
          Configure your wealth milestone in Euro (€), select your timeframe, and let our European AI engine calculate precise yfinance mutual fund strategies.
        </p>
      </div>

      {/* Goal Category Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-gray-200/60 dark:bg-gray-900/60 border border-black/5 dark:border-white/5">
        {[
          { id: "home", label: "Dream Home", icon: <Home className="w-4 h-4 mr-1.5" /> },
          { id: "education", label: "Child Education", icon: <GraduationCap className="w-4 h-4 mr-1.5" /> },
          { id: "retirement", label: "Retirement", icon: <Target className="w-4 h-4 mr-1.5" /> },
          { id: "custom", label: "Custom Goal", icon: <Edit3 className="w-4 h-4 mr-1.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setGoalType(tab.id)}
            className={`flex items-center justify-center py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
              goalType === tab.id
                ? "bg-white dark:bg-gray-800 text-[#2f6b4f] dark:text-[#a7d48f] shadow-md scale-[1.01]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Modern Main Input Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-black/10 bg-white/90 dark:border-white/10 dark:bg-[#121614]/90 backdrop-blur-md shadow-2xl space-y-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white border-b border-black/10 dark:border-white/10 pb-3 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#2f6b4f] dark:text-[#a7d48f]" /> Step 1: Goal Parameters & Euro (€) Target
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Goal Category & Title Field */}
          <div>
            <Label className="mb-2 block text-xs font-bold text-gray-700 dark:text-gray-300">
              Goal Name / Category
            </Label>

            {presetInfo.isEditable ? (
              <div className="space-y-1.5">
                <TextInput
                  id="userCustomGoalTitle"
                  type="text"
                  placeholder="Type your goal (e.g., Buying an EV, Startup Fund, World Tour)..."
                  value={customGoalTitle}
                  onChange={(e) => setCustomGoalTitle(e.target.value)}
                  className="font-bold"
                />
                <span className="text-[11px] text-[#2f6b4f] dark:text-[#a7d48f] font-semibold flex items-center gap-1">
                  <Edit3 className="w-3 h-3" /> User-Entered Custom Goal Title
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {presetInfo.icon}
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {presetInfo.title}
                  </span>
                </div>
                <Badge color="gray" className="text-[10px] uppercase font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Non-Editable Preset Category
                </Badge>
              </div>
            )}
          </div>

          {/* Target Amount (€) Field + Presets */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="targetAmountInput" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Target Wealth Amount (€)
              </Label>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                €{targetAmount.toLocaleString()}
              </span>
            </div>
            <div className="space-y-2">
              <TextInput
                id="targetAmountInput"
                type="number"
                step="1000"
                min="1000"
                placeholder="e.g. 50000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                icon={Euro}
              />
              <div className="flex gap-1.5 flex-wrap">
                {[10000, 25000, 50000, 100000, 250000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTargetAmount(amt)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                      targetAmount === amt
                        ? "bg-[#2f6b4f] text-white border-[#2f6b4f] dark:bg-[#a7d48f] dark:text-black dark:border-[#a7d48f]"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-black/5 dark:border-white/5 hover:bg-gray-200"
                    }`}
                  >
                    €{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Timeframe (Years) Input + Presets */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="targetYearsInput" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Target Time Horizon (Years to Achieve)
              </Label>
              <span className="text-xs font-black text-[#2f6b4f] dark:text-[#a7d48f]">
                {targetYears} {targetYears === 1 ? "Year" : "Years"} ({targetYears * 12} Months)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="sm:col-span-1">
                <TextInput
                  id="targetYearsInput"
                  type="number"
                  min="1"
                  max="30"
                  value={targetYears}
                  onChange={(e) => setTargetYears(Number(e.target.value))}
                  icon={Calendar}
                />
              </div>
              <div className="sm:col-span-2 flex gap-2 flex-wrap">
                {[1, 3, 5, 10, 15, 20].map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setTargetYears(y)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                      targetYears === y
                        ? "bg-[#2f6b4f] text-white border-[#2f6b4f] dark:bg-[#a7d48f] dark:text-black dark:border-[#a7d48f] shadow-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-black/5 dark:border-white/5 hover:bg-gray-200"
                    }`}
                  >
                    {y} {y === 1 ? "Year" : "Yrs"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Estimation Preview Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#2f6b4f]/10 via-white to-emerald-500/10 dark:from-[#a7d48f]/10 dark:via-gray-800 dark:to-emerald-950/20 border border-[#2f6b4f]/20 dark:border-[#a7d48f]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#2f6b4f] dark:text-[#a7d48f] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Live Calculation Preview
            </span>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Estimated Monthly SIP for <span className="font-bold text-gray-900 dark:text-white">€{targetAmount.toLocaleString()}</span> in <span className="font-bold text-gray-900 dark:text-white">{targetYears} years</span>:
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ~€{estimatedMonthlySIP.toLocaleString()}<span className="text-xs font-normal text-gray-500">/mo</span>
            </span>
          </div>
        </div>
      </div>

      {/* Step 2: Risk Profile Selection */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#2f6b4f] dark:text-[#a7d48f]" /> Step 2: Select Risk Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => setSelectedProfile(profile.id)}
              className={`
                relative cursor-pointer rounded-2xl border-2 p-5 sm:p-6 transition-all duration-300
                ${selectedProfile === profile.id 
                  ? `${profile.color} scale-[1.02] shadow-xl` 
                  : 'border-black/5 dark:border-white/5 bg-white/40 dark:bg-[#121614]/40 backdrop-blur-sm hover:border-gray-300 hover:bg-white/80 dark:hover:bg-white/10 opacity-70 hover:opacity-100'
                }
              `}
            >
              {selectedProfile === profile.id && (
                <div className="absolute top-4 right-4 rounded-full bg-emerald-600 text-white p-1">
                  <CheckCircle2 size={16} />
                </div>
              )}
              <div className="flex flex-col items-center text-center">
                {profile.icon}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">{profile.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {profile.description}
                </p>
                <div className="mt-auto w-full rounded-xl bg-white/60 dark:bg-black/20 p-2.5 border border-black/5 dark:border-white/5 text-xs font-bold text-gray-900 dark:text-white">
                  {profile.allocation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-2">
        <Button 
          size="xl" 
          disabled={!selectedProfile || targetAmount <= 0 || targetYears <= 0}
          onClick={handleContinue}
          className="bg-gradient-to-r from-[#2f6b4f] to-emerald-600 hover:from-[#255740] hover:to-emerald-700 dark:from-[#a7d48f] dark:to-emerald-400 dark:text-[#090b0a] transition-all rounded-full px-8 shadow-xl font-bold text-sm"
        >
          Calculate European AI Strategy <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

export default function RiskProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-[#2f6b4f] dark:text-[#a7d48f] font-semibold animate-pulse">Loading AI goal calculator...</div>
      </div>
    }>
      <RiskProfileContent />
    </Suspense>
  );
}
