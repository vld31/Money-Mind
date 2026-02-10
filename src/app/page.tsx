"use client";

import Sidebar from "./Components/sidebar";
import RequireAuth from "./Components/require-auth";
import Link from "next/link";
import { ArrowRight, ArrowDownRight, ArrowUpRight, BanknoteArrowDown, BanknoteArrowUp, LayoutDashboard, PiggyBank, Receipt, Scale, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "./lib/client";

export default function Home() {
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

    useEffect(() => {
        let isActive = true;
        const supabase = createClient();

        const loadHome = async (userId: string) => {
            const [{ data: txData, error: txError }, { data: budgetData, error: budgetError }] = await Promise.all([
                supabase
                    .from("Transactions")
                    .select("id,title,category,amount,type,date")
                    .eq("user_id", userId)
                    .order("date", { ascending: false })
                    .order("created_at", { ascending: false })
                    .limit(12),
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

            await loadHome(userId);
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
            loadHome(userId);
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
            { label: "Balance", value: `$${summary.balance.toFixed(2)}`, trend: summary.balance >= 0 ? "up" : "down", tone: "emerald", icon: Scale },
            { label: "Income", value: `$${summary.income.toFixed(2)}`, trend: "up", tone: "blue", icon: BanknoteArrowUp },
            { label: "Expenses", value: `$${summary.expenses.toFixed(2)}`, trend: "down", tone: "rose", icon: BanknoteArrowDown },
            { label: "Savings", value: `$${summary.savings.toFixed(2)}`, trend: summary.savings >= 0 ? "up" : "down", tone: "violet", icon: PiggyBank },
        ],
        [summary]
    );

    const highlights = useMemo(() => {
        const topCategory = transactions
            .filter((tx) => tx.type === "expense")
            .reduce<Record<string, number>>((acc, tx) => {
                acc[tx.category] = (acc[tx.category] ?? 0) + tx.amount;
                return acc;
            }, {});

        const topCategoryEntry = Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0];
        const topCategoryLabel = topCategoryEntry?.[0] ?? "No data yet";
        const topCategoryValue = topCategoryEntry ? `$${topCategoryEntry[1].toFixed(2)}` : "";

        const totalBudget = budgets.reduce((total, item) => total + item.amount, 0);
        const totalSpent = transactions.filter((tx) => tx.type === "expense").reduce((total, tx) => total + tx.amount, 0);
        const safeToSpend = totalBudget - totalSpent;

        return [
            { title: "Safe-to-spend", detail: "After budgets", value: `$${safeToSpend.toFixed(2)}`, tone: safeToSpend >= 0 ? "text-emerald-600" : "text-rose-600" },
            { title: "Top category", detail: topCategoryLabel, value: topCategoryValue, tone: "text-rose-600" },
            { title: "Budgets", detail: "Total set", value: `$${totalBudget.toFixed(2)}`, tone: "text-slate-900" },
        ];
    }, [budgets, transactions]);

    const quickActions = [
        {
            title: "Review Transactions",
            description: "Track every inflow and outflow instantly.",
            href: "/transactions",
            tone: "from-sky-500 to-cyan-500",
            icon: Receipt,
        },
        {
            title: "Open Dashboard",
            description: "Visualize trends with smart summaries.",
            href: "/dashboard",
            tone: "from-violet-500 to-fuchsia-500",
            icon: LayoutDashboard,
        },
    ];

    return (
        <div className="flex min-h-screen">
            <RequireAuth />
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <header className="px-8 py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="relative overflow-hidden rounded-3xl glass-panel">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_55%)]" />
                            <div className="relative px-8 py-10 md:px-12 md:py-12">
                                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            <Sparkles size={14} />
                                            Smart overview
                                        </div>
                                        <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">Welcome back.</h1>
                                        <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                            Your finances are trending in the right direction. Here’s the latest snapshot and the next best actions.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Link
                                            href="/transactions"
                                            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold btn-primary"
                                        >
                                            Review transactions
                                            <ArrowRight size={16} />
                                        </Link>
                                        <Link
                                            href="/advisor"
                                            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold btn-secondary"
                                        >
                                            Ask the advisor
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="px-8 pb-12">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <section className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">At a glance</p>
                                <h2 className="mt-2 text-xl font-semibold text-slate-900">Your financial command center</h2>
                            </div>
                            <div className="rounded-full glass-pill px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                                {isLoading ? "Syncing..." : "Synced just now"}
                            </div>
                        </section>

                        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {stats.map((stat) => {
                                const Icon = stat.icon;
                                const iconToneClass =
                                    stat.tone === "emerald"
                                        ? "text-emerald-600 dark:text-emerald-300"
                                        : stat.tone === "blue"
                                        ? "text-blue-600 dark:text-blue-300"
                                        : stat.tone === "rose"
                                        ? "text-rose-600 dark:text-rose-300"
                                        : "text-violet-600 dark:text-violet-300";

                                return (
                                    <div
                                        key={stat.label}
                                        className="rounded-2xl glass-card p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:shadow-[0_16px_45px_rgba(2,6,23,0.5)]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl glass-icon glass-icon-glow">
                                                <Icon size={22} className={iconToneClass} />
                                            </div>
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                                                    stat.trend === "down"
                                                        ? "bg-rose-50 text-rose-600"
                                                        : "bg-emerald-50 text-emerald-600"
                                                }`}
                                            >
                                                {stat.trend === "down" ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                                                {stat.trend === "down" ? "Down" : "Up"}
                                            </span>
                                        </div>
                                        <p className="mt-4 text-sm font-medium text-slate-500">{stat.label}</p>
                                        <p className="mt-1 text-2xl font-semibold text-slate-900">{stat.value}</p>
                                    </div>
                                );
                            })}
                        </section>

                        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {highlights.map((item) => (
                                <div key={item.title} className="rounded-2xl glass-card p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.title}</p>
                                    <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
                                    <p className={`mt-4 text-2xl font-semibold ${item.tone}`}>{item.value}</p>
                                </div>
                            ))}
                        </section>

                        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
                            <div className="rounded-3xl glass-panel p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">Cash flow insights</h2>
                                        <p className="mt-1 text-sm text-slate-500">Summaries driven by your recent activity.</p>
                                    </div>
                                    <div className="rounded-full bg-emerald-100/70 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        Updated 2h ago
                                    </div>
                                </div>
                                <div className="mt-6 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-2xl glass-panel p-4">
                                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Spending pace</p>
                                        <p className="mt-2 text-sm text-slate-800 dark:text-slate-300">You’re spending 8% less than last month.</p>
                                        <p className="mt-4 text-2xl font-semibold text-ink dark:text-slate-100">$1,240</p>
                                    </div>
                                    <div className="rounded-2xl glass-panel p-4">
                                        <p className="text-xs font-semibold text-sky-700 dark:text-sky-300">Income runway</p>
                                        <p className="mt-2 text-sm text-slate-800 dark:text-slate-300">3.2 months of expenses are covered.</p>
                                        <p className="mt-4 text-2xl font-semibold text-ink dark:text-slate-100">$15,820</p>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center gap-3 rounded-2xl glass-soft px-4 py-3 text-sm text-slate-600">
                                    <Sparkles size={16} className="text-emerald-500" />
                                    AI advisor recommends rebalancing your entertainment budget by 5%.
                                </div>
                            </div>

                            <div className="space-y-4">
                                {quickActions.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <Link
                                            key={action.title}
                                            href={action.href}
                                            className="group block rounded-3xl glass-card p-6 transition hover:-translate-y-0.5 hover:shadow-md"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-lg font-semibold text-slate-900">{action.title}</p>
                                                    <p className="mt-1 text-sm text-slate-500">{action.description}</p>
                                                </div>
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl glass-icon glass-icon-glow">
                                                    <Icon size={22} className="text-slate-700" />
                                                </div>
                                            </div>
                                            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                Open
                                                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="rounded-3xl glass-panel p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Recent transactions</h2>
                                    <p className="mt-1 text-sm text-slate-500">The latest entries from your activity stream.</p>
                                </div>
                                <Link href="/transactions" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                                    View all
                                </Link>
                            </div>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {transactions.slice(0, 4).map((item) => (
                                    <div key={item.id} className="flex items-center justify-between rounded-2xl glass-soft px-4 py-3">
                                        <span className="text-sm font-medium text-slate-700">{item.title}</span>
                                        <span className={`text-sm font-semibold ${item.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                                            {item.type === "income" ? "+" : "-"}${item.amount.toFixed(2)}
                                        </span>
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
