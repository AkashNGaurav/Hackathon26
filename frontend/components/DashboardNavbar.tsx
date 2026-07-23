"use client";

import { useEffect, useState } from "react";
import {
  DarkThemeToggle,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet } from "lucide-react";

export function DashboardNavbar() {
  const pathname = usePathname();
  const [walletBalance, setWalletBalance] = useState<number>(12450);

  useEffect(() => {
    const updateBalance = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/wallet/balance");
        if (res.ok) {
          const data = await res.json();
          setWalletBalance(data.balance);
          localStorage.setItem("investpro_wallet_balance", data.balance.toString());
          return;
        }
      } catch (err) {
        // Fallback to localStorage
      }
      const saved = localStorage.getItem("investpro_wallet_balance");
      if (saved) setWalletBalance(Number(saved));
    };

    updateBalance();
    window.addEventListener("walletUpdated", updateBalance);
    return () => window.removeEventListener("walletUpdated", updateBalance);
  }, []);

  const navLinks = [
    { href: "/dashboard/mutual-funds", label: "Mutual Funds" },
    { href: "/dashboard/etf", label: "ETF" },
    { href: "/dashboard/stocks", label: "Stocks" },
    { href: "/dashboard/portfolio", label: "Portfolio" },
  ];

  return (
    <Navbar
      fluid
      className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f2ea]/95 backdrop-blur-md dark:border-white/10 dark:bg-[#090b0a]/90 px-3 sm:px-6 py-2.5"
    >
      <NavbarBrand as={Link} href="/dashboard" className="flex items-center gap-2 sm:gap-3">
        <Image
          src="/logo.png"
          alt="InvestPro Logo"
          width={36}
          height={36}
          className="size-8 sm:size-9 shrink-0"
          priority
        />
        <span className="self-center whitespace-nowrap text-lg sm:text-xl font-black tracking-tight text-[#101410] dark:text-[#f6f3ea]">
          InvestPro
        </span>
      </NavbarBrand>

      <div className="flex items-center gap-1.5 sm:gap-3 md:order-2">
        {/* Wallet Balance Pill */}
        <Link
          href="/dashboard/wallet"
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#2f6b4f]/10 dark:bg-[#a7d48f]/10 border border-[#2f6b4f]/20 dark:border-[#a7d48f]/20 text-[#2f6b4f] dark:text-[#a7d48f] hover:bg-[#2f6b4f]/20 dark:hover:bg-[#a7d48f]/20 transition-all font-bold text-[11px] sm:text-xs"
        >
          <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>€{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </Link>

        <DarkThemeToggle className="p-1.5 sm:p-2 focus:ring-2 focus:ring-[#2f6b4f] dark:focus:ring-[#a7d48f]" />
        <NavbarToggle className="p-1.5 sm:p-2 focus:ring-2 focus:ring-[#2f6b4f] dark:focus:ring-[#a7d48f]" />
      </div>

      <NavbarCollapse className="mt-2 md:mt-0">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <NavbarLink
              key={link.href}
              as={Link}
              href={link.href}
              active={isActive}
              className={`font-medium text-sm py-2 px-3 transition-colors ${
                isActive
                  ? "text-[#2f6b4f] font-bold dark:text-[#a7d48f]"
                  : "text-[#4e574b] hover:text-[#101410] dark:text-[#c8c3b7] dark:hover:text-white"
              }`}
            >
              {link.label}
            </NavbarLink>
          );
        })}
      </NavbarCollapse>
    </Navbar>
  );
}

export default DashboardNavbar;
