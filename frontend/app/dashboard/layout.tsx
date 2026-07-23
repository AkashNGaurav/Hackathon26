import type { Metadata } from "next";
import DashboardNavbar from "@/components/DashboardNavbar";
import AIChatbotWidget from "@/components/AIChatbotWidget";

export const metadata: Metadata = {
  title: "Dashboard | FinSight",
  description: "Manage your portfolio, mutual funds, ETFs, and stocks with FinSight AI.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f2ea] text-[#101410] transition-colors dark:bg-[#090b0a] dark:text-[#f6f3ea]">
      <DashboardNavbar />
      <div>{children}</div>
      <AIChatbotWidget />
    </div>
  );
}
