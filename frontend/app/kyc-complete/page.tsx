"use client";

import { DarkThemeToggle } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function KycCompletePage() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      router.push("/login");
    }, 5000);

    const countdown = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => {
      window.clearTimeout(redirectTimer);
      window.clearInterval(countdown);
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-[#f5f2ea] text-[#101410] dark:bg-[#07111f] dark:text-[#f3f7fb]">
      <header className="border-b border-black/10 bg-[#f5f2ea]/90 backdrop-blur dark:border-white/10 dark:bg-[#0a1728]/85">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3" aria-label="FinSight home">
            <Image src="/logo.png" alt="FinSight logo" width={38} height={38} className="size-9" />
            <span className="text-lg font-semibold">FinSight</span>
          </Link>
          <DarkThemeToggle />
        </nav>
      </header>

      <section className="mx-auto flex max-w-3xl px-5 py-20">
        <div className="w-full rounded-lg border border-black/10 bg-[#fcfaf4] p-8 text-center shadow-xl shadow-black/5 dark:border-white/10 dark:bg-[#11243a]">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#2f6b4f] text-white dark:bg-[#8bc6ff] dark:text-[#07111f]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-10" fill="none">
              <path
                d="M5 12.5L10 17L19 7"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          <h1 className="mt-7 text-4xl font-semibold leading-tight">
            KYC completed
          </h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-[#4e574b] dark:text-[#c8d7ea]">
            Your verification profile is complete. Please go back to{" "}
            <Link href="/login" className="font-semibold text-[#2f6b4f] dark:text-[#8bc6ff]">
              login
            </Link>{" "}
            to access your dashboard.
          </p>

          <div className="mt-8 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div className="h-2 animate-[shrink_5s_linear_forwards] rounded-full bg-[#2f6b4f] dark:bg-[#8bc6ff]" />
          </div>
          <p className="mt-3 text-sm text-[#4e574b] dark:text-[#a8bfd7]">
            Redirecting automatically in {secondsLeft} seconds.
          </p>
        </div>
      </section>
    </main>
  );
}
