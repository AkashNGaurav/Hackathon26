"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  Bot,
  TrendingUp,
  Briefcase,
  PieChart,
  Layers,
  User as UserIcon,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ArrowDown,
  Zap,
  Info,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

type AgentType = "investment-advisor" | "stocks" | "mutual-funds" | "etfs";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  agent?: AgentType;
}

const AGENT_CONFIGS: Record<
  AgentType,
  {
    name: string;
    badge: string;
    endpoint: string;
    icon: React.ReactNode;
    description: string;
    gradient: string;
    darkGradient: string;
    accentColor: string;
    prompts: string[];
  }
> = {
  "investment-advisor": {
    name: "Investment Advisor",
    badge: "General Strategy",
    endpoint: "/api/chat/investment-advisor",
    icon: <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    description: "Portfolio asset allocation, risk management & diversification",
    gradient: "from-emerald-500/10 to-teal-500/10",
    darkGradient: "from-emerald-500/20 to-teal-500/20",
    accentColor: "emerald",
    prompts: [
      "How should I allocate €10,000 for a 5-year investment horizon?",
      "Explain risk vs return diversification across asset classes.",
      "What key criteria should I use to review my portfolio concentration?",
    ],
  },
  stocks: {
    name: "Stock Specialist",
    badge: "European Equities",
    endpoint: "/api/chat/stocks",
    icon: <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
    description: "European equities, fundamental valuation, P/E ratios & earnings",
    gradient: "from-purple-500/10 to-indigo-500/10",
    darkGradient: "from-purple-500/20 to-indigo-500/20",
    accentColor: "purple",
    prompts: [
      "Explain P/E ratio and stock valuation metrics.",
      "How do European dividend yields compare across sectors?",
      "What impact do corporate quarterly earnings have on valuation?",
    ],
  },
  "mutual-funds": {
    name: "Mutual Fund Specialist",
    badge: "UCITS Funds",
    endpoint: "/api/chat/mutual-funds",
    icon: <PieChart className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    description: "UCITS mutual funds, compounding, NAV & active fund management",
    gradient: "from-amber-500/10 to-orange-500/10",
    darkGradient: "from-amber-500/20 to-orange-500/20",
    accentColor: "amber",
    prompts: [
      "What are the structural protections of UCITS mutual funds?",
      "How does monthly SIP compounding build long-term wealth?",
      "Active vs Passive mutual funds in European markets?",
    ],
  },
  etfs: {
    name: "ETF Specialist",
    badge: "Indexed ETFs",
    endpoint: "/api/chat/etfs",
    icon: <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    description: "Index tracking, TER fees, accumulating vs distributing ETFs",
    gradient: "from-blue-500/10 to-cyan-500/10",
    darkGradient: "from-blue-500/20 to-cyan-500/20",
    accentColor: "blue",
    prompts: [
      "Accumulating vs Distributing ETFs: Which is better for tax efficiency?",
      "What is Total Expense Ratio (TER) and why does it matter?",
      "How does physical vs synthetic index replication work?",
    ],
  },
};

function formatBold(str: string) {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[#090c0a] dark:text-[#f8faf7]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function FormattedText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />;

        // Disclaimer block highlight
        if (line.toLowerCase().includes("educational information") || line.toLowerCase().includes("not financial advice")) {
          return (
            <div key={idx} className="my-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <span>{formatBold(line)}</span>
            </div>
          );
        }

        // Bullet items
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          const content = line.trim().slice(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 group">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2f6b4f] dark:bg-[#a7d48f] mt-2 shrink-0 group-hover:scale-125 transition-transform" />
              <span className="flex-1">{formatBold(content)}</span>
            </div>
          );
        }

        // Numbered list items
        if (/^\d+\.\s/.test(line.trim())) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#2f6b4f] dark:text-[#a7d48f] shrink-0">
                {line.trim().match(/^\d+\./)?.[0]}
              </span>
              <span className="flex-1 font-medium">{formatBold(line.trim().replace(/^\d+\.\s/, ""))}</span>
            </div>
          );
        }

        return <p key={idx}>{formatBold(line)}</p>;
      })}
    </div>
  );
}

export function openAIChatbot(agent?: AgentType) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("openAIChatbot", { detail: { agent } }));
  }
}

