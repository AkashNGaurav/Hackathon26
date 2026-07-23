"use client";

import { registerUser } from "@/lib/auth";
import { DarkThemeToggle } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const countries = [
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "Switzerland",
];

export default function OpenAccountPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    setTouched({ email: true, username: true, password: true, country: true });
    if (!email.trim() || !username.trim() || !password.trim() || !country) {
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({ email, username, password, country });
      router.push("/kyc");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Account registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main suppressHydrationWarning className="min-h-screen bg-[#f5f2ea] text-[#101410] dark:bg-[#07111f] dark:text-[#f3f7fb]">
      <header className="border-b border-black/10 bg-[#f5f2ea]/90 backdrop-blur dark:border-white/10 dark:bg-[#0a1728]/85">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3" aria-label="FinSight home">
            <Image src="/logo.png" alt="FinSight logo" width={38} height={38} className="size-9" />
            <span className="text-lg font-semibold">FinSight</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-[#2f6b4f] dark:text-[#8bc6ff]">
              Login
            </Link>
            <div suppressHydrationWarning>{mounted && <DarkThemeToggle />}</div>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-16">
        <aside className="rounded-lg border border-black/10 bg-white/55 p-5 dark:border-white/10 dark:bg-white/6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#516246] dark:text-[#8bc6ff] sm:text-sm">
            Account setup
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:mt-4 sm:text-4xl md:text-5xl">
            Start your European broker account.
          </h1>
          <p className="mt-4 text-base leading-7 text-[#4e574b] dark:text-[#c8d7ea] sm:mt-5 sm:text-lg">
            Create your login first. After this step, FinSight will take you
            straight into KYC so your identity, tax, suitability, and funding
            information can be reviewed.
          </p>
          <div className="mt-6 grid gap-2.5 text-sm text-[#4e574b] dark:text-[#a8bfd7] sm:mt-8 sm:gap-3">
            <span>1. Register account</span>
            <span>2. Complete KYC profile</span>
            <span>3. Upload required documents</span>
            <span>4. Choose funding method</span>
          </div>
        </aside>

        <form
          suppressHydrationWarning
          onSubmit={handleSignup}
          className="rounded-lg border border-black/10 bg-[#fcfaf4] p-5 dark:border-white/10 dark:bg-[#11243a] sm:p-6 md:p-8"
        >
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-semibold">
              <span>
                Email address <span className="text-red-500">*</span>
              </span>
              <input
                suppressHydrationWarning
                required
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                className={`rounded-lg border bg-white px-4 py-3 text-base font-normal text-[#101410] outline-none transition dark:bg-[#0c1827] dark:text-[#f3f7fb] ${
                  touched.email && !email.trim()
                    ? "border-red-500! focus:border-red-500!"
                    : "border-black/15 focus:border-[#2f6b4f] dark:border-white/15 dark:focus:border-[#8bc6ff]"
                }`}
                placeholder="name@example.com"
              />
              {touched.email && !email.trim() && (
                <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory</p>
              )}
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              <span>
                Username <span className="text-red-500">*</span>
              </span>
              <input
                suppressHydrationWarning
                required
                type="text"
                name="username"
                minLength={3}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => handleBlur("username")}
                className={`rounded-lg border bg-white px-4 py-3 text-base font-normal text-[#101410] outline-none transition dark:bg-[#0c1827] dark:text-[#f3f7fb] ${
                  touched.username && !username.trim()
                    ? "border-red-500! focus:border-red-500!"
                    : "border-black/15 focus:border-[#2f6b4f] dark:border-white/15 dark:focus:border-[#8bc6ff]"
                }`}
                placeholder="finsight_user"
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                className={`rounded-lg border bg-white px-4 py-3 text-base font-normal text-[#101410] outline-none transition dark:bg-[#0c1827] dark:text-[#f3f7fb] ${
                  touched.password && !password.trim()
                    ? "border-red-500! focus:border-red-500!"
                    : "border-black/15 focus:border-[#2f6b4f] dark:border-white/15 dark:focus:border-[#8bc6ff]"
                }`}
                placeholder="Minimum 8 characters"
              />
              {touched.password && !password.trim() && (
                <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory</p>
              )}
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              <span>
                Country of residence <span className="text-red-500">*</span>
              </span>
              <select
                suppressHydrationWarning
                required
                name="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                onBlur={() => handleBlur("country")}
                className={`rounded-lg border bg-white px-4 py-3 text-base font-normal text-[#101410] outline-none transition dark:bg-[#0c1827] dark:text-[#f3f7fb] ${
                  touched.country && !country
                    ? "border-red-500! focus:border-red-500!"
                    : "border-black/15 focus:border-[#2f6b4f] dark:border-white/15 dark:focus:border-[#8bc6ff]"
                }`}
              >
                <option value="" disabled>
                  Select country
                </option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {touched.country && !country && (
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
            {isLoading ? "Creating account..." : "Sign up and complete KYC"}
          </button>
        </form>
      </section>
    </main>
  );
}
