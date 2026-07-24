"use client";

import { loginUser, getToken } from "@/lib/auth";
import { DarkThemeToggle } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (getToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    setTouched({ username: true, password: true });
    if (!username.trim() || !password.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const authResult = await loginUser({ username, password });
      const user = authResult.user;
      const isKycDone = user.kycCompleted ?? user.kyc_completed ?? false;

      if (isKycDone) {
        router.push("/dashboard");
      } else {
        router.push("/kyc");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("We could not find that username and password. Please sign up or try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main suppressHydrationWarning className="min-h-screen bg-[#f5f2ea] text-[#101410] dark:bg-[#07111f] dark:text-[#f3f7fb]">
      <header className="border-b border-black/10 bg-[#f5f2ea]/90 backdrop-blur dark:border-white/10 dark:bg-[#0a1728]/85">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3" aria-label="FinSight home">
            <Image src="/logo.png" alt="FinSight logo" width={38} height={38} className="size-9" />
            <span className="text-lg font-semibold">FinSight</span>
          </Link>
          <div suppressHydrationWarning>{mounted && <DarkThemeToggle />}</div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12 md:grid-cols-[0.9fr_1.1fr] lg:py-20">
        <div>
          <Image
            src="/logo%20full.png"
            alt="FinSight"
            width={230}
            height={112}
            priority
            className="h-auto w-[160px] sm:w-[210px]"
          />
          <h1 className="mt-6 text-3xl font-semibold leading-tight sm:mt-8 sm:text-4xl md:text-5xl">
            Login to FinSight.
          </h1>
          <p className="mt-4 text-base leading-7 text-[#4e574b] dark:text-[#c8d7ea] sm:mt-5">
            If your KYC is complete, login opens your dashboard. If your KYC is
            still pending, FinSight sends you back to finish verification first.
          </p>
        </div>

        <form
          suppressHydrationWarning
          onSubmit={handleLogin}
          className="rounded-lg border border-black/10 bg-[#fcfaf4] p-5 dark:border-white/10 dark:bg-[#11243a] sm:p-6 md:p-8"
        >
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-semibold">
              <span>
                Username <span className="text-red-500">*</span>
              </span>
              <input
                suppressHydrationWarning
                required
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => handleBlur("username")}
                className={`form-field ${touched.username && !username.trim() ? "border-red-500! focus:border-red-500!" : ""}`}
                placeholder="Your username"
              />
              {touched.username && !username.trim() && (
                <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory</p>
              )}
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              <span>
                Password <span className="text-red-500">*</span>
              </span>
              <input
                suppressHydrationWarning
                required
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                className={`form-field ${touched.password && !password.trim() ? "border-red-500! focus:border-red-500!" : ""}`}
                placeholder="Your password"
              />
              {touched.password && !password.trim() && (
                <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory</p>
              )}
            </label>
          </div>

          {error ? (
            <p className="mt-5 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
              {error}
            </p>
          ) : null}

          <button
            suppressHydrationWarning
            type="submit"
            disabled={isLoading}
            className="mt-7 w-full rounded-full bg-[#101410] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#2d342d] disabled:opacity-50 dark:bg-[#eaf2fb] dark:text-[#07111f] dark:hover:bg-white"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <p className="mt-5 text-center text-sm text-[#4e574b] dark:text-[#a8bfd7]">
            New to FinSight?{" "}
            <Link href="/open-account" className="font-semibold text-[#2f6b4f] dark:text-[#8bc6ff]">
              Sign up
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
