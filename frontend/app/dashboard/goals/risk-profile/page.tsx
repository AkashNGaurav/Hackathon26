"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Activity, Zap, ArrowRight, Home, GraduationCap, Target } from "lucide-react";
import { Button } from "flowbite-react";

function RiskProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const goalType = searchParams.get("goal") || "custom";
  
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const profiles = [
    {
      id: "conservative",
      title: "Conservative",
      icon: <Shield className="w-12 h-12 text-blue-500 mb-6" />,
      description: "You prioritize capital preservation over high returns. You prefer lower risk investments with stable, predictable growth.",
      allocation: "80% Debt / 20% Equity",
      color: "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
    },
    {
      id: "moderate",
      title: "Moderate",
      icon: <Activity className="w-12 h-12 text-purple-500 mb-6" />,
      description: "You seek a balance between risk and reward. You are willing to accept some market volatility for better long-term growth.",
      allocation: "50% Debt / 50% Equity",
      color: "border-purple-500 bg-purple-50/50 dark:bg-purple-900/10"
    },
    {
      id: "aggressive",
      title: "Aggressive",
      icon: <Zap className="w-12 h-12 text-emerald-500 mb-6" />,
      description: "You aim for maximum growth and are comfortable with significant market fluctuations. You have a long-term investment horizon.",
      allocation: "20% Debt / 80% Equity",
      color: "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
    }
  ];

  const getGoalInfo = () => {
    switch (goalType) {
      case "home": return { title: "Dream Home", icon: <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" /> };
      case "education": return { title: "Child's Education", icon: <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" /> };
      default: return { title: "Custom Goal", icon: <Target className="w-5 h-5 text-[#2f6b4f] dark:text-[#a7d48f]" /> };
    }
  };

  const goalInfo = getGoalInfo();

  const handleContinue = () => {
    if (!selectedProfile) return;
    router.push(`/dashboard/mutual-funds`);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-[85vh] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 dark:bg-[#121614]/80 border border-black/10 dark:border-white/10 backdrop-blur-md mb-8 shadow-sm">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Planning for:</span>
          <span className="flex items-center gap-2 font-bold text-[#101410] dark:text-[#f6f3ea]">
            {goalInfo.icon} {goalInfo.title}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#101410] dark:text-[#f6f3ea] mb-6">
          What is your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2f6b4f] to-emerald-500 dark:from-[#a7d48f] dark:to-emerald-300">Risk Profile</span>?
        </h1>
        <p className="text-lg md:text-xl text-[#5c6457] dark:text-[#b4ad9f] max-w-2xl mx-auto leading-relaxed">
          To recommend the best mutual funds for your goal, we need to understand how much market volatility you are comfortable with.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            onClick={() => setSelectedProfile(profile.id)}
            className={`
              relative cursor-pointer rounded-[2rem] border-2 p-8 transition-all duration-300
              ${selectedProfile === profile.id 
                ? `${profile.color} scale-[1.03] shadow-2xl` 
                : 'border-black/5 dark:border-white/5 bg-white/40 dark:bg-[#121614]/40 backdrop-blur-sm hover:border-gray-300 hover:bg-white/80 dark:hover:bg-white/10 opacity-70 hover:opacity-100'
              }
            `}
          >
            {selectedProfile === profile.id && (
              <div className="absolute top-6 right-6 rounded-full bg-black/10 dark:bg-white/20 p-1.5 animate-in zoom-in duration-300">
                <svg className="w-5 h-5 text-current" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className="flex flex-col items-center text-center h-full">
              {profile.icon}
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">{profile.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed flex-grow">
                {profile.description}
              </p>
              <div className="mt-auto w-full rounded-xl bg-white/50 dark:bg-black/20 p-4 border border-black/5 dark:border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Suggested Allocation
                </span>
                <p className="font-bold text-gray-900 dark:text-white mt-1.5">
                  {profile.allocation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button 
          size="xl" 
          disabled={!selectedProfile}
          onClick={handleContinue}
          className="bg-gradient-to-r from-[#2f6b4f] to-emerald-600 enabled:hover:from-[#255740] enabled:hover:to-emerald-700 dark:from-[#a7d48f] dark:to-emerald-400 dark:text-[#090b0a] dark:enabled:hover:from-[#92c578] dark:enabled:hover:to-emerald-300 transition-all rounded-full px-8 shadow-lg font-bold"
        >
          Continue to Strategy <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

export default function RiskProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-[#2f6b4f] dark:text-[#a7d48f] font-semibold animate-pulse">Loading planner...</div>
      </div>
    }>
      <RiskProfileContent />
    </Suspense>
  );
}
