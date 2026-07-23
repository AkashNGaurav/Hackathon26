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
import { usePathname } from "next/navigation";

export function DashboardNavbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard/mutual-funds", label: "Mutual Funds" },
    { href: "/dashboard/etf", label: "ETF" },
    { href: "/dashboard/stocks", label: "Stocks" },
    { href: "/dashboard/portfolio", label: "Portfolio" },
  ];

  return (
    <Navbar
      fluid
      className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f2ea]/95 backdrop-blur-md dark:border-white/10 dark:bg-[#090b0a]/90 px-4 py-3"
    >
      <NavbarBrand as={Link} href="/dashboard" className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="InvestPro Logo"
          width={36}
          height={36}
          className="size-9 shrink-0"
          priority
        />
        <span className="self-center whitespace-nowrap text-xl font-bold tracking-tight text-[#101410] dark:text-[#f6f3ea]">
          InvestPro
        </span>
      </NavbarBrand>

      <div className="flex items-center gap-2 md:order-2">
        <DarkThemeToggle className="focus:ring-2 focus:ring-[#2f6b4f] dark:focus:ring-[#a7d48f]" />
        <NavbarToggle className="focus:ring-2 focus:ring-[#2f6b4f] dark:focus:ring-[#a7d48f]" />
      </div>

      <NavbarCollapse>
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
