"use client";

import { updateKycStatus } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";
import { DarkThemeToggle } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

const identityDocuments = ["Passport", "National identity card", "Driver's license"];

const europeanCountries = [
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

const addressDocuments = [
  "Utility bill",
  "Council tax bill",
  "Home insurance bill",
  "Bank, mortgage, or brokerage statement",
  "Signed and stamped bank address letter",
  "Credit card statement not older than six weeks",
  "Government issued letter or statement",
  "Resident permit",
  "Address card for Hungary",
];

export default function KycPage() {
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const identityInputRef = useRef<HTMLInputElement | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  // Mounted State for Hydration Protection
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [countryOfBirth, setCountryOfBirth] = useState("");
  const [citizenship, setCitizenship] = useState("");
  const [taxResidency, setTaxResidency] = useState("");
  const [taxId, setTaxId] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [employerAddress, setEmployerAddress] = useState("");
  const [assetsIncome, setAssetsIncome] = useState("");
  const [wealthSource, setWealthSource] = useState("");
  const [investmentObjectives, setInvestmentObjectives] = useState("");

  // Touched Fields State
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Uploaded Files State
  const [identityFiles, setIdentityFiles] = useState<File[]>([]);
  const [addressFiles, setAddressFiles] = useState<File[]>([]);
  const [showAllAddressDocs, setShowAllAddressDocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  // Form Validation Logic
  const isDateValid = /^\d{2}-\d{2}-\d{4}$/.test(dateOfBirth.trim());
  const hasIdentityFiles = identityFiles.length > 0;
  const hasAddressFiles = addressFiles.length > 0;

  const isFormValid =
    fullName.trim().length > 0 &&
    isDateValid &&
    address.trim().length > 0 &&
    countryOfBirth !== "" &&
    citizenship !== "" &&
    taxResidency !== "" &&
    taxId.trim().length > 0 &&
    employerName.trim().length > 0 &&
    employerAddress.trim().length > 0 &&
    assetsIncome !== "" &&
    wealthSource !== "" &&
    investmentObjectives.trim().length > 0 &&
    hasIdentityFiles &&
    hasAddressFiles;

  function formatDate(value: string) {
    const [year, month, day] = value.split("-");
    if (!year || !month || !day) {
      return "";
    }
    return `${day}-${month}-${year}`;
  }

  function parseDate(value: string) {
    const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!match) {
      return "";
    }
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  function handleNativeDateChange(event: ChangeEvent<HTMLInputElement>) {
    setDateOfBirth(formatDate(event.target.value));
  }

  function handleTypedDateChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;
    if (nextValue === "") {
      setDateOfBirth("");
      if (dateInputRef.current) {
        dateInputRef.current.value = "";
      }
      return;
    }

    setDateOfBirth(nextValue);
    if (dateInputRef.current) {
      dateInputRef.current.value = parseDate(nextValue);
    }
  }

  function openDatePicker() {
    handleBlur("dateOfBirth");
    const input = dateInputRef.current;
    if (!input) return;

    input.value = parseDate(dateOfBirth);
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  }

  function handleIdentityFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      const selected = Array.from(event.target.files);
      setIdentityFiles((prev) => [...prev, ...selected]);
    }
  }

  function removeIdentityFile(index: number) {
    setIdentityFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddressFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      const selected = Array.from(event.target.files);
      setAddressFiles((prev) => [...prev, ...selected]);
    }
  }

  function removeAddressFile(index: number) {
    setAddressFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  async function handleKycComplete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTouched({
      fullName: true,
      dateOfBirth: true,
      address: true,
      countryOfBirth: true,
      citizenship: true,
      taxResidency: true,
      taxId: true,
      employerName: true,
      employerAddress: true,
      assetsIncome: true,
      wealthSource: true,
      investmentObjectives: true,
      identityFiles: true,
      addressFiles: true,
    });

    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateKycStatus(true);
      router.push("/kyc-complete");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthGuard>
      <main suppressHydrationWarning className="min-h-screen bg-[#f5f2ea] text-[#101410] dark:bg-[#07111f] dark:text-[#f3f7fb]">
      <header className="border-b border-black/10 bg-[#f5f2ea]/90 backdrop-blur dark:border-white/10 dark:bg-[#0a1728]/85">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3" aria-label="FinSight home">
            <Image src="/logo.png" alt="FinSight logo" width={38} height={38} className="size-9" />
            <span className="text-lg font-semibold">FinSight</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/open-account" className="text-sm font-semibold text-[#2f6b4f] dark:text-[#8bc6ff]">
              Register
            </Link>
            <div suppressHydrationWarning>{mounted && <DarkThemeToggle />}</div>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#516246] dark:text-[#8bc6ff] sm:text-sm">
            KYC application
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl md:text-6xl">
            Complete your investor profile.
          </h1>
          <p className="mt-4 text-base leading-7 text-[#4e574b] dark:text-[#c8d7ea] sm:mt-5 sm:text-lg sm:leading-8">
            FinSight uses this information to verify your identity, tax status,
            funding source, and investing suitability before activating brokerage access.
          </p>
        </div>

        <form suppressHydrationWarning onSubmit={handleKycComplete} className="mt-8 grid gap-6 sm:mt-10 sm:gap-8">
          {/* Personal details */}
          <section className="rounded-lg border border-black/10 bg-[#fcfaf4] p-4 dark:border-white/10 dark:bg-[#11243a] sm:p-6 md:p-8">
            <h2 className="text-xl font-semibold sm:text-2xl">Personal details</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                <span>
                  Full name <span className="text-red-500">*</span>
                </span>
                <input
                  suppressHydrationWarning
                  required
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => handleBlur("fullName")}
                  className={`form-field ${touched.fullName && !fullName.trim() ? "border-red-500! focus:border-red-500!" : ""}`}
                  placeholder="Legal full name"
                />
                {touched.fullName && !fullName.trim() && (
                  <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory</p>
                )}
              </label>

              <div className="grid gap-2 text-sm font-semibold">
                <label htmlFor="dateOfBirth">
                  Date of birth <span className="text-red-500">*</span>
                </label>
                <div className="flex items-stretch gap-2">
                  <input
                    ref={dateInputRef}
                    type="date"
                    aria-hidden="true"
                    tabIndex={-1}
                    onChange={handleNativeDateChange}
                    className="sr-only"
                  />
                  <input
                    id="dateOfBirth"
                    suppressHydrationWarning
                    required
                    name="dateOfBirth"
                    value={dateOfBirth}
                    onChange={handleTypedDateChange}
                    onBlur={() => handleBlur("dateOfBirth")}
                    placeholder="dd-mm-yyyy"
                    inputMode="numeric"
                    autoComplete="bday"
                    maxLength={10}
                    pattern="\d{2}-\d{2}-\d{4}"
                    className={`form-field ${touched.dateOfBirth && !isDateValid ? "border-red-500! focus:border-red-500!" : ""}`}
                  />
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={openDatePicker}
                    className="inline-flex shrink-0 items-center justify-center rounded-lg border border-black/15 bg-white p-3 text-sm font-semibold transition hover:border-[#2f6b4f] hover:bg-[#f5f2ea]/60 dark:border-white/15 dark:bg-[#0c1827] dark:hover:border-[#8bc6ff] dark:hover:bg-[#11243a]"
                    aria-label="Open calendar"
                    title="Open calendar picker"
                  >
                    <svg
                      className="size-5 text-[#2f6b4f] dark:text-[#8bc6ff]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
                {touched.dateOfBirth && !isDateValid ? (
                  <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory (dd-mm-yyyy)</p>
                ) : (
                  <p className="text-xs font-normal text-[#4e574b] dark:text-[#a8bfd7]">
                    Enter manually in `dd-mm-yyyy` format or use the calendar icon picker.
                  </p>
                )}
              </div>

              <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                <span>
                  Residential address <span className="text-red-500">*</span>
                </span>
                <textarea
                  suppressHydrationWarning
                  required
                  name="address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={() => handleBlur("address")}
                  className={`form-field ${touched.address && !address.trim() ? "border-red-500! focus:border-red-500!" : ""}`}
                  placeholder="Street, city, postal code, country"
                />
                {touched.address && !address.trim() && (
                  <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory</p>
                )}
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                <span>
                  Country of birth <span className="text-red-500">*</span>
                </span>
                <select
                  suppressHydrationWarning
                  required
                  name="countryOfBirth"
                  value={countryOfBirth}
                  onChange={(e) => setCountryOfBirth(e.target.value)}
                  onBlur={() => handleBlur("countryOfBirth")}
                  className={`form-field ${touched.countryOfBirth && !countryOfBirth ? "border-red-500! focus:border-red-500!" : ""}`}
                >
                  <option value="" disabled>
                    Select country of birth
                  </option>
                  {europeanCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {touched.countryOfBirth && !countryOfBirth && (
                  <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory</p>
                )}
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                <span>
                  Citizenship <span className="text-red-500">*</span>
                </span>
                <select
                  suppressHydrationWarning
                  required
                  name="citizenship"
                  value={citizenship}
                  onChange={(e) => setCitizenship(e.target.value)}
                  onBlur={() => handleBlur("citizenship")}
                  className={`form-field ${touched.citizenship && !citizenship ? "border-red-500! focus:border-red-500!" : ""}`}
                >
                  <option value="" disabled>
                    Select citizenship
                  </option>
                  {europeanCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {touched.citizenship && !citizenship && (
                  <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory</p>
                )}
              </label>
            </div>
          </section>

          {/* Tax, employment, and wealth */}
          <section className="rounded-lg border border-black/10 bg-[#fcfaf4] p-6 dark:border-white/10 dark:bg-[#11243a] md:p-8">
            <h2 className="text-2xl font-semibold">Tax, employment, and wealth</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                <span>
                  Tax residency <span className="text-red-500">*</span>
                </span>
                <select
                  suppressHydrationWarning
                  required
                  name="taxResidency"
                  value={taxResidency}
                  onChange={(e) => setTaxResidency(e.target.value)}
                  onBlur={() => handleBlur("taxResidency")}
                  className={`form-field ${touched.taxResidency && !taxResidency ? "border-red-500! focus:border-red-500!" : ""}`}
                >
                  <option value="" disabled>
                    Select tax residency
                  </option>
                  {europeanCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {touched.taxResidency && !taxResidency && (
                  <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory</p>
                )}
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                <span>
                  Tax identification number <span className="text-red-500">*</span>
                </span>
                <input
                  suppressHydrationWarning
                  required
                  name="taxId"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  onBlur={() => handleBlur("taxId")}
                  className={`form-field ${touched.taxId && !taxId.trim() ? "border-red-500! focus:border-red-500!" : ""}`}
                  placeholder="TIN"
                />
                {touched.taxId && !taxId.trim() && (
                  <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory</p>
                )}
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                <span>
                  Employer name <span className="text-red-500">*</span>
                </span>
                <input
                  suppressHydrationWarning
                  required
                  name="employerName"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  onBlur={() => handleBlur("employerName")}
                  className={`form-field ${touched.employerName && !employerName.trim() ? "border-red-500! focus:border-red-500!" : ""}`}
                  placeholder="Employer name"
                />
                {touched.employerName && !employerName.trim() && (
                  <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory</p>
                )}
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                <span>
                  Employer address <span className="text-red-500">*</span>
                </span>
                <input
                  suppressHydrationWarning
                  required
                  name="employerAddress"
                  value={employerAddress}
                  onChange={(e) => setEmployerAddress(e.target.value)}
                  onBlur={() => handleBlur("employerAddress")}
                  className={`form-field ${touched.employerAddress && !employerAddress.trim() ? "border-red-500! focus:border-red-500!" : ""}`}
                  placeholder="Employer address"
                />
                {touched.employerAddress && !employerAddress.trim() && (
                  <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory</p>
                )}
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                <span>
                  Assets and income <span className="text-red-500">*</span>
                </span>
                <select
                  suppressHydrationWarning
                  required
                  name="assetsIncome"
                  value={assetsIncome}
                  onChange={(e) => setAssetsIncome(e.target.value)}
                  onBlur={() => handleBlur("assetsIncome")}
                  className={`form-field ${touched.assetsIncome && !assetsIncome ? "border-red-500! focus:border-red-500!" : ""}`}
                >
                  <option value="" disabled>
                    Select range
                  </option>
                  <option>Under EUR 25,000</option>
                  <option>EUR 25,000 - EUR 100,000</option>
                  <option>EUR 100,000 - EUR 500,000</option>
                  <option>Above EUR 500,000</option>
                </select>
                {touched.assetsIncome && !assetsIncome && (
                  <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory</p>
                )}
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                <span>
                  Source of wealth and funds <span className="text-red-500">*</span>
                </span>
                <select
                  suppressHydrationWarning
                  required
                  name="wealthSource"
                  value={wealthSource}
                  onChange={(e) => setWealthSource(e.target.value)}
                  onBlur={() => handleBlur("wealthSource")}
                  className={`form-field ${touched.wealthSource && !wealthSource ? "border-red-500! focus:border-red-500!" : ""}`}
                >
                  <option value="" disabled>
                    Select primary source
                  </option>
                  <option>Employment income</option>
                  <option>Business ownership</option>
                  <option>Investment returns</option>
                  <option>Sale of property</option>
                  <option>Inheritance or family wealth</option>
                </select>
                {touched.wealthSource && !wealthSource && (
                  <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory</p>
                )}
              </label>

              <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                <span>
                  Investment objectives and experience <span className="text-red-500">*</span>
                </span>
                <textarea
                  suppressHydrationWarning
                  required
                  name="investmentObjectives"
                  rows={4}
                  value={investmentObjectives}
                  onChange={(e) => setInvestmentObjectives(e.target.value)}
                  onBlur={() => handleBlur("investmentObjectives")}
                  className={`form-field ${touched.investmentObjectives && !investmentObjectives.trim() ? "border-red-500! focus:border-red-500!" : ""}`}
                  placeholder="Growth, income, capital preservation, trading experience, asset classes used"
                />
                {touched.investmentObjectives && !investmentObjectives.trim() && (
                  <p className="text-xs italic text-red-500 dark:text-red-400">This field is mandatory</p>
                )}
              </label>
            </div>
          </section>

          {/* Documents */}
          <section className="rounded-lg border border-black/10 bg-[#fcfaf4] p-6 dark:border-white/10 dark:bg-[#11243a] md:p-8">
            <h2 className="text-2xl font-semibold">Documents</h2>
            <p className="mt-3 leading-7 text-[#4e574b] dark:text-[#c8d7ea]">
              Upload scanned documents where possible. Multi-file uploads supported (PDF, PNG, JPG).
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Identity Document Box */}
              <div className="flex flex-col justify-between rounded-lg border border-black/10 bg-white/55 p-5 dark:border-white/10 dark:bg-white/6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Proof of identity <span className="text-red-500">*</span>
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        identityFiles.length > 0
                          ? "bg-[#2f6b4f]/15 text-[#2f6b4f] dark:bg-[#8bc6ff]/15 dark:text-[#8bc6ff]"
                          : "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
                      }`}
                    >
                      {identityFiles.length > 0
                        ? `${identityFiles.length} file${identityFiles.length !== 1 ? "s" : ""} uploaded`
                        : "Required"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#4e574b] dark:text-[#a8bfd7]">
                    Must include full name, date of birth, photograph, signature, document number, expiry date.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#4e574b] dark:text-[#c8d7ea]">
                    {identityDocuments.map((doc) => (
                      <span key={doc} className="rounded-md bg-black/5 px-2.5 py-1 dark:bg-white/10">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <input
                    ref={identityInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="sr-only"
                    onChange={(e) => {
                      handleIdentityFileChange(e);
                      handleBlur("identityFiles");
                    }}
                  />

                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => {
                      handleBlur("identityFiles");
                      identityInputRef.current?.click();
                    }}
                    className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white px-4 py-5 text-center transition dark:bg-[#0c1827] ${
                      touched.identityFiles && identityFiles.length === 0
                        ? "border-red-500 bg-red-500/5 dark:border-red-500 dark:bg-red-500/5"
                        : "border-black/20 hover:border-[#2f6b4f] hover:bg-[#f5f2ea]/50 dark:border-white/20 dark:hover:border-[#8bc6ff] dark:hover:bg-[#11243a]"
                    }`}
                  >
                    <svg
                      className="size-8 text-[#2f6b4f] dark:text-[#8bc6ff]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <span className="mt-2 text-sm font-semibold text-[#101410] dark:text-[#f3f7fb]">
                      Choose Files or Drop Here
                    </span>
                    <span className="mt-1 text-xs text-[#4e574b] dark:text-[#a8bfd7]">
                      Select multiple proof of identity files
                    </span>
                  </button>

                  {touched.identityFiles && identityFiles.length === 0 && (
                    <p className="mt-2 text-xs italic text-red-500 dark:text-red-400">
                      This field is mandatory (upload at least 1 identity document)
                    </p>
                  )}

                  {/* Uploaded File List */}
                  {identityFiles.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {identityFiles.map((file, index) => (
                        <li
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between rounded-lg border border-black/10 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-[#0c1827]"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <svg
                              className="size-4 shrink-0 text-[#2f6b4f] dark:text-[#8bc6ff]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                              />
                            </svg>
                            <span className="truncate font-medium text-[#101410] dark:text-[#f3f7fb]">
                              {file.name}
                            </span>
                            <span className="shrink-0 text-[#71717a] dark:text-[#a8bfd7]">
                              ({formatBytes(file.size)})
                            </span>
                          </div>
                          <button
                            suppressHydrationWarning
                            type="button"
                            onClick={() => removeIdentityFile(index)}
                            className="ml-2 rounded-full p-1 text-red-500 hover:bg-red-500/10 dark:text-red-400"
                            aria-label={`Remove ${file.name}`}
                            title="Remove file"
                          >
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Address Document Box */}
              <div className="flex flex-col justify-between rounded-lg border border-black/10 bg-white/55 p-5 dark:border-white/10 dark:bg-white/6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Proof of residential address <span className="text-red-500">*</span>
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        addressFiles.length > 0
                          ? "bg-[#2f6b4f]/15 text-[#2f6b4f] dark:bg-[#8bc6ff]/15 dark:text-[#8bc6ff]"
                          : "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
                      }`}
                    >
                      {addressFiles.length > 0
                        ? `${addressFiles.length} file${addressFiles.length !== 1 ? "s" : ""} uploaded`
                        : "Required"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#4e574b] dark:text-[#a8bfd7]">
                    Must show applicant name and address, dated within six months.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#4e574b] dark:text-[#c8d7ea]">
                    {(showAllAddressDocs ? addressDocuments : addressDocuments.slice(0, 4)).map((doc) => (
                      <span key={doc} className="rounded-md bg-black/5 px-2.5 py-1 dark:bg-white/10">
                        {doc}
                      </span>
                    ))}
                    {showAllAddressDocs ? (
                      <button
                        suppressHydrationWarning
                        type="button"
                        onClick={() => setShowAllAddressDocs(false)}
                        className="rounded-md bg-[#2f6b4f]/15 px-2.5 py-1 font-semibold text-[#2f6b4f] transition hover:bg-[#2f6b4f]/25 dark:bg-[#8bc6ff]/20 dark:text-[#8bc6ff] dark:hover:bg-[#8bc6ff]/30"
                      >
                        Show less
                      </button>
                    ) : (
                      <button
                        suppressHydrationWarning
                        type="button"
                        onClick={() => setShowAllAddressDocs(true)}
                        className="rounded-md bg-[#2f6b4f]/15 px-2.5 py-1 font-semibold text-[#2f6b4f] transition hover:bg-[#2f6b4f]/25 dark:bg-[#8bc6ff]/20 dark:text-[#8bc6ff] dark:hover:bg-[#8bc6ff]/30"
                      >
                        +{addressDocuments.length - 4} more
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <input
                    ref={addressInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="sr-only"
                    onChange={(e) => {
                      handleAddressFileChange(e);
                      handleBlur("addressFiles");
                    }}
                  />

                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => {
                      handleBlur("addressFiles");
                      addressInputRef.current?.click();
                    }}
                    className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white px-4 py-5 text-center transition dark:bg-[#0c1827] ${
                      touched.addressFiles && addressFiles.length === 0
                        ? "border-red-500 bg-red-500/5 dark:border-red-500 dark:bg-red-500/5"
                        : "border-black/20 hover:border-[#2f6b4f] hover:bg-[#f5f2ea]/50 dark:border-white/20 dark:hover:border-[#8bc6ff] dark:hover:bg-[#11243a]"
                    }`}
                  >
                    <svg
                      className="size-8 text-[#2f6b4f] dark:text-[#8bc6ff]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <span className="mt-2 text-sm font-semibold text-[#101410] dark:text-[#f3f7fb]">
                      Choose Files or Drop Here
                    </span>
                    <span className="mt-1 text-xs text-[#4e574b] dark:text-[#a8bfd7]">
                      Select multiple proof of address files
                    </span>
                  </button>

                  {touched.addressFiles && addressFiles.length === 0 && (
                    <p className="mt-2 text-xs italic text-red-500 dark:text-red-400">
                      This field is mandatory (upload at least 1 address document)
                    </p>
                  )}

                  {/* Uploaded File List */}
                  {addressFiles.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {addressFiles.map((file, index) => (
                        <li
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between rounded-lg border border-black/10 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-[#0c1827]"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <svg
                              className="size-4 shrink-0 text-[#2f6b4f] dark:text-[#8bc6ff]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                              />
                            </svg>
                            <span className="truncate font-medium text-[#101410] dark:text-[#f3f7fb]">
                              {file.name}
                            </span>
                            <span className="shrink-0 text-[#71717a] dark:text-[#a8bfd7]">
                              ({formatBytes(file.size)})
                            </span>
                          </div>
                          <button
                            suppressHydrationWarning
                            type="button"
                            onClick={() => removeAddressFile(index)}
                            className="ml-2 rounded-full p-1 text-red-500 hover:bg-red-500/10 dark:text-red-400"
                            aria-label={`Remove ${file.name}`}
                            title="Remove file"
                          >
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Form Action & Validation Message */}
          <div className="flex flex-col gap-3">
            <button
              suppressHydrationWarning
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full rounded-full bg-[#101410] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#2d342d] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#eaf2fb] dark:text-[#07111f] dark:hover:bg-white dark:disabled:bg-[#1a2b42] dark:disabled:text-[#4a5c73] md:w-auto md:px-10"
            >
              {isSubmitting ? "Completing KYC..." : "Complete KYC"}
            </button>

            {!isFormValid && (
              <p className="text-xs font-medium text-[#71717a] dark:text-[#94a3b8]">
                ⚠️ Please fill in all required profile fields and upload both Proof of Identity & Proof of Address documents to submit.
              </p>
            )}
          </div>
        </form>
      </section>
    </main>
    </AuthGuard>
  );
}
