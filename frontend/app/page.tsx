"use client";

import { DarkThemeToggle } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const features = [
  {
    title: "Empowering everyone",
    body: "Take confident steps toward your financial future with low fees, simple tools, and a bank-grade app experience.",
    stat: "2.50%",
    label: "annual interest",
  },
  {
    title: "Shape finances your way",
    body: "Invest at your pace with curated portfolios, recurring plans, and cash that keeps earning while you decide.",
    stat: "1 euro",
    label: "to start",
  },
  {
    title: "Built for calm decisions",
    body: "Clear risk views, transparent pricing, and automation help you focus on goals instead of market noise.",
    stat: "24/7",
    label: "portfolio view",
  },
];

const products = [
  {
    name: "Broker",
    title: "Self-investing",
    body: "Trade stocks, ETFs, funds, crypto and more. Build savings plans with fractional investing from just 1 euro.",
    cta: "Explore broker",
  },
  {
    name: "Wealth",
    title: "Automated investing",
    body: "Let experts manage a diversified portfolio aligned with your goals, timeline, and risk profile.",
    cta: "View portfolios",
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main suppressHydrationWarning className="min-h-screen bg-[#f5f2ea] text-[#101410] transition-colors dark:bg-[#07111f] dark:text-[#f3f7fb]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f2ea]/90 backdrop-blur dark:border-white/10 dark:bg-[#0a1728]/85">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 md:py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="FinSight home">
            <Image
              src="/logo.png"
              alt="FinSight logo"
              width={36}
              height={36}
              priority
              className="size-8 shrink-0 sm:size-9"
            />
            <span className="text-lg font-semibold tracking-normal">FinSight</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-8 text-sm font-medium text-[#3c423a] dark:text-[#c7d6ea] md:flex">
            <a className="transition hover:text-[#101410] dark:hover:text-white" href="#invest">
              Invest
            </a>
            <a className="transition hover:text-[#101410] dark:hover:text-white" href="#cash">
              Cash
            </a>
            <a className="transition hover:text-[#101410] dark:hover:text-white" href="#wealth">
              Wealth
            </a>
            <a className="transition hover:text-[#101410] dark:hover:text-white" href="#security">
              Security
            </a>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div suppressHydrationWarning>{mounted && <DarkThemeToggle />}</div>
            <Link
              href="/login"
              className="hidden rounded-full border border-[#101410]/25 px-5 py-2 text-sm font-semibold transition hover:border-[#101410] hover:bg-black/5 dark:border-white/25 dark:hover:border-[#8bc6ff] dark:hover:bg-white/10 sm:inline-flex"
            >
              Login
            </Link>
            <Link
              href="/open-account"
              className="hidden rounded-full bg-[#101410] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#2d342d] dark:bg-[#eaf2fb] dark:text-[#07111f] dark:hover:bg-white sm:inline-flex"
            >
              Open account
            </Link>

            {/* Mobile/Tablet Menu Button Toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-lg border border-black/15 bg-white/70 p-2 text-[#101410] transition hover:bg-white dark:border-white/15 dark:bg-[#0c1827]/70 dark:text-white dark:hover:bg-[#11243a] md:hidden"
              aria-label="Toggle navigation menu"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile & Tablet Drawer Menu */}
        {menuOpen && (
          <div className="border-b border-black/10 bg-[#fcfaf4] px-5 py-5 dark:border-white/10 dark:bg-[#0c1827] md:hidden">
            <div className="flex flex-col gap-4 text-base font-semibold">
              <a
                href="#invest"
                onClick={() => setMenuOpen(false)}
                className="py-1 transition hover:text-[#2f6b4f] dark:hover:text-[#8bc6ff]"
              >
                Invest
              </a>
              <a
                href="#cash"
                onClick={() => setMenuOpen(false)}
                className="py-1 transition hover:text-[#2f6b4f] dark:hover:text-[#8bc6ff]"
              >
                Cash
              </a>
              <a
                href="#wealth"
                onClick={() => setMenuOpen(false)}
                className="py-1 transition hover:text-[#2f6b4f] dark:hover:text-[#8bc6ff]"
              >
                Wealth
              </a>
              <a
                href="#security"
                onClick={() => setMenuOpen(false)}
                className="py-1 transition hover:text-[#2f6b4f] dark:hover:text-[#8bc6ff]"
              >
                Security
              </a>
              <hr className="my-1 border-black/10 dark:border-white/10" />
              <div className="flex flex-col gap-2.5 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-full border border-[#101410]/25 py-3 text-center text-sm font-semibold text-[#101410] transition dark:border-white/25 dark:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/open-account"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-full bg-[#101410] py-3 text-center text-sm font-semibold text-white transition dark:bg-[#eaf2fb] dark:text-[#07111f]"
                >
                  Open account
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-40 bg-[#dfe8cf] dark:bg-[#12304d] sm:h-52" />
        <div className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-4 rounded-full border border-black/10 bg-white/60 px-4 py-2.5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/8 sm:mb-7 sm:py-3">
              <Image
                src="/logo%20full.png"
                alt="FinSight full logo"
                width={190}
                height={92}
                priority
                className="h-auto w-[150px] sm:w-[190px]"
              />
            </div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#516246] dark:text-[#8bc6ff] sm:mb-5 sm:text-sm">
              Insight Today, Wealth Tomorrow
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-[#101410] dark:text-[#f3f7fb] sm:text-6xl md:text-7xl">
              Plan ahead. Live comfortably.
            </h1>
            <p className="mt-5 text-base leading-7 text-[#454b42] dark:text-[#c8d7ea] sm:mt-7 sm:text-xl sm:leading-8">
              Earn interest on cash, invest across global markets, and keep every
              long-term goal in one calm, modern finance app.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row">
              <Link
                id="account"
                href="/open-account"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#101410] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#2d342d] dark:bg-[#eaf2fb] dark:text-[#07111f] dark:hover:bg-white sm:w-auto"
              >
                Open account
              </Link>
              <a
                href="#risk"
                className="inline-flex w-full items-center justify-center rounded-full border border-[#101410]/25 px-7 py-4 text-sm font-semibold transition hover:border-[#101410] hover:bg-white/45 dark:border-white/25 dark:hover:border-[#8bc6ff] dark:hover:bg-white/10 sm:w-auto"
              >
                See risks
              </a>
            </div>
            <p className="mt-4 text-xs text-[#5c6457] dark:text-[#a8bfd7] sm:mt-5 sm:text-sm">
              Capital at risk. Cash rates are variable and subject to market conditions.
            </p>
          </div>

          {/* Hero Portfolio Graphic */}
          <div className="relative flex min-h-[420px] items-center justify-center sm:min-h-[520px]">
            <div className="absolute size-[260px] rounded-full bg-[#bfd0a0] blur-3xl dark:bg-[#1e5f95]/45 sm:size-[480px]" />
            <div className="relative grid w-full max-w-xl grid-cols-1 items-end gap-5 sm:grid-cols-[0.85fr_1fr] sm:gap-4">
              <div className="rounded-[2rem] border border-black/10 bg-[#f8f5ee] p-4 shadow-2xl shadow-black/20 dark:border-white/10 dark:bg-[#11243a] sm:mb-14">
                <div className="rounded-[1.55rem] bg-[#101410] p-5 text-white dark:bg-[#eaf2fb] dark:text-[#07111f]">
                  <div className="mb-6 flex items-center justify-between sm:mb-7">
                    <span className="text-sm font-semibold">Cash</span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs dark:bg-black/10">
                      Active
                    </span>
                  </div>
                  <p className="text-sm opacity-70">Available balance</p>
                  <p className="mt-2 text-3xl font-semibold sm:text-4xl">EUR 18,420</p>
                  <div className="mt-7 space-y-3 sm:mt-9">
                    <div className="h-3 w-full rounded-full bg-white/15 dark:bg-black/10">
                      <div className="h-3 w-3/4 rounded-full bg-[#9fca78]" />
                    </div>
                    <div className="flex justify-between text-xs opacity-75">
                      <span>2.50% p.a.</span>
                      <span>Monthly payout</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2.25rem] border border-black/10 bg-[#f9f7f1] p-3 shadow-2xl shadow-black/25 dark:border-white/10 dark:bg-[#0f2136]">
                <div className="overflow-hidden rounded-[1.75rem] bg-[#eaf0df] dark:bg-[#142b44]">
                  <div className="flex items-center justify-between border-b border-black/10 px-4 py-3.5 dark:border-white/10 sm:px-5 sm:py-4">
                    <span className="text-sm font-semibold">Portfolio</span>
                    <span className="text-xs font-semibold text-[#62715c] dark:text-[#8bc6ff]">+12.8%</span>
                  </div>
                  <div className="p-4 sm:p-5">
                    <p className="text-sm text-[#5c6457] dark:text-[#a8bfd7]">Total value</p>
                    <p className="mt-2 text-3xl font-semibold sm:text-4xl">EUR 42,780</p>
                    <div className="mt-6 flex h-32 items-end gap-2 sm:mt-8 sm:h-40">
                      {[38, 58, 46, 76, 62, 88, 70, 96].map((height, i) => (
                        <span
                          key={i}
                          className="flex-1 rounded-t-full bg-[#2f6b4f] dark:bg-[#8bc6ff]"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
                      {["ETF Core", "Global Stocks", "Green Bonds"].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between rounded-xl bg-white/75 px-4 py-3 text-sm dark:bg-white/8"
                        >
                          <span>{item}</span>
                          <span className="font-semibold text-[#2f6b4f] dark:text-[#8bc6ff]">
                            Buy
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Notice Section */}
      <section id="risk" className="border-y border-black/10 bg-[#101410] text-white dark:border-white/10 dark:bg-[#0c1d31] dark:text-[#f3f7fb]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold">Bank accounts</p>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-2xl font-semibold sm:text-3xl">1 / 6</span>
              <span className="text-xs opacity-75 sm:text-sm">
                Lower product risk. Deposits protected up to applicable statutory limits.
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Investments</p>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-2xl font-semibold sm:text-3xl">6 / 6</span>
              <span className="text-xs opacity-75 sm:text-sm">
                Higher product risk. Market value may rise or fall and losses can occur.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Overnight Cash Section */}
      <section id="cash" className="bg-[#e7eddc] px-4 py-12 dark:bg-[#0d1c2f] sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#516246] dark:text-[#8bc6ff] sm:text-sm">
              Overnight cash
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              2.50% interest on flexible cash.
            </h2>
          </div>
          <p className="text-base leading-7 text-[#4e574b] dark:text-[#c8d7ea] sm:text-lg sm:leading-8">
            Keep idle money working with monthly payouts, transparent protection,
            and instant access from the same account you use to invest.
          </p>
        </div>
      </section>

      {/* Investing Section */}
      <section id="invest" className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#516246] dark:text-[#8bc6ff] sm:text-sm">
              Investing and saving
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl md:text-6xl">
              Everything for your money in one app.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:mt-12">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-lg border border-black/10 bg-white/55 p-6 dark:border-white/10 dark:bg-white/6"
              >
                <p className="text-3xl font-semibold text-[#2f6b4f] dark:text-[#8bc6ff] sm:text-4xl">
                  {feature.stat}
                </p>
                <p className="mt-1 text-xs text-[#687063] dark:text-[#a8bfd7] sm:text-sm">
                  {feature.label}
                </p>
                <h3 className="mt-6 text-lg font-semibold sm:mt-8 sm:text-xl">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#4e574b] dark:text-[#c8d7ea] sm:leading-7">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="bg-[#fcfaf4] px-4 py-14 dark:bg-[#0c1827] sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          {products.map((product) => (
            <article
              id={product.name === "Wealth" ? "wealth" : undefined}
              key={product.name}
              className="grid min-h-[360px] content-between rounded-lg border border-black/10 bg-[#f5f2ea] p-6 dark:border-white/10 dark:bg-[#11243a] sm:min-h-[430px] sm:p-7"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#516246] dark:text-[#8bc6ff] sm:text-sm">
                  {product.name}
                </p>
                <h3 className="mt-3 text-3xl font-semibold sm:mt-4 sm:text-4xl">{product.title}</h3>
                <p className="mt-4 max-w-lg text-base leading-7 text-[#4e574b] dark:text-[#c8d7ea] sm:mt-5 sm:text-lg sm:leading-8">
                  {product.body}
                </p>
              </div>
              <div className="mt-8 flex items-end justify-between gap-4 sm:mt-12">
                <Link
                  href="/open-account"
                  className="inline-flex rounded-full border border-[#101410]/20 px-5 py-3 text-sm font-semibold transition hover:border-[#101410] dark:border-white/25 dark:hover:border-[#8bc6ff]"
                >
                  {product.cta}
                </Link>
                <div className="h-24 w-28 shrink-0 rounded-t-[1.75rem] bg-[#2f6b4f] p-3.5 dark:bg-[#8bc6ff] sm:h-28 sm:w-36 sm:rounded-t-[2rem] sm:p-4">
                  <div className="h-full rounded-t-[1.2rem] bg-white/40 dark:bg-black/20 sm:rounded-t-[1.4rem]" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="security" className="border-t border-black/10 px-4 py-10 text-sm text-[#4e574b] dark:border-white/10 dark:text-[#a8bfd7] sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="sm:col-span-2 md:col-span-1">
            <p className="text-lg font-semibold text-[#101410] dark:text-[#f3f7fb]">
              FinSight
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6 sm:mt-4 sm:leading-7">
              This demo landing page is inspired by modern investment banking
              sites. Investing involves risk, including loss of capital.
            </p>
          </div>
          <div>
            <p className="font-semibold text-[#101410] dark:text-[#f3f7fb]">Company</p>
            <div className="mt-3 grid gap-2.5 sm:mt-4">
              <a href="#" className="hover:underline">About</a>
              <a href="#" className="hover:underline">Careers</a>
              <a href="#" className="hover:underline">Security</a>
            </div>
          </div>
          <div>
            <p className="font-semibold text-[#101410] dark:text-[#f3f7fb]">Legal</p>
            <div className="mt-3 grid gap-2.5 sm:mt-4">
              <a href="#" className="hover:underline">Documents</a>
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
