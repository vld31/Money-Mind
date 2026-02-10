"use client";

import Sidebar from "../Components/sidebar";
import RequireAuth from "../Components/require-auth";
import { DollarSign, Calendar, Tag, Plus, Search, Filter, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/client";
import { categoryOptions } from "../lib/categories";

export default function Transactions() {
    const [isAddingTransaction, setIsAddingTransaction] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        notes: "",
    });
    const [transactions, setTransactions] = useState<Array<{
        id: string;
        title: string;
        category: string;
        amount: number;
        date: string;
        type: "expense" | "income";
    }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    const categories = categoryOptions;

    useEffect(() => {
        let isActive = true;
        const supabase = createClient();

        const loadTransactions = async (userId: string) => {
            const { data, error } = await supabase
                .from("Transactions")
                .select("id,title,category,amount,type,date")
                .eq("user_id", userId)
                .order("date", { ascending: false })
                .order("created_at", { ascending: false });

            if (!isActive) return;

            if (error) {
                console.error(error.message);
                setIsLoading(false);
                return;
            }

            setTransactions(
                (data ?? []).map((row) => ({
                    id: row.id,
                    title: row.title,
                    category: row.category,
                    amount: row.amount,
                    date: row.date,
                    type: row.type,
                }))
            );
            setIsLoading(false);
        };

        const init = async () => {
            const { data } = await supabase.auth.getSession();
            const userId = data.session?.user?.id;

            if (!userId) {
                setTransactions([]);
                setIsLoading(false);
                return;
            }

            await loadTransactions(userId);
        };

        init();

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
            const userId = session?.user?.id;

            if (!userId) {
                setTransactions([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            loadTransactions(userId);
        });

        return () => {
            isActive = false;
            subscription.subscription.unsubscribe();
        };
    }, []);

    const filteredTransactions = useMemo(() => {
        return transactions;
    }, [transactions]);

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (!userId) {
            console.error("User not authenticated");
            return;
        }

        const amountValue = Number(formData.amount);
        const normalizedAmount = Number.isFinite(amountValue) ? amountValue : 0;

        const { data, error } = await supabase
            .from("Transactions")
            .insert({
                user_id: userId,
                title: formData.title,
                category: formData.category,
                amount: normalizedAmount,
                type: formData.type,
                notes: formData.notes,
                date: formData.date,
            })
            .select("id,title,category,amount,type,date")
            .single();

        if (error) {
            console.error(error.message);
            return;
        }

        if (data) {
            setTransactions((prev) => [
                {
                    id: data.id,
                    title: data.title,
                    category: data.category,
                    amount: data.amount,
                    date: data.date,
                    type: data.type,
                },
                ...prev,
            ]);
        }

        setIsAddingTransaction(false);
        setFormData({
            title: "",
            amount: "",
            category: "",
            date: new Date().toISOString().split("T")[0],
            type: "expense",
            notes: "",
        });
    };

    return (
        <div className="flex min-h-screen">
            <RequireAuth />
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <header className="px-8 py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="relative overflow-hidden rounded-3xl glass-panel">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_60%)]" />
                            <div className="relative px-8 py-10 md:px-12 md:py-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        <Sparkles size={14} />
                                        Live activity
                                    </div>
                                    <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">Transactions</h1>
                                    <p className="mt-2 text-sm text-slate-600">Manage, search, and add every transaction in one calm workspace.</p>
                                </div>
                                <button
                                    onClick={() => setIsAddingTransaction(true)}
                                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold btn-primary"
                                >
                                    <Plus size={18} />
                                    Add Transaction
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="px-8 pb-12">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {isAddingTransaction && (
                            <div className="rounded-3xl glass-panel p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4">Add new transaction</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-2">Type</label>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({...formData, type: "expense"})}
                                                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 border ${
                                                        formData.type === "expense"
                                                            ? "bg-rose-50 text-rose-700 border-rose-200"
                                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    Expense
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({...formData, type: "income"})}
                                                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 border ${
                                                        formData.type === "income"
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    Income
                                                </button>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-2">Amount</label>
                                            <div className="relative">
                                                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl input-field"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-2">Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-xl input-field"
                                                placeholder="e.g., Grocery Shopping"
                                            />
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-2">Category</label>
                                            <div className="relative">
                                                <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                <select
                                                    required
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl select-field focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                                                >
                                                    <option value="">Select category</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-2">Date</label>
                                            <div className="relative">
                                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl input-field"
                                                />
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-600 mb-2">Notes (Optional)</label>
                                            <textarea
                                                value={formData.notes}
                                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                                rows={3}
                                                className="w-full px-4 py-2.5 rounded-xl input-field resize-none"
                                                placeholder="Add any additional details..."
                                            />
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex gap-3 justify-end pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingTransaction(false)}
                                            className="px-6 py-2.5 rounded-xl font-medium btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 rounded-xl font-medium btn-primary"
                                        >
                                            Add Transaction
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Filters */}
                        <div className="rounded-3xl glass-panel p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                                <div className="flex-1 relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search transactions..."
                                                     className="w-full pl-10 pr-4 py-2.5 rounded-xl input-field"
                                    />
                                </div>
                                <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl btn-secondary">
                                    <Filter size={18} />
                                    Filter
                                </button>
                            </div>
                        </div>

                        {/* Transactions List */}
                        <div className="rounded-3xl glass-panel overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/60">
                                <h2 className="text-lg font-semibold text-slate-900">All transactions</h2>
                                <p className="text-sm text-slate-500">Sorted by most recent activity.</p>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {transactions.map((transaction) => (
                                    <div key={transaction.id} className="px-6 py-4 hover:bg-slate-50/60 transition-colors duration-150">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                 <div className="w-12 h-12 rounded-xl flex items-center justify-center glass-icon glass-icon-glow">
                                                     <DollarSign size={24} className="text-slate-700" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{transaction.title}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                        <span>{transaction.category}</span>
                                                        <span>•</span>
                                                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-bold ${
                                                    transaction.type === "income" ? "text-emerald-600" : "text-rose-600"
                                                }`}>
                                                    {transaction.type === "income" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
