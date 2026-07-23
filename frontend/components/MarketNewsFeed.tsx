"use client";

import { useEffect, useState } from "react";
import { Badge, Card } from "flowbite-react";

export interface NewsArticle {
  id: string;
  title: string;
  snippet: string;
  category: "Top News" | "Macro & Economy" | "Earnings" | "Tech & Growth" | "Crypto";
  source: string;
  publishedAt: string;
  readTime: string;
  imageUrl?: string;
  relatedTickers: string[];
  isFeatured?: boolean;
}

const CATEGORIES = [
  "Top News",
  "Macro & Economy",
  "Earnings",
  "Tech & Growth",
  "Crypto",
] as const;

type CategoryType = (typeof CATEGORIES)[number];

const DUMMY_ARTICLES: NewsArticle[] = [
  {
    id: "art-1",
    title: "Tech Giants Rally as Fed Signals Easing Monetary Policy Ahead of Fall Meeting",
    snippet:
      "Major technology equity indices reached fresh multi-month highs on Wednesday as Federal Reserve commentary signaled inflation metrics are moderating faster than quarterly targets...",
    category: "Top News",
    source: "Financial Times",
    publishedAt: "25 mins ago",
    readTime: "4 min read",
    relatedTickers: ["$AAPL", "$NVDA", "$MSFT"],
    isFeatured: true,
  },
  {
    id: "art-2",
    title: "Oil Prices Stabilize After US Commercial Crude Stockpile Drawdown Exceeds Estimates",
    snippet:
      "Global benchmark crude futures recovered from early session losses following Energy Information Administration report showing inventory depletion...",
    category: "Macro & Economy",
    source: "Bloomberg",
    publishedAt: "1 hour ago",
    readTime: "3 min read",
    relatedTickers: ["$XOM", "$CVX", "$USO"],
  },
  {
    id: "art-3",
    title: "Q3 Earnings Preview: Enterprise Cloud & Hardware Demand Drives Margin Expansion",
    snippet:
      "Analysts forecast robust double-digit top-line growth across hyperscale infrastructure providers as AI spending shifts to enterprise production deployments...",
    category: "Earnings",
    source: "Wall Street Journal",
    publishedAt: "2 hours ago",
    readTime: "5 min read",
    relatedTickers: ["$AMZN", "$ORCL", "$GOOGL"],
  },
  {
    id: "art-4",
    title: "Bitcoin Consolidates Near $64,000 as Institutional Spot ETF Daily Inflows Net $340M",
    snippet:
      "Digital asset markets saw sustained buying pressure from wealth management desks with major Bitcoin funds logging sixth consecutive day of positive net flow...",
    category: "Crypto",
    source: "CoinDesk",
    publishedAt: "3 hours ago",
    readTime: "3 min read",
    relatedTickers: ["$BTC", "$ETH", "$COIN"],
  },
  {
    id: "art-5",
    title: "US Retail Sales Outpace Consensus Expectations in Strong Consumer Demand Push",
    snippet:
      "Core consumer purchases rose 0.6% month-over-month indicating household spending resilience despite elevated borrowing costs...",
    category: "Macro & Economy",
    source: "Reuters",
    publishedAt: "4 hours ago",
    readTime: "4 min read",
    relatedTickers: ["$WMT", "$TGT", "$AMZN"],
  },
  {
    id: "art-6",
    title: "Semiconductor Equipment Manufacturers See Record Order Backlog For Next-Gen Chips",
    snippet:
      "Advanced packaging and EUV lithography suppliers report solid order visibility extending through late 2027...",
    category: "Tech & Growth",
    source: "MarketWatch",
    publishedAt: "5 hours ago",
    readTime: "4 min read",
    relatedTickers: ["$ASML", "$TSM", "$LRCX"],
  },
  {
    id: "art-7",
    title: "European Automobile Makers Adjust Supply Chains Amid EV Tariff Guidance",
    snippet:
      "Leading European automakers announce localized battery production partnerships to maintain margin targets under updated regulatory frameworks...",
    category: "Tech & Growth",
    source: "Barron's",
    publishedAt: "6 hours ago",
    readTime: "5 min read",
    relatedTickers: ["$TSLA", "$RIVN"],
  },
];

