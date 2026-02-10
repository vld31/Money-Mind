"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CreditCard, House, LayoutDashboard, Brain, User, ChevronRight, Wallet } from "lucide-react";
import { createClient } from "../lib/client";
import ThemeToggle from "./theme-toggle";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [displayName, setDisplayName] = useState("Guest");
    const [displayEmail, setDisplayEmail] = useState("");
    const isActive = (href: string) => pathname === href;

    useEffect(() => {
        const supabase = createClient();

        const loadUser = async () => {
            const { data } = await supabase.auth.getUser();
            const user = data.user;

            if (!user) {
                setDisplayName("Guest");
                setDisplayEmail("");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", user.id)
                .single();

            const nameFromProfile = profile?.username as string | undefined;
            const nameFromMetadata = user?.user_metadata?.full_name as string | undefined;

            setDisplayName(nameFromProfile?.trim() || nameFromMetadata?.trim() || user.email || "Guest");
            setDisplayEmail(user.email ?? "");
        };

        loadUser();

        const { data: subscription } = supabase.auth.onAuthStateChange(() => {
            loadUser();
        });

        return () => {
            subscription.subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.replace("/login");
    };

    return (
        <div className="w-72 shrink-0">
            <aside className="fixed left-4 top-4 w-72 glass-sidebar rounded-3xl flex flex-col h-[calc(100vh-2rem)]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/60">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 glass-icon glass-icon-glow rounded-xl flex items-center justify-center">
                            <Wallet size={18} className="text-slate-700" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-ink dark:text-slate-100 drop-shadow-sm">Money Mind</h2>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Smart finance OS</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 px-4 py-6 overflow-y-auto">
                    <nav className="space-y-6">
                        <div>
                            <p className="px-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Overview</p>
                            <div className="mt-3 space-y-1">
                                <Link
                                    href="/"
                                    className={`w-full flex items-center justify-between group px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                        isActive("/") ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <House size={20} className={`${isActive("/") ? "text-emerald-600" : "text-gray-500 group-hover:text-emerald-600"} transition-colors`}/>
                                        <span className="text-sm font-medium">Home</span>
                                    </div>
                                </Link>

                                <Link
                                    href="/dashboard"
                                    className={`w-full flex items-center justify-between group px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                        isActive("/dashboard") ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <LayoutDashboard size={20} className={`${isActive("/dashboard") ? "text-emerald-600" : "text-gray-500 group-hover:text-emerald-600"} transition-colors`}/>
                                        <span className="text-sm font-medium">Dashboard</span>
                                    </div>
                                </Link>

                                <Link
                                    href="/transactions"
                                    className={`w-full flex items-center justify-between group px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                        isActive("/transactions") ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <CreditCard size={20} className={`${isActive("/transactions") ? "text-emerald-600" : "text-gray-500 group-hover:text-emerald-600"} transition-colors`}/>
                                        <span className="text-sm font-medium">Transactions</span>
                                    </div>
                                </Link>

                                <Link
                                    href="/budget"
                                    className={`w-full flex items-center justify-between group px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                        isActive("/budget") ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Wallet size={20} className={`${isActive("/budget") ? "text-emerald-600" : "text-gray-500 group-hover:text-emerald-600"} transition-colors`}/>
                                        <span className="text-sm font-medium">Budgets</span>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div>
                            <p className="px-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Intelligence</p>
                            <div className="mt-3 space-y-1">
                                <Link
                                    href="/advisor"
                                    className={`w-full flex items-center justify-between group px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                        isActive("/advisor") ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Brain size={20} className={`${isActive("/advisor") ? "text-emerald-600" : "text-gray-500 group-hover:text-emerald-600"} transition-colors`} />
                                        <span className="text-sm font-medium">AI Advisor</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </nav>
                </div>

                {/* Profile Section */}
                <div className="px-4 py-4 border-t border-white/60 space-y-3">
                    <Link href="/login" className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer group">
                        <div className="relative">
                            <div className="w-10 h-10 glass-icon glass-icon-glow rounded-full flex items-center justify-center">
                                <User size={18} className="text-slate-700" strokeWidth={2.5} />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                            <p className="text-sm font-semibold text-ink dark:text-slate-100 truncate drop-shadow-sm">{displayName}</p>
                            {displayEmail ? <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{displayEmail}</p> : null}
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </Link>

                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full rounded-xl px-4 py-2 text-sm font-semibold btn-secondary"
                    >
                        Sign out
                    </button>

                    <ThemeToggle />
                </div>
            </aside>
        </div>
    );
}