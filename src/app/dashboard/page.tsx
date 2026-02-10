"use client";

import Link from "next/link";
import Sidebar from "../Components/sidebar";
import RequireAuth from "../Components/require-auth";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, DollarSign, Sparkles, ArrowDownLeft, ArrowUpRight as ArrowUpRightCircle } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/client";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    title: string;
    category: string;
    amount: number;
    type: "expense" | "income";
    date: string;
  }>>([]);
  const [budgets, setBudgets] = useState<Array<{ category: string; amount: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    let isActive = true;
    const supabase = createClient();

    const loadDashboard = async (userId: string) => {
      const [{ data: txData, error: txError }, { data: budgetData, error: budgetError }] = await Promise.all([
        supabase
          .from("Transactions")
          .select("id,title,category,amount,type,date")
          .eq("user_id", userId)
          .order("date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("Budgets")
          .select("budget_name,budget_number")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      if (!isActive) return;

      if (txError) {
        console.error(txError.message);
      }

      if (budgetError) {
        console.error(budgetError.message);
      }

      setTransactions(
        (txData ?? []).map((row) => ({
          id: row.id,
          title: row.title,
          category: row.category,
          amount: row.amount,
          type: row.type,
          date: row.date,
        }))
      );

      setBudgets(
        (budgetData ?? []).map((row) => ({
          category: row.budget_name,
          amount: row.budget_number,
        }))
      );

      setIsLoading(false);
    };

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;

      if (!userId) {
        setTransactions([]);
        setBudgets([]);
        setIsLoading(false);
        return;
      }

      await loadDashboard(userId);
    };

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id;

      if (!userId) {
        setTransactions([]);
        setBudgets([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      loadDashboard(userId);
    });

    return () => {
      isActive = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const summary = useMemo(() => {
    const income = transactions
      .filter((tx) => tx.type === "income")
      .reduce((total, tx) => total + tx.amount, 0);
    const expenses = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((total, tx) => total + tx.amount, 0);
    const balance = income - expenses;
    const savings = Math.max(balance, 0);

    return { income, expenses, balance, savings };
  }, [transactions]);

  const stats = useMemo(
    () => [
      { label: "Total Balance", value: `$${summary.balance.toFixed(2)}`, change: "", trend: "up", icon: Wallet, color: "emerald" },
      { label: "Income", value: `$${summary.income.toFixed(2)}`, change: "", trend: "up", icon: ArrowUpRightCircle, color: "emerald" },
      { label: "Expenses", value: `$${summary.expenses.toFixed(2)}`, change: "", trend: "down", icon: ArrowDownLeft, color: "rose" },
      { label: "Savings", value: `$${summary.savings.toFixed(2)}`, change: "", trend: "up", icon: PiggyBank, color: "violet" },
    ],
    [summary]
  );

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5).map((tx) => ({
      id: tx.id,
      name: tx.title,
      category: tx.category,
      amount: tx.type === "income" ? tx.amount : -tx.amount,
      date: new Date(tx.date).toLocaleDateString(),
      time: "",
    }));
  }, [transactions]);

  const chartData = useMemo(() => {
    const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - (periodDays - 1));

    const byDate = new Map<string, number>();

    transactions.forEach((tx) => {
      const dateKey = tx.date;
      const txDate = new Date(tx.date);

      if (txDate < start || txDate > today) return;

      const delta = tx.type === "income" ? tx.amount : -tx.amount;
      byDate.set(dateKey, (byDate.get(dateKey) ?? 0) + delta);
    });

    const points = [] as Array<{ date: string; value: number; label: string }>; 
    const cursor = new Date(start);

    while (cursor <= today) {
      const key = cursor.toISOString().split("T")[0];
      points.push({
        date: key,
        value: byDate.get(key) ?? 0,
        label: cursor.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return points;
  }, [period, transactions]);

  const chartDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 0];
    const values = chartData.map((point) => point.value);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 0);
    return [min, max];
  }, [chartData]);

  return (
    <div className="flex min-h-screen">
      <RequireAuth />
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <header className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl glass-panel">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_60%)]" />
              <div className="relative px-8 py-10 md:px-12 md:py-12">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <Sparkles size={14} />
                      Smart insights
                    </div>
                    <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">Dashboard overview</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                      Track cash flow, budgets, and key trends in one calm, focused workspace.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href="/transactions"
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold btn-primary"
                    >
                      View transactions
                    </Link>
                    <Link
                      href="/budget"
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold btn-secondary"
                    >
                      Manage budgets
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-8 pb-12">
          <div className="max-w-7xl mx-auto space-y-8">
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const isPositive = stat.trend === "up";

                const toneClass =
                  stat.color === "emerald"
                    ? "text-emerald-600"
                    : stat.color === "rose"
                    ? "text-rose-600"
                    : "text-violet-600";

                return (
                  <div
                    key={index}
                    className="rounded-2xl glass-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl glass-icon glass-icon-glow">
                        <Icon size={22} className={toneClass} />
                      </div>
                      <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                        isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {stat.change}
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{stat.value}</p>
                  </div>
                );
              })}
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-3xl glass-panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Spending overview</h2>
                    <p className="mt-1 text-sm text-slate-500">Quick visual pulse of recent activity.</p>
                  </div>
                    <select
                      value={period}
                      onChange={(event) => setPeriod(event.target.value as "7d" | "30d" | "90d")}
                      className="text-xs rounded-full px-3 py-1.5 select-field focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 3 months</option>
                  </select>
                </div>
                <div className="mt-6 h-64 rounded-2xl glass-soft p-4">
                  {chartData.length === 0 ? (
                    <p className="text-slate-400 text-sm">No activity yet for this period.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} interval="preserveStartEnd" />
                        <YAxis domain={chartDomain} tick={{ fontSize: 11, fill: "#64748b" }} />
                        <Tooltip
                          formatter={(value: number) => [`$${value.toFixed(2)}`, "Net"]}
                          labelStyle={{ color: "#0f172a" }}
                          contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-3xl glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Budget status</h2>
                    <p className="mt-1 text-sm text-slate-500">Current month pacing.</p>
                  </div>
                  <Link href="/budget" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">See more</Link>
                </div>
                <div className="space-y-4">
                  {budgets.length === 0 && !isLoading ? (
                    <p className="text-sm text-slate-500">No budgets yet. Add one to track progress.</p>
                  ) : null}
                  {budgets.map((item, index) => {
                    const spent = transactions
                      .filter((tx) => tx.type === "expense" && tx.category === item.category)
                      .reduce((total, tx) => total + tx.amount, 0);
                    const remaining = item.amount - spent;
                    const percentage = item.amount > 0 ? (spent / item.amount) * 100 : 0;
                    const isOverBudget = percentage > 100;
                    const color = index % 4 === 0 ? "emerald" : index % 4 === 1 ? "blue" : index % 4 === 2 ? "red" : "purple";
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">{item.category}</span>
                          <span className="text-xs text-slate-500">${spent.toFixed(2)} / ${item.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                          <span>{remaining >= 0 ? "Remaining" : "Over by"}</span>
                          <span className={remaining >= 0 ? "text-emerald-600" : "text-rose-600"}>
                            ${Math.abs(remaining).toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isOverBudget ? "bg-rose-500" :
                              color === "emerald" ? "bg-emerald-500" :
                              color === "blue" ? "bg-blue-500" :
                              color === "purple" ? "bg-violet-500" : "bg-slate-500"
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="rounded-3xl glass-panel overflow-hidden">
              <div className="px-6 py-4 border-b border-white/60 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Recent transactions</h2>
                  <p className="text-sm text-slate-500">Latest activity across your accounts.</p>
                </div>
                <Link href="/transactions" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">View all</Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="px-6 py-4 hover:bg-slate-50/60 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center glass-icon glass-icon-glow ${
                          transaction.amount > 0 ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {transaction.amount > 0 ? (
                            <ArrowUpRightCircle size={18} className="text-emerald-600" />
                          ) : (
                            <ArrowDownLeft size={18} className="text-rose-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{transaction.name}</p>
                          <p className="text-xs text-slate-500">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          transaction.amount > 0 ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">{transaction.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
