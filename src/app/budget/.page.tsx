"use client";

import { useState } from "react";
import Sidebar from "../Components/sidebar";
import { Disclosure, DisclosureButton, DisclosurePanel, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'

const budgetCategories = [
  { id: 1, name: 'Groceries' },
  { id: 2, name: 'Transportation' },
  { id: 3, name: 'Entertainment' },
  { id: 4, name: 'Utilities' },
  { id: 5, name: 'Healthcare' },
  { id: 6, name: 'Shopping' },
  { id: 7, name: 'Dining Out' },
  { id: 8, name: 'Savings' },
]

export default function Example() {
    const [selected, setSelected] = useState(budgetCategories[0])
    const [amount, setAmount] = useState('')
    const [budgets, setBudgets] = useState<Array<{ id: string; category: string; amount: number }>>([])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selected && amount) {
            setBudgets([...budgets, { id: Date.now().toString(), category: selected.name, amount: parseFloat(amount) }])
            setAmount('')
            setSelected(budgetCategories[0])
        }
    }

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">Budget Management</h1>
                                <p className="text-gray-600 mt-1">Plan your spending and track your financial goals</p>
                            </div>
                            {totalBudget > 0 && (
                                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg">
                                    <p className="text-sm opacity-90">Total Budget</p>
                                    <p className="text-2xl font-bold">${totalBudget.toFixed(2)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Add Budget Section */}
                        <Disclosure>
                            {({ open }) => (
                                <>
                                    <DisclosureButton className="group bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-8 py-4 rounded-2xl hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                            <svg className={`w-5 h-5 transition-transform duration-300 ${open ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <span className="text-lg">Create New Budget</span>
                                    </DisclosureButton>
                                    <DisclosurePanel className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="max-w-3xl">
                                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <h2 className="text-2xl font-bold text-gray-900">Budget Details</h2>
                                                </div>
                                                <form className="space-y-6" onSubmit={handleSubmit}>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-3">Budget Category</label>
                                                        <Listbox value={selected} onChange={setSelected}>
                                                            <div className="relative">
                                                                <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-gradient-to-br from-gray-50 to-white py-4 pl-4 pr-12 text-left border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md">
                                                                    <span className="block truncate text-gray-900 font-medium text-lg">{selected.name}</span>
                                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                        <svg className="h-6 w-6 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </span>
                                                                </ListboxButton>
                                                                <ListboxOptions className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-2xl bg-white py-2 shadow-2xl border border-gray-200 ring-1 ring-black ring-opacity-5">
                                                                    {budgetCategories.map((category) => (
                                                                        <ListboxOption
                                                                            key={category.id}
                                                                            value={category}
                                                                            className="relative cursor-pointer select-none py-3 pl-12 pr-4 text-gray-900 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100/50 transition-all duration-150 mx-2 rounded-xl"
                                                                        >
                                                                            {({ selected }) => (
                                                                                <>
                                                                                    <span className={`block truncate ${selected ? 'font-bold text-emerald-700' : 'font-medium'}`}>
                                                                                        {category.name}
                                                                                    </span>
                                                                                    {selected && (
                                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-600">
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
                                                        <label htmlFor="budget-amount" className="block text-sm font-semibold text-gray-700 mb-3">Budget Amount</label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                <span className="text-gray-500 text-xl font-semibold">$</span>
                                                            </div>
                                                            <input 
                                                                type="number" 
                                                                id="budget-amount"
                                                                value={amount}
                                                                onChange={(e) => setAmount(e.target.value)}
                                                                className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-4 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md bg-gradient-to-br from-gray-50 to-white" 
                                                                placeholder="0.00"
                                                                step="0.01"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <button 
                                                        type="submit" 
                                                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-4 rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Save Budget
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </DisclosurePanel>
                                </>
                            )}
                        </Disclosure>

                        {/* Active Budgets Grid */}
                        {budgets.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                        </svg>
                                    </div>
                                    Active Budgets
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {budgets.map((budget) => (
                                        <div 
                                            key={budget.id} 
                                            className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                                                            <span className="text-white text-lg font-bold">{budget.category.charAt(0)}</span>
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 text-lg">{budget.category}</h4>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-3 mt-3">
                                                        <p className="text-emerald-900 text-2xl font-bold">${budget.amount.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setBudgets(budgets.filter(b => b.id !== budget.id))}
                                                className="mt-4 w-full text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all font-semibold border-2 border-red-200 hover:border-red-300 flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
