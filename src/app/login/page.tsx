"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Lock, Mail } from "lucide-react";
import { createClient } from "../lib/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    if (data.user?.id) {
      const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          username: data.user.user_metadata?.full_name || email,
        });

        if (profileError) {
          setErrorMessage(profileError.message);
        }
    }

    setSuccessMessage("Signed in successfully. Redirecting...");
    router.push("/dashboard");
  };

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      setErrorMessage("Enter your name to create an account.");
      return;
    }

    if (!email || !password) {
      setErrorMessage("Enter an email and password to create an account.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    if (data.user?.id) {
      const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          username: fullName.trim(),
        });

        if (profileError) {
          setErrorMessage(profileError.message);
        }
    }

    setSuccessMessage("Account created. Check your email to confirm.");
    setIsSubmitting(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    if (isSignUpMode) {
      event.preventDefault();
      await handleSignUp();
      return;
    }

    await handleSignIn(event);
  };

  return (
    <div className="min-h-screen text-slate-900">
      <div className="relative flex min-h-screen">
        <div className="hidden w-1/2 items-center justify-center glass-panel bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.2),transparent_55%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.2),transparent_60%)] px-12 lg:flex">
          <div className="max-w-md space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full glass-pill px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Money Mind
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900">A modern finance OS built for focus.</h1>
            <p className="text-base text-slate-600">
              Connect your data, monitor your cash flow, and get AI‑powered insights with a calm, beautiful interface.
            </p>
            <div className="rounded-2xl glass-soft p-4 text-sm text-slate-600">
              “Money Mind keeps me aware of every transaction without overwhelming me.”
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center px-6 py-16 lg:w-1/2">
          <div className="w-full max-w-md space-y-8 rounded-3xl glass-panel p-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                {isSignUpMode ? "Create your account" : "Welcome back"}
              </p>
              <h2 className="text-3xl font-semibold text-slate-900">
                {isSignUpMode ? "Sign up for Money Mind" : "Sign in to Money Mind"}
              </h2>
              <p className="text-sm text-slate-600">
                {isSignUpMode
                  ? "Use your email and password to get started."
                  : "Use your account credentials to continue."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {isSignUpMode ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Full name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/10 py-2.5 px-4 text-sm text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                    />
                  </div>
                </div>
              ) : null}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 input-field"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 input-field"
                  />
                </div>
              </div>

              {!isSignUpMode ? (
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded border-white/60 bg-white/70 text-emerald-500" />
                    Remember me
                  </label>
                  <button type="button" className="text-emerald-600 hover:text-emerald-500">
                    Forgot password?
                  </button>
                </div>
              ) : null}

              {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
              {successMessage ? <p className="text-sm text-emerald-300">{successMessage}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl py-2.5 text-sm font-semibold btn-primary disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? isSignUpMode
                    ? "Creating account..."
                    : "Signing in..."
                  : isSignUpMode
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>

            <div className="text-center text-sm text-slate-600">
              {isSignUpMode ? "Already have an account?" : "Don’t have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUpMode((prev) => !prev);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-semibold text-emerald-600 hover:text-emerald-500"
              >
                {isSignUpMode ? "Sign in" : "Create one"}
              </button>
            </div>

            <div className="text-center">
              <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600">
                Back to app
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
