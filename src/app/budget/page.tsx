"use client";

import { useEffect, useState } from "react";
import Sidebar from "../Components/sidebar";
import RequireAuth from "../Components/require-auth";
import { Disclosure, DisclosureButton, DisclosurePanel, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { Sparkles } from "lucide-react";
import { createClient } from "../lib/client";
import { categoryOptions } from "../lib/categories";

const budgetCategories = categoryOptions.map((name, index) => ({
    id: index + 1,
    name,
}));

export default function Example() {
    const [selected, setSelected] = useState(budgetCategories[0])
    const [ammount, setAmmount] = useState('')
    const [budgets, setBudgets] = useState<Array<{ id: string; category: string; amount: number; }>>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editAmount, setEditAmount] = useState("")

    useEffect(() => {
        let isActive = true
        const supabase = createClient()

        const loadBudgets = async (userId: string) => {
            const { data, error } = await supabase
                .from('Budgets')
                .select('id,budget_name,budget_number')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (!isActive) return

            if (error) {
                console.error(error.message)
                setIsLoading(false)
                return
            }

            setBudgets(
                (data ?? []).map((budget) => ({
                    id: budget.id,
                    category: budget.budget_name,
                    amount: budget.budget_number,
                }))
            )
            setIsLoading(false)
        }

        const init = async () => {
            const { data } = await supabase.auth.getSession()
            const userId = data.session?.user?.id

            if (!userId) {
                setBudgets([])
                setIsLoading(false)
                return
            }

            await loadBudgets(userId)
        }

        init()

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
            const userId = session?.user?.id

            if (!userId) {
                setBudgets([])
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            loadBudgets(userId)
        })

        return () => {
            isActive = false
            subscription.subscription.unsubscribe()
        }
    }, [])

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault()

        if (!ammount) return

        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (!userId) {
            console.error("User not authenticated");
            return;
        }

        const { data, error } = await supabase
            .from('Budgets')
            .insert({ budget_name: selected.name, budget_number: Number(ammount), user_id: userId })
            .select('id,budget_name,budget_number')
            .single()

        if (error) {
            console.error(error.message)
            return
        }

        if (data) {
            setBudgets([{ id: data.id, category: data.budget_name, amount: data.budget_number }, ...budgets])
        }
        setAmmount('')
            
    }

    const handleDelete = async (id: string) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('Budgets')
            .delete()
            .eq('id', id)

        if (error) {
            console.error(error.message)
            return
        }

        setBudgets((prev) => prev.filter((budget) => budget.id !== id))
    }

    const handleStartEdit = (budgetId: string, amount: number) => {
        setEditingId(budgetId)
        setEditAmount(String(amount))
    }

    const handleSaveEdit = async (budgetId: string) => {
        const amountValue = Number(editAmount)

        if (!Number.isFinite(amountValue)) {
            return
        }

        const supabase = createClient();
        const { error } = await supabase
            .from('Budgets')
            .update({ budget_number: amountValue })
            .eq('id', budgetId)

        if (error) {
            console.error(error.message)
            return
        }

        setBudgets((prev) =>
            prev.map((budget) =>
                budget.id === budgetId ? { ...budget, amount: amountValue } : budget
            )
        )
        setEditingId(null)
        setEditAmount("")
    }

    

    return (
        <div className="flex min-h-screen">
            <RequireAuth />
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <header className="px-8 py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="relative overflow-hidden rounded-3xl glass-panel">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_60%)]" />
                            <div className="relative px-8 py-10 md:px-12 md:py-12">
                                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            <Sparkles size={14} />
                                            Budget planning
                                        </div>
                                        <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">Budgets</h1>
                                        <p className="mt-2 text-sm text-slate-600">Set clear monthly limits and keep spending on track.</p>
                                    </div>
                                    <Disclosure>
                                        {({ open }) => (
                                            <>
                                                <DisclosureButton className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800">
                                                    <span>{open ? "Close" : "Add"} budget</span>
                                                </DisclosureButton>
                                                <DisclosurePanel className="mt-6">
                                                    <div className="max-w-2xl">
                                                        <div className="rounded-3xl glass-panel p-6">
                                                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Create a new budget</h2>
                                                            <form className="space-y-4" onSubmit={handleSubmit}>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-slate-600 mb-2">Budget type</label>
                                                                    <Listbox value={selected} onChange={setSelected}>
                                                                        <div className="relative">
                                                                            <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-white py-2.5 pl-3 pr-10 text-left border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-slate-300 transition-colors">
                                                                                <span className="block truncate text-slate-900">{selected.name}</span>
                                                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                                    <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                                                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                </span>
                                                                            </ListboxButton>
                                                                            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-lg border border-slate-200">
                                                                                {budgetCategories.map((category) => (
                                                                                    <ListboxOption
                                                                                        key={category.id}
                                                                                        value={category}
                                                                                        className="relative cursor-pointer select-none py-2 pl-10 pr-4 text-slate-900 hover:bg-emerald-50 transition-colors"
                                                                                    >
                                                                                        {({ selected }) => (
                                                                                            <>
                                                                                                <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                                                                                    {category.name}
                                                                                                </span>
                                                                                                {selected && (
                                                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600">
                                                                                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                                                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                                                                                        </svg>
                                                                                                    </span>
                                                                                                )}
                                                                                            </>
                                                                                        )}
                                                                                    </ListboxOption>
                                                                                ))}
                                                                            </ListboxOptions>
                                                                        </div>
                                                                    </Listbox>
                                                                </div>
                                                                <div>
                                                                    <label htmlFor="budget-amount" className="block text-sm font-medium text-slate-600 mb-2">Amount</label>
                                                                    <input 
                                                                        value={ammount}
                                                                        onChange={(e) => setAmmount(e.target.value)}
                                                                        type="number" 
                                                                        id="budget-amount" 
                                                                        className="w-full rounded-xl px-3 py-2.5 input-field" 
                                                                        placeholder="e.g., 500"
                                                                        step="10"
                                                                    />
                                                                </div>
                                                                <button 
                                                                    type="submit"
                                                                    className="w-full px-4 py-2.5 rounded-xl font-medium btn-primary"
                                                                >
                                                                    Add budget
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </DisclosurePanel>
                                            </>
                                        )}
                                    </Disclosure>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="px-8 pb-12">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {[{
                                title: "Total budgeted",
                                value: `$${budgets.reduce((total, budget) => total + budget.amount, 0).toFixed(2)}`,
                                detail: `Across ${budgets.length} categories`,
                            }, {
                                title: "Largest allocation",
                                value: budgets.length
                                    ? `$${Math.max(...budgets.map((budget) => budget.amount)).toFixed(2)}`
                                    : "$0.00",
                                detail: budgets.length
                                    ? budgets.reduce((prev, budget) => budget.amount > prev.amount ? budget : prev).category
                                    : "No budgets yet",
                            }, {
                                title: "Remaining capacity",
                                value: "$0.00",
                                detail: "Track spending in dashboard",
                            }].map((item) => (
                                <div key={item.title} className="rounded-2xl glass-card p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.title}</p>
                                    <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
                                    <p className="mt-4 text-2xl font-semibold text-slate-900">{item.value}</p>
                                </div>
                            ))}
                        </section>

                        {!isLoading && budgets.length > 0 && (
                            <section className="rounded-3xl glass-panel p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Your budgets</h3>
                                        <p className="text-sm text-slate-500">Track allocations by category.</p>
                                    </div>
                                </div>
                                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {budgets.map((budget) => (
                                        <div key={budget.id} className="rounded-2xl glass-card px-4 py-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{budget.category}</p>
                                                <div className="flex items-center gap-2">
                                                    {editingId === budget.id ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSaveEdit(budget.id)}
                                                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                                                        >
                                                            Save
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStartEdit(budget.id, budget.amount)}
                                                            className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(budget.id)}
                                                        className="text-xs font-semibold text-rose-500 hover:text-rose-600 cursor-pointer"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                            {editingId === budget.id ? (
                                                <div className="mt-3">
                                                    <input
                                                        value={editAmount}
                                                        onChange={(e) => setEditAmount(e.target.value)}
                                                        type="number"
                                                        className="w-full rounded-xl px-3 py-2 text-sm input-field"
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-2xl font-semibold text-emerald-600 mt-3">${budget.amount.toFixed(2)}</p>
                                            )}
                                            <p className="mt-2 text-sm text-slate-500">Monthly cap</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
