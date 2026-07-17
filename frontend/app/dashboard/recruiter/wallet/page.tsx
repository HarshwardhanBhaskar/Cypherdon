"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Wallet, ArrowLeft, PlusCircle, CheckCircle, AlertCircle, 
  History, TrendingUp, Sparkles, Receipt, Database, Clock
} from "lucide-react";
import Navbar from "@/components/Navbar";

interface LedgerEntry {
  id: string;
  amount: number;
  description: string;
  createdAt: string;
}

export default function RecruiterWallet() {
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<LedgerEntry[]>([]);
  const [amountToAdd, setAmountToAdd] = useState("50");
  const [topUpMsg, setTopUpMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const TENANT_ID = "d3b07384-d113-4956-a5db-257b4457e5e3"; // Default Tenant
  const SPRING_API_BASE = "http://localhost:8080";

  const fetchWalletData = async () => {
    try {
      // Fetch balance
      const balanceRes = await fetch(`${SPRING_API_BASE}/api/wallet/balance`, {
        headers: { "X-Tenant-ID": TENANT_ID }
      });
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData.balance);
      }

      // Fetch transaction history
      const historyRes = await fetch(`${SPRING_API_BASE}/api/wallet/history`, {
        headers: { "X-Tenant-ID": TENANT_ID }
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
    } catch (err) {
      console.error("Error loading wallet details:", err);
      setError("Failed to reach Spring Boot wallet ledger service.");
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopUpMsg(null);
    setError(null);
    setLoading(true);

    const val = parseFloat(amountToAdd);
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid credit amount to add.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${SPRING_API_BASE}/api/wallet/add-credits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": TENANT_ID
        },
        body: JSON.stringify({
          amount: val,
          description: `Simulated Credit Purchase ($${val})`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.newBalance);
        setTopUpMsg(`Successfully purchased and credited ${val} tokens to your wallet!`);
        fetchWalletData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Simulated payment transaction failed.");
      }
    } catch (err) {
      setError("Failed to connect to billing server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute bottom-[20%] -left-[20%] w-[80%] h-[80%] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Navigation back */}
        <Link href="/dashboard/recruiter" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold mb-8 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Recruiter Dashboard
        </Link>

        {/* Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Main wallet stats */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900/70 to-purple-950/20 border border-slate-800 p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                  <Wallet className="w-3.5 h-3.5" /> B2B Digital Wallet
                </span>
                <span className="text-xs text-slate-500 font-mono">ID: {TENANT_ID}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-200">Available Platform Credits</h1>
              <span className="text-5xl font-black text-white tracking-tight mt-3 block flex items-baseline gap-2">
                {balance.toFixed(2)} <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">tokens</span>
              </span>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-400" /> Active Billing Plan</span>
              <span className="font-semibold text-slate-200">B2B Standard Enterprise</span>
            </div>
          </div>

          {/* Quick billing summary */}
          <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-purple-400" /> Usage Rates
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">AI Resume Vetting</span>
                <span className="font-bold text-white">1.00 credit</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Live Mock Vetting</span>
                <span className="font-bold text-white">5.00 credits</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Email Campaign Dispatch</span>
                <span className="font-bold text-white">0.50 credits</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
              All transactions are secured and backed by transaction double-entry ledger audits.
            </div>
          </div>

        </div>

        {/* Forms and history split */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Top-up Form */}
          <div className="md:col-span-1">
            <div className="bg-slate-900/30 backdrop-blur-lg border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-purple-400" /> Simulated Credit Purchase
              </h2>
              
              <form onSubmit={handleTopUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Token Pack</label>
                  <select 
                    value={amountToAdd} 
                    onChange={(e) => setAmountToAdd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200"
                  >
                    <option value="10">10 Credits ($10.00)</option>
                    <option value="50">50 Credits ($45.00) - 10% Off</option>
                    <option value="100">100 Credits ($80.00) - 20% Off</option>
                    <option value="500">500 Credits ($350.00) - 30% Off</option>
                  </select>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2.5 rounded-xl text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {topUpMsg && (
                  <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 rounded-xl text-xs">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{topUpMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/10 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Purchase Tokens"}
                </button>
              </form>
            </div>
          </div>

          {/* Transaction History Log */}
          <div className="md:col-span-2">
            <div className="bg-slate-900/30 backdrop-blur-lg border border-slate-800 p-8 rounded-3xl">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" /> Transaction Audit Ledger
              </h2>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-sm gap-1">
                    <Clock className="w-6 h-6 opacity-50" />
                    <span>No transactions recorded.</span>
                  </div>
                ) : (
                  history.map((entry) => {
                    const isCredit = entry.amount > 0;
                    return (
                      <div 
                        key={entry.id} 
                        className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex items-center justify-between hover:border-slate-800/80 transition-colors"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-slate-200">{entry.description}</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {new Date(entry.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <span className={`text-base font-extrabold ${isCredit ? "text-emerald-400" : "text-rose-400"}`}>
                          {isCredit ? "+" : ""}{entry.amount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