export function AIChatbotWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentType>("investment-advisor");
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Listen for openAIChatbot custom events
  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvt = e as CustomEvent<{ agent?: AgentType }>;
      if (customEvt.detail?.agent) {
        setSelectedAgent(customEvt.detail.agent);
      }
      setIsOpen(true);
    };

    window.addEventListener("openAIChatbot", handleOpenChat);
    return () => window.removeEventListener("openAIChatbot", handleOpenChat);
  }, []);

  // Auto-detect context from active path
  useEffect(() => {
    if (pathname.includes("/mutual-funds")) {
      setSelectedAgent("mutual-funds");
    } else if (pathname.includes("/etf")) {
      setSelectedAgent("etfs");
    } else if (pathname.includes("/stocks")) {
      setSelectedAgent("stocks");
    } else {
      setSelectedAgent("investment-advisor");
    }
  }, [pathname]);

  // Session ID initialization & load history
  useEffect(() => {
    let sId = localStorage.getItem("finsight_chat_session");
    if (!sId) {
      sId = "session_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("finsight_chat_session", sId);
    }
    setSessionId(sId);

    const savedMsgs = localStorage.getItem("finsight_chat_messages");
    if (savedMsgs) {
      try {
        setMessages(JSON.parse(savedMsgs));
      } catch {
        // Fallback
      }
    }
  }, []);

  // Save messages to LocalStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("finsight_chat_messages", JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 120);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: "msg_" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setLoading(true);

    try {
      const activeConfig = AGENT_CONFIGS[selectedAgent];
      const res = await fetch(`${API_BASE_URL}${activeConfig.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
        }),
      });

      if (!res.ok) {
        throw new Error("API call failed");
      }

      const data = await res.json();
      const aiReply = data.reply || "No reply received from AI assistant.";

      const aiMsg: Message = {
        id: "msg_" + (Date.now() + 1),
        sender: "ai",
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        agent: selectedAgent,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: "msg_" + (Date.now() + 1),
        sender: "ai",
        text: "I'm having trouble connecting to the backend server. Please ensure the backend is running and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        agent: selectedAgent,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem("finsight_chat_messages");
  };

  const activeConfig = AGENT_CONFIGS[selectedAgent];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 group">
          {/* Ambient Glow */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-60 blur-md group-hover:opacity-100 transition duration-500 animate-pulse" />
          
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#101713] text-white dark:bg-[#0d120f] font-semibold text-xs sm:text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-emerald-500/30 backdrop-blur-xl"
            aria-label="Open FinSight AI Assistant"
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-4 h-4 animate-spin-slow text-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
            </div>

            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] text-emerald-400/90 font-mono tracking-widest uppercase font-bold">
                FinSight AI
              </span>
              <span className="text-xs font-bold tracking-tight text-white mt-0.5">
                Ask Market Specialist
              </span>
            </div>

            <div className="ml-1 pl-2 border-l border-white/10 flex items-center">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
          </button>
        </div>
      )}

      {/* Main Chat Floating Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-out flex flex-col bg-[#f7f5ef]/95 dark:bg-[#0b0e0c]/95 backdrop-blur-3xl border border-black/10 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden ${
            isExpanded
              ? "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[680px] h-[86vh] max-h-[820px]"
              : "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] h-[80vh] max-h-[660px]"
          }`}
        >
          {/* Top Glass Header */}
          <div className="px-5 py-4 bg-white/80 dark:bg-[#121714]/80 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Bot className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#121714]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm tracking-tight text-[#090c0a] dark:text-[#f8faf7] truncate">
                    FinSight AI Assistant
                  </h3>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                    Live AI
                  </span>
                </div>
                <p className="text-[11px] text-[#5c6457] dark:text-[#a3ad9e] truncate mt-0.5">
                  {activeConfig.description}
                </p>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Restore standard size" : "Expand window"}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  title="Clear Chat History"
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Specialist Agent Tabs Bar */}
          <div className="px-3 py-2.5 bg-[#efece3]/70 dark:bg-[#141916]/70 border-b border-black/5 dark:border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {(Object.keys(AGENT_CONFIGS) as AgentType[]).map((key) => {
              const cfg = AGENT_CONFIGS[key];
              const isSelected = selectedAgent === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedAgent(key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? "bg-gradient-to-r from-[#2f6b4f] to-[#1e4734] text-white shadow-md dark:from-[#a7d48f] dark:to-[#82c162] dark:text-[#090c0a] scale-102"
                      : "bg-white/70 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 border border-black/5 dark:border-white/5"
                  }`}
                >
                  {cfg.icon}
                  <span>{cfg.name}</span>
                </button>
              );
            })}
          </div>

          {/* Chat Messages Body */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar relative"
          >
            {messages.length === 0 ? (
              <div className="py-6 px-3 text-center space-y-5">
                {/* Hero Icon */}
                <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#2f6b4f]/20 via-teal-500/20 to-[#a7d48f]/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-[#2f6b4f] dark:text-[#a7d48f] shadow-lg">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>

                <div>
                  <h4 className="font-black text-base text-[#090c0a] dark:text-[#f8faf7] tracking-tight">
                    Welcome to FinSight Specialist Chat
                  </h4>
                  <p className="mt-1.5 text-xs text-[#5c6457] dark:text-[#a3ad9e] max-w-sm mx-auto leading-relaxed">
                    Select a specialist agent above to analyze European stocks, mutual funds, ETFs, or portfolio asset allocation.
                  </p>
                </div>

                {/* Agent Card Highlight */}
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/5 text-left flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    {activeConfig.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#090c0a] dark:text-[#f8faf7] block">
                      Active: {activeConfig.name} ({activeConfig.badge})
                    </span>
                    <span className="text-[11px] text-[#5c6457] dark:text-[#a3ad9e] block mt-0.5">
                      {activeConfig.description}
                    </span>
                  </div>
                </div>

                {/* Suggested Prompts */}
                <div className="pt-2 text-left space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    Suggested Questions for {activeConfig.name}:
                  </span>
                  <div className="space-y-2">
                    {activeConfig.prompts.map((promptText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(promptText)}
                        className="w-full text-left p-3 rounded-2xl bg-white/90 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-[#2f6b4f]/40 dark:hover:border-[#a7d48f]/40 hover:bg-white dark:hover:bg-white/10 text-xs text-[#090c0a] dark:text-[#f8faf7] font-medium transition-all group flex items-center justify-between gap-2 shadow-xs"
                      >
                        <span className="flex-1">"{promptText}"</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#2f6b4f] dark:group-hover:text-[#a7d48f] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`group relative max-w-[88%] px-4 py-3 rounded-2xl transition-all ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-[#2f6b4f] to-[#24523c] text-white dark:from-[#a7d48f] dark:to-[#86c669] dark:text-[#090c0a] rounded-tr-xs font-medium shadow-md"
                        : "bg-white/90 dark:bg-[#131916]/90 text-[#090c0a] dark:text-[#f8faf7] border border-black/5 dark:border-white/5 shadow-xs rounded-tl-xs"
                    }`}
                  >
                    <FormattedText text={msg.text} />

                    {/* Copy Button on AI response */}
                    {msg.sender === "ai" && (
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        title="Copy message"
                        className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-500 dark:text-gray-300 transition-all"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Timestamp & Agent tag */}
                  <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-gray-400 dark:text-gray-500">
                    <span>{msg.timestamp}</span>
                    {msg.agent && (
                      <span className="font-semibold uppercase tracking-wider text-[9px] text-[#2f6b4f] dark:text-[#a7d48f]">
                        • {AGENT_CONFIGS[msg.agent]?.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex flex-col items-start">
                <div className="px-4 py-3 rounded-2xl bg-white/90 dark:bg-[#131916]/90 border border-black/5 dark:border-white/5 rounded-tl-xs flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#2f6b4f] dark:bg-[#a7d48f] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#2f6b4f] dark:bg-[#a7d48f] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#2f6b4f] dark:bg-[#a7d48f] animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {activeConfig.name} is thinking...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating Scroll to Bottom Button */}
          {showScrollBottom && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="absolute bottom-20 right-6 z-10 p-2 rounded-full bg-[#2f6b4f] text-white dark:bg-[#a7d48f] dark:text-[#090c0a] shadow-lg hover:scale-110 transition-all"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}

          {/* Footer Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3.5 bg-white/90 dark:bg-[#121714]/90 border-t border-black/10 dark:border-white/10 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask ${activeConfig.name}...`}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-[#efece3]/80 dark:bg-[#070a08]/80 border border-black/10 dark:border-white/10 text-[#090c0a] dark:text-[#f8faf7] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f6b4f] dark:focus:ring-[#a7d48f] transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-3 rounded-2xl bg-gradient-to-r from-[#2f6b4f] to-[#1e4734] hover:from-[#23533d] hover:to-[#173829] text-white dark:from-[#a7d48f] dark:to-[#82c162] dark:hover:from-[#93c779] dark:hover:to-[#6fb34e] dark:text-[#090c0a] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shrink-0 flex items-center justify-center"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default AIChatbotWidget;
