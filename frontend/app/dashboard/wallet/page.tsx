"use client";

import React, { useState, useEffect } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, TextInput, Label, Select, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Badge, Card } from "flowbite-react";
import { Wallet, PlusCircle, ArrowUpRight, ShieldCheck, CreditCard, Building2, Smartphone, CheckCircle2, History, DollarSign } from "lucide-react";

export interface WalletTransaction {
  id: string;
  type: "deposit";
  amount: number;
  payment_method: string;
  timestamp: string;
  status: "Completed" | "Pending";
}

const DEFAULT_TRANSACTIONS: WalletTransaction[] = [
  { id: "TXN-98421", type: "deposit", amount: 5000, payment_method: "Bank Transfer (Chase)", timestamp: "2026-07-23 14:20", status: "Completed" },
  { id: "TXN-87210", type: "deposit", amount: 2500, payment_method: "Debit Card (**** 4092)", timestamp: "2026-07-20 09:15", status: "Completed" },
  { id: "TXN-61049", type: "deposit", amount: 1000, payment_method: "Instant Wire Transfer", timestamp: "2026-07-15 16:45", status: "Completed" },
];

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(12450);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(DEFAULT_TRANSACTIONS);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  
  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");
  const [depositSuccess, setDepositSuccess] = useState<boolean>(false);

  // Sync with Backend API & LocalStorage
  const fetchWallet = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/wallet/balance");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        localStorage.setItem("investpro_wallet_balance", data.balance.toString());
        window.dispatchEvent(new Event("walletUpdated"));
      }
    } catch (err) {
      console.error("Failed to fetch backend wallet balance", err);
      const savedBalance = localStorage.getItem("investpro_wallet_balance");
      if (savedBalance) setBalance(Number(savedBalance));
    }
  };

  useEffect(() => {
    fetchWallet();
    const savedTxns = localStorage.getItem("investpro_wallet_txns");
    if (savedTxns) setTransactions(JSON.parse(savedTxns));
  }, []);

  const saveState = (newBalance: number, newTxns: WalletTransaction[]) => {
    setBalance(newBalance);
    setTransactions(newTxns);
    localStorage.setItem("investpro_wallet_balance", newBalance.toString());
    localStorage.setItem("investpro_wallet_txns", JSON.stringify(newTxns));
    window.dispatchEvent(new Event("walletUpdated"));
  };

  const handleOpenModal = () => {
    setDepositSuccess(false);
    setModalOpen(true);
  };

  const handleConfirmDeposit = async () => {
    if (!depositAmount || depositAmount <= 0) return;

    try {
      const res = await fetch("http://localhost:8000/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: depositAmount }),
      });

      if (res.ok) {
        const data = await res.json();
        const newTxn: WalletTransaction = {
          id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          type: "deposit",
          amount: depositAmount,
          payment_method: paymentMethod === "bank_transfer" ? "Bank Wire Transfer" : (paymentMethod === "debit_card" ? "Visa Debit Card" : "UPI / Direct Pay"),
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          status: "Completed"
        };
        const updatedTxns = [newTxn, ...transactions];
        saveState(data.balance, updatedTxns);
        setDepositSuccess(true);
        return;
      }
    } catch (err) {
      console.error("Backend deposit failed, falling back to local state", err);
    }

    // Fallback if offline
    const newTxn: WalletTransaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      type: "deposit",
      amount: depositAmount,
      payment_method: paymentMethod === "bank_transfer" ? "Bank Wire Transfer" : (paymentMethod === "debit_card" ? "Visa Debit Card" : "UPI / Direct Pay"),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "Completed"
    };
    const updatedBalance = balance + depositAmount;
    const updatedTxns = [newTxn, ...transactions];
    saveState(updatedBalance, updatedTxns);
    setDepositSuccess(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#101410] dark:text-[#f6f3ea]">InvestPro Digital Wallet</h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#5c6457] dark:text-[#b4ad9f]">
          Manage your cash reserves, deposit funds instantly, and review transaction history.
        </p>
      </div>

      {/* Main Balance Hero Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-3xl border border-black/10 bg-gradient-to-br from-[#2f6b4f]/15 via-[#2f6b4f]/5 to-transparent p-8 backdrop-blur-md dark:border-white/10 dark:from-[#a7d48f]/15 dark:via-[#a7d48f]/5 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2f6b4f] dark:text-[#a7d48f] flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Available Cash Balance
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">
                  €{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-sm font-semibold text-gray-500">EUR</span>
              </div>
            </div>
            <Badge color="success" className="px-3 py-1 font-bold text-xs uppercase rounded-full">
              Active Account
            </Badge>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-black/10 dark:border-white/10">
            <Button
              size="lg"
              onClick={handleOpenModal}
              className="bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a] font-bold shadow-lg rounded-full px-6"
            >
              <PlusCircle className="w-5 h-5 mr-2" /> Deposit / Add Funds
            </Button>
          </div>
        </div>

        {/* Security Summary Box */}
        <div className="rounded-3xl border border-black/10 bg-white/60 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
              <ShieldCheck className="w-4 h-4" /> Bank-Grade Encryption
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Instant Funds Availability</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Deposits added to your InvestPro wallet are credited immediately. You can use these funds to purchase Mutual Funds, Stocks, and ETFs seamlessly.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs space-y-1.5">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Daily Deposit Limit:</span>
              <span className="font-bold text-gray-900 dark:text-white">€50,000.00</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Processing Fee:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">€0.00 (Free)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#2f6b4f] dark:text-[#a7d48f]" />
          <h2 className="text-xl font-bold text-[#101410] dark:text-[#f6f3ea]">
            Deposit Transaction History
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white/60 backdrop-blur-sm dark:border-white/10 dark:bg-[#121614]/80">
          <Table hoverable className="w-full text-left">
            <TableHead className="bg-[#f8f5ea] dark:bg-[#1a201c] text-[#5c6457] dark:text-[#a7c1b1]">
              <TableRow>
                <TableHeadCell>Transaction ID</TableHeadCell>
                <TableHeadCell>Type</TableHeadCell>
                <TableHeadCell>Payment Method</TableHeadCell>
                <TableHeadCell>Date & Time</TableHeadCell>
                <TableHeadCell>Amount</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-black/5 dark:divide-white/5">
              {transactions.map((txn) => (
                <TableRow key={txn.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                    {txn.id}
                  </TableCell>
                  <TableCell>
                    <Badge color="success" className="w-fit font-bold uppercase text-[10px]">
                      Deposit
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                    {txn.payment_method}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {txn.timestamp}
                  </TableCell>
                  <TableCell className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    +€{txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge color="success">{txn.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Deposit Money Modal */}
      <Modal show={modalOpen} onClose={() => setModalOpen(false)} size="md">
        <ModalHeader className="border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#2f6b4f] dark:text-[#a7d48f]" />
            <span className="font-bold text-gray-900 dark:text-white">Add Money to Wallet</span>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-5">
          {depositSuccess ? (
            <div className="py-6 text-center space-y-4 animate-in zoom-in duration-300">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                Funds Added Successfully!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">${depositAmount.toLocaleString()}</span> has been credited to your InvestPro Wallet.
              </p>
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
                New Total Wallet Balance: <span className="font-bold text-gray-900 dark:text-white">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Preset Amount Buttons */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Enter Deposit Amount ($)
                </Label>
                <TextInput
                  id="amount"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                  required
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {[100, 500, 1000, 2500, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDepositAmount(preset)}
                      className={`px-3 py-1 rounded-md text-xs font-bold border transition-all ${
                        depositAmount === preset
                          ? "border-[#2f6b4f] bg-[#2f6b4f]/10 text-[#2f6b4f] dark:border-[#a7d48f] dark:bg-[#a7d48f]/20 dark:text-[#a7d48f]"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                      }`}
                    >
                      +${preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <Label htmlFor="payment" className="mb-2 block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Select Payment Source
                </Label>
                <Select
                  id="payment"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="bank_transfer">Chase Checking Account (**** 4892) - ACH Wire</option>
                  <option value="debit_card">Visa Debit Card (**** 4092) - Instant</option>
                  <option value="upi">UPI / Apple Pay Direct</option>
                </Select>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter className="border-t border-black/10 dark:border-white/10">
          {depositSuccess ? (
            <Button
              className="w-full bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a] font-bold"
              onClick={() => setModalOpen(false)}
            >
              Done
            </Button>
          ) : (
            <div className="flex w-full gap-3">
              <Button color="gray" className="w-1/2" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="w-1/2 bg-[#2f6b4f] hover:bg-[#255740] dark:bg-[#a7d48f] dark:text-[#090b0a] font-bold"
                onClick={handleConfirmDeposit}
              >
                Deposit Funds
              </Button>
            </div>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}
