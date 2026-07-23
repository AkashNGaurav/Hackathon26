import { DarkThemeToggle } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";

const notificationMethods = [
  {
    name: "Wire Transfer / SEPA",
    details: ["Amount of intended deposit", "Bank name", "Bank account number"],
  },
  {
    name: "Bank ACH transfer",
    details: ["Amount of intended deposit", "Bank name"],
  },
  {
    name: "Check",
    details: ["Amount of intended deposit", "Check number", "Bank routing number", "Bank account number"],
  },
  {
    name: "Online bill payment",
    details: ["Amount of intended deposit", "Bank name"],
  },
];

const transferMethods = [
  {
    name: "ACAT transfer",
    details: ["Third-party bank or broker name", "Third-party account number", "Optional partial transfer positions"],
  },
  {
    name: "ATON transfer",
    details: ["Third-party bank or broker name", "Third-party account number", "Canadian securities details if partial"],
  },
  {
    name: "FOP global securities",
    details: ["Holding broker details", "Account owner details", "Asset symbol, description, quantity, and ISIN"],
  },
];

export default function FundingPage() {
  return (
    <main className="min-h-screen bg-[#f5f2ea] text-[#101410] dark:bg-[#07111f] dark:text-[#f3f7fb]">
      <header className="border-b border-black/10 bg-[#f5f2ea]/90 backdrop-blur dark:border-white/10 dark:bg-[#0a1728]/85">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3" aria-label="FinSight home">
            <Image src="/logo.png" alt="FinSight logo" width={38} height={38} className="size-9" />
            <span className="text-lg font-semibold">FinSight</span>
          </Link>
          <DarkThemeToggle />
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-[#516246] dark:text-[#8bc6ff]">
              Funding
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
              Choose how you will fund the account.
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#4e574b] dark:text-[#c8d7ea]">
              Deposit notifications do not move money automatically. FinSight records
              your intended transfer details so the actual bank or broker transfer can be matched.
            </p>
          </div>

          <form className="rounded-lg border border-black/10 bg-[#fcfaf4] p-6 dark:border-white/10 dark:bg-[#11243a] md:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                Funding method
                <select required name="fundingMethod" className="form-field" defaultValue="">
                  <option value="" disabled>
                    Select method
                  </option>
                  <option>Wire Transfer / SEPA</option>
                  <option>Bank ACH Transfer</option>
                  <option>Check</option>
                  <option>Online Bill Payment</option>
                  <option>FOP US Securities</option>
                  <option>ACAT</option>
                  <option>ATON</option>
                  <option>FOP Global Securities</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Amount of intended deposit
                <input required name="depositAmount" type="number" min="0" className="form-field" placeholder="10000" />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Bank or broker name
                <input required name="bankName" className="form-field" placeholder="Bank or broker" />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Bank account number
                <input name="bankAccountNumber" className="form-field" placeholder="Optional for some methods" />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Third-party account number
                <input name="thirdPartyAccount" className="form-field" placeholder="For transfer methods" />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Check number
                <input name="checkNumber" className="form-field" placeholder="If paying by check" />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Routing number
                <input name="routingNumber" className="form-field" placeholder="If applicable" />
              </label>
              <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                Securities or asset transfer details
                <textarea
                  name="assetTransferDetails"
                  rows={5}
                  className="form-field"
                  placeholder="Symbol, exchange, shares, ISIN, CUSIP, option details, or bond face value"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-7 w-full rounded-full bg-[#101410] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#2d342d] dark:bg-[#eaf2fb] dark:text-[#07111f] dark:hover:bg-white"
            >
              Submit application
            </button>
          </form>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-black/10 bg-white/55 p-6 dark:border-white/10 dark:bg-white/6">
            <h2 className="text-2xl font-semibold">Deposit notifications</h2>
            <div className="mt-6 grid gap-5">
              {notificationMethods.map((method) => (
                <article key={method.name} className="border-t border-black/10 pt-4 dark:border-white/10">
                  <h3 className="font-semibold">{method.name}</h3>
                  <p className="mt-2 text-sm text-[#4e574b] dark:text-[#a8bfd7]">
                    {method.details.join(", ")}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-black/10 bg-white/55 p-6 dark:border-white/10 dark:bg-white/6">
            <h2 className="text-2xl font-semibold">Broker transfers</h2>
            <div className="mt-6 grid gap-5">
              {transferMethods.map((method) => (
                <article key={method.name} className="border-t border-black/10 pt-4 dark:border-white/10">
                  <h3 className="font-semibold">{method.name}</h3>
                  <p className="mt-2 text-sm text-[#4e574b] dark:text-[#a8bfd7]">
                    {method.details.join(", ")}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