function RenderNewsThumbnail({
  category,
  type = "hero",
}: {
  category: string;
  type?: "hero" | "compact" | "grid";
}) {
  const getGradient = () => {
    switch (category) {
      case "Crypto":
        return "from-amber-600/30 via-orange-600/20 to-yellow-500/30";
      case "Tech & Growth":
        return "from-blue-600/30 via-indigo-600/20 to-violet-500/30";
      case "Earnings":
        return "from-[#2f6b4f]/40 via-emerald-600/20 to-teal-500/30";
      case "Macro & Economy":
        return "from-purple-600/30 via-pink-600/20 to-rose-500/30";
      default:
        return "from-[#2f6b4f]/30 via-teal-600/20 to-cyan-500/30";
    }
  };

  const getDimensions = () => {
    if (type === "hero") return "h-56 sm:h-64 w-full";
    if (type === "compact") return "h-20 w-20 sm:h-24 sm:w-24 shrink-0";
    return "h-40 w-full";
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${getGradient()} ${getDimensions()} flex items-center justify-center border border-black/10 dark:border-white/10`}
    >
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
      <div className="relative flex flex-col items-center gap-1.5 p-3 text-center">
        <div className="rounded-full bg-white/50 p-2 backdrop-blur-xs dark:bg-black/50">
          {category === "Crypto" ? (
            <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5h-2v-1h-1v1H9v-2h2v-3H9V9.5h2v-1h1v1h1a2 2 0 0 1 0 4h-1v3h2z" />
            </svg>
          ) : category === "Tech & Growth" ? (
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 fill-current" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-[#2f6b4f] dark:text-[#a7d48f] fill-current" viewBox="0 0 24 24">
              <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.09-4-4L2 15.08l1.5 1.41z" />
            </svg>
          )}
        </div>
        {type === "hero" && (
          <span className="text-xs font-bold uppercase tracking-wider text-[#101410] dark:text-[#f6f3ea]">
            Market Insight • {category}
          </span>
        )}
      </div>
    </div>
  );
}

export function MarketNewsFeed() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("Top News");
  const [articles, setArticles] = useState<NewsArticle[]>(DUMMY_ARTICLES);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    /*
    const fetchMarketNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/news/market?category=${encodeURIComponent(activeCategory)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch market news');
        }
        const data: NewsArticle[] = await response.json();
        setArticles(data);
      } catch (error) {
        console.error('Error fetching market news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketNews();
    */
  }, [activeCategory]);

  const filteredArticles =
    activeCategory === "Top News"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  const heroArticle = filteredArticles[0] || articles[0];
  const secondaryArticles = filteredArticles.slice(1, 4);
  const gridArticles = filteredArticles.slice(4);

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-black/10 pb-3 dark:border-white/10">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#101410] text-white shadow-xs dark:bg-[#f6f3ea] dark:text-[#090b0a]"
                  : "bg-white/70 text-[#4e574b] hover:bg-white hover:text-[#101410] dark:bg-white/5 dark:text-[#c8c3b7] dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Two-Column Featured Section */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Hero Article (60% width ~ 7 cols) */}
        {heroArticle && (
          <div className="group lg:col-span-7 flex flex-col justify-between rounded-2xl border border-black/10 bg-white/80 p-5 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#121614]">
            <div>
              <RenderNewsThumbnail category={heroArticle.category} type="hero" />

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#2f6b4f]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2f6b4f] dark:bg-[#a7d48f]/20 dark:text-[#a7d48f]">
                  {heroArticle.category}
                </span>
                <span className="text-xs text-[#687063] dark:text-[#b4ad9f]">
                  {heroArticle.source} • {heroArticle.publishedAt}
                </span>
                <span className="text-xs text-[#687063] dark:text-[#b4ad9f]">
                  • {heroArticle.readTime}
                </span>
              </div>

              <h3 className="mt-3 text-xl font-bold leading-snug text-[#101410] transition group-hover:text-[#2f6b4f] dark:text-[#f6f3ea] dark:group-hover:text-[#a7d48f]">
                {heroArticle.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-[#4e574b] dark:text-[#d0cabf]">
                {heroArticle.snippet}
              </p>
            </div>

            {/* Related Tickers */}
            <div className="mt-5 flex items-center gap-2 pt-3 border-t border-black/5 dark:border-white/5">
              <span className="text-xs font-medium text-[#687063] dark:text-[#b4ad9f]">
                Tickers:
              </span>
              {heroArticle.relatedTickers.map((ticker) => (
                <span
                  key={ticker}
                  className="rounded border border-black/10 bg-black/5 px-2 py-0.5 text-xs font-bold text-[#101410] dark:border-white/10 dark:bg-white/10 dark:text-[#f6f3ea]"
                >
                  {ticker}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Right Column: Secondary Compact News Stack (40% width ~ 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#516246] dark:text-[#a7d48f]">
              Trending Market News
            </h4>
            <span className="text-xs text-[#687063] dark:text-[#b4ad9f]">
              Top Headlines
            </span>
          </div>

          {secondaryArticles.map((article) => (
            <div
              key={article.id}
              className="group flex items-start gap-3.5 rounded-xl border border-black/10 bg-white/80 p-3.5 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#121614]"
            >
              <RenderNewsThumbnail category={article.category} type="compact" />

              <div className="flex flex-col justify-between min-h-[5.5rem] flex-1">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-[#2f6b4f] dark:text-[#a7d48f]">
                      {article.category}
                    </span>
                    <span className="text-[#687063] dark:text-[#b4ad9f]">
                      • {article.publishedAt}
                    </span>
                  </div>

                  <h5 className="mt-1 text-sm font-bold leading-snug text-[#101410] transition group-hover:text-[#2f6b4f] dark:text-[#f6f3ea] dark:group-hover:text-[#a7d48f]">
                    {article.title}
                  </h5>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-[#687063] dark:text-[#b4ad9f]">
                  <span className="font-medium text-[#3c423a] dark:text-[#c8c3b7]">
                    {article.source}
                  </span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Section for Additional News Articles (Using Flowbite Cards) */}
      {gridArticles.length > 0 && (
        <div className="mt-10 space-y-4 pt-6 border-t border-black/10 dark:border-white/10">
          <h4 className="text-base font-bold tracking-tight text-[#101410] dark:text-[#f6f3ea]">
            More Market Coverage
          </h4>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {gridArticles.map((article) => (
              <Card
                key={article.id}
                className="group flex flex-col justify-between border-black/10 bg-white/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all dark:border-white/10 dark:bg-[#121614]"
              >
                <div className="space-y-3">
                  <RenderNewsThumbnail category={article.category} type="grid" />

                  <div className="flex items-center justify-between">
                    <Badge color="indigo" className="text-[11px] font-semibold">
                      {article.category}
                    </Badge>
                    <span className="text-[11px] text-[#687063] dark:text-[#b4ad9f]">
                      {article.publishedAt}
                    </span>
                  </div>

                  <h5 className="text-base font-bold leading-snug text-[#101410] transition group-hover:text-[#2f6b4f] dark:text-[#f6f3ea] dark:group-hover:text-[#a7d48f]">
                    {article.title}
                  </h5>

                  <p className="text-xs leading-relaxed text-[#4e574b] dark:text-[#d0cabf]">
                    {article.snippet}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5 text-xs">
                  <span className="font-medium text-[#687063] dark:text-[#b4ad9f]">
                    {article.source} • {article.readTime}
                  </span>
                  <div className="flex gap-1">
                    {article.relatedTickers.map((ticker) => (
                      <span
                        key={ticker}
                        className="rounded border border-black/10 bg-black/5 px-1.5 py-0.5 text-[10px] font-bold text-[#101410] dark:border-white/10 dark:bg-white/10 dark:text-[#f6f3ea]"
                      >
                        {ticker}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MarketNewsFeed;
