import { DarkThemeToggle } from "flowbite-react";

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
  return (
    <main className="min-h-screen bg-[#f5f2ea] text-[#101410] transition-colors dark:bg-[#090b0a] dark:text-[#f6f3ea]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f2ea]/90 backdrop-blur dark:border-white/10 dark:bg-[#090b0a]/85">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#" className="flex items-center gap-3" aria-label="ScaleBank home">
            <span className="grid size-9 place-items-center rounded-full bg-[#101410] text-sm font-bold text-[#f5f2ea] dark:bg-[#f6f3ea] dark:text-[#090b0a]">
              S
            </span>
            <span className="text-lg font-semibold tracking-normal">ScaleBank</span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-medium text-[#3c423a] dark:text-[#c8c3b7] md:flex">
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

          <div className="flex items-center gap-3">
            <DarkThemeToggle />
            <a
              href="#account"
              className="hidden rounded-full bg-[#101410] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d342d] dark:bg-[#f6f3ea] dark:text-[#090b0a] dark:hover:bg-white sm:inline-flex"
            >
              Open account
            </a>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-52 bg-[#dfe8cf] dark:bg-[#17251e]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-5 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="mb-5 text-sm font-semibold uppercase text-[#516246] dark:text-[#a7d48f]">
              Invest with ScaleBank
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-normal text-[#101410] dark:text-[#f6f3ea] md:text-7xl">
              Plan ahead. Live comfortably.
            </h1>
            <p className="mt-7 max-w-xl text-xl leading-8 text-[#454b42] dark:text-[#d0cabf]">
              Earn interest on cash, invest across global markets, and keep every
              long-term goal in one calm, modern finance app.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                id="account"
                href="#products"
                className="inline-flex items-center justify-center rounded-full bg-[#101410] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#2d342d] dark:bg-[#f6f3ea] dark:text-[#090b0a] dark:hover:bg-white"
              >
                Open account
              </a>
              <a
                href="#risk"
                className="inline-flex items-center justify-center rounded-full border border-[#101410]/25 px-7 py-4 text-sm font-semibold transition hover:border-[#101410] hover:bg-white/45 dark:border-white/25 dark:hover:border-white dark:hover:bg-white/10"
              >
                See risks
              </a>
            </div>
            <p className="mt-5 text-sm text-[#5c6457] dark:text-[#b4ad9f]">
              Capital at risk. Cash rates are variable and subject to market conditions.
            </p>
          </div>

          <div className="relative flex min-h-[520px] items-center justify-center">
            <div className="absolute h-[480px] w-[480px] rounded-full bg-[#bfd0a0] blur-3xl dark:bg-[#1d6a4d]/60" />
            <div className="relative grid w-full max-w-xl grid-cols-[0.85fr_1fr] items-end gap-4">
              <div className="mb-14 rounded-[2rem] border border-black/10 bg-[#f8f5ee] p-4 shadow-2xl shadow-black/20 dark:border-white/10 dark:bg-[#151816]">
                <div className="rounded-[1.55rem] bg-[#101410] p-5 text-white dark:bg-[#eef2e8] dark:text-[#101410]">
                  <div className="mb-7 flex items-center justify-between">
                    <span className="text-sm font-semibold">Cash</span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs dark:bg-black/10">
                      Active
                    </span>
                  </div>
                  <p className="text-sm opacity-70">Available balance</p>
                  <p className="mt-2 text-4xl font-semibold">EUR 18,420</p>
                  <div className="mt-9 space-y-3">
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

              <div className="rounded-[2.25rem] border border-black/10 bg-[#f9f7f1] p-3 shadow-2xl shadow-black/25 dark:border-white/10 dark:bg-[#161917]">
                <div className="overflow-hidden rounded-[1.75rem] bg-[#eaf0df] dark:bg-[#0d120f]">
                  <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 dark:border-white/10">
                    <span className="text-sm font-semibold">Portfolio</span>
                    <span className="text-xs text-[#62715c] dark:text-[#a7d48f]">+12.8%</span>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-[#5c6457] dark:text-[#b4ad9f]">Total value</p>
                    <p className="mt-2 text-4xl font-semibold">EUR 42,780</p>
                    <div className="mt-8 flex h-40 items-end gap-2">
                      {[38, 58, 46, 76, 62, 88, 70, 96].map((height) => (
                        <span
                          key={height}
                          className="flex-1 rounded-t-full bg-[#2f6b4f] dark:bg-[#a7d48f]"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-8 space-y-3">
                      {["ETF Core", "Global Stocks", "Green Bonds"].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between rounded-xl bg-white/75 px-4 py-3 text-sm dark:bg-white/8"
                        >
                          <span>{item}</span>
                          <span className="font-semibold text-[#2f6b4f] dark:text-[#a7d48f]">
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

      <section id="risk" className="border-y border-black/10 bg-[#101410] text-white dark:border-white/10 dark:bg-[#f6f3ea] dark:text-[#090b0a]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 md:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold">Bank accounts</p>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-3xl font-semibold">1 / 6</span>
              <span className="text-sm opacity-70">
                Lower product risk. Deposits protected up to applicable statutory limits.
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Investments</p>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-3xl font-semibold">6 / 6</span>
              <span className="text-sm opacity-70">
                Higher product risk. Market value may rise or fall and losses can occur.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="cash" className="bg-[#e7eddc] px-5 py-14 dark:bg-[#101611] lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-[#516246] dark:text-[#a7d48f]">
              Overnight cash
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
              2.50% interest on flexible cash.
            </h2>
          </div>
          <p className="text-lg leading-8 text-[#4e574b] dark:text-[#d0cabf]">
            Keep idle money working with monthly payouts, transparent protection,
            and instant access from the same account you use to invest.
          </p>
        </div>
      </section>

      <section id="invest" className="px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-[#516246] dark:text-[#a7d48f]">
              Investing and saving
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
              Everything for your money in one app.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-lg border border-black/10 bg-white/55 p-6 dark:border-white/10 dark:bg-white/6"
              >
                <p className="text-4xl font-semibold text-[#2f6b4f] dark:text-[#a7d48f]">
                  {feature.stat}
                </p>
                <p className="mt-1 text-sm text-[#687063] dark:text-[#b4ad9f]">
                  {feature.label}
                </p>
                <h3 className="mt-8 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-[#4e574b] dark:text-[#d0cabf]">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="bg-[#fcfaf4] px-5 py-20 dark:bg-[#0d100e] lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          {products.map((product) => (
            <article
              id={product.name === "Wealth" ? "wealth" : undefined}
              key={product.name}
              className="grid min-h-[430px] content-between rounded-lg border border-black/10 bg-[#f5f2ea] p-7 dark:border-white/10 dark:bg-[#151816]"
            >
              <div>
                <p className="text-sm font-semibold text-[#516246] dark:text-[#a7d48f]">
                  {product.name}
                </p>
                <h3 className="mt-4 text-4xl font-semibold">{product.title}</h3>
                <p className="mt-5 max-w-lg text-lg leading-8 text-[#4e574b] dark:text-[#d0cabf]">
                  {product.body}
                </p>
              </div>
              <div className="mt-12 flex items-end justify-between gap-6">
                <a
                  href="#account"
                  className="inline-flex rounded-full border border-[#101410]/20 px-5 py-3 text-sm font-semibold transition hover:border-[#101410] dark:border-white/25 dark:hover:border-white"
                >
                  {product.cta}
                </a>
                <div className="h-28 w-36 rounded-t-[2rem] bg-[#2f6b4f] p-4 dark:bg-[#a7d48f]">
                  <div className="h-full rounded-t-[1.4rem] bg-white/40 dark:bg-black/20" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer id="security" className="border-t border-black/10 px-5 py-12 text-sm text-[#4e574b] dark:border-white/10 dark:text-[#b4ad9f] lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="text-lg font-semibold text-[#101410] dark:text-[#f6f3ea]">
              ScaleBank
            </p>
            <p className="mt-4 max-w-xl leading-7">
              This demo landing page is inspired by modern investment banking
              sites. Investing involves risk, including loss of capital.
            </p>
          </div>
          <div>
            <p className="font-semibold text-[#101410] dark:text-[#f6f3ea]">Company</p>
            <div className="mt-4 grid gap-3">
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Security</a>
            </div>
          </div>
          <div>
            <p className="font-semibold text-[#101410] dark:text-[#f6f3ea]">Legal</p>
            <div className="mt-4 grid gap-3">
              <a href="#">Documents</a>
              <a href="#">Privacy</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
