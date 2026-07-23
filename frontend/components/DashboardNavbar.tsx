"use client";

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
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredUser, removeToken, AuthUser } from "@/lib/auth";

export function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  const navLinks = [
    { href: "/dashboard/mutual-funds", label: "Mutual Funds" },
    { href: "/dashboard/etf", label: "ETF" },
    { href: "/dashboard/stocks", label: "Stocks" },
    { href: "/dashboard/portfolio", label: "Portfolio" },
  ];

  return (
    <Navbar
      fluid
      className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f2ea]/95 backdrop-blur-md dark:border-white/10 dark:bg-[#090b0a]/90 px-3 py-2.5 sm:px-4 sm:py-3"
    >
      <NavbarBrand as={Link} href="/dashboard" className="flex items-center gap-2 sm:gap-3">
        <Image
          src="/logo.png"
          alt="FinSight Logo"
          width={36}
          height={36}
          className="size-8 sm:size-9 shrink-0"
          priority
        />
        <span className="self-center whitespace-nowrap text-lg sm:text-xl font-bold tracking-tight text-[#101410] dark:text-[#f6f3ea]">
          FinSight
        </span>
      </NavbarBrand>

      <div className="flex items-center gap-1.5 sm:gap-3 md:order-2">
        {user?.username && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#2f6b4f]/15 text-[#2f6b4f] dark:bg-[#8bc6ff]/20 dark:text-[#8bc6ff] max-w-[100px] xs:max-w-[140px] sm:max-w-none truncate">
            <svg
              className="size-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            <span className="truncate">{user.username}</span>
          </span>
        )}
        {user && (
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-black/20 text-[#101410] hover:bg-black/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10 transition shrink-0"
          >
            Logout
          </button>
        )}
        <DarkThemeToggle className="focus:ring-2 focus:ring-[#2f6b4f] dark:focus:ring-[#a7d48f]" />
        <NavbarToggle className="focus:ring-2 focus:ring-[#2f6b4f] dark:focus:ring-[#a7d48f]" />
      </div>

      <NavbarCollapse>
        {user?.username && (
          <div className="md:hidden border-b border-black/10 dark:border-white/10 pb-3 mb-2 px-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-[#2f6b4f] dark:bg-[#8bc6ff] text-white dark:text-[#07111f] flex items-center justify-center font-bold text-xs">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#101410] dark:text-white">
                  {user.username}
                </span>
                {user.email && (
                  <span className="text-xs text-[#5c6457] dark:text-[#b4ad9f]">
                    {user.email}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>
        )}
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <NavbarLink
              key={link.href}
              as={Link}
              href={link.href}
              active={isActive}
              className={`font-medium transition-colors ${
                isActive
                  ? "text-[#2f6b4f] font-semibold dark:text-[#a7d48f]"
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
