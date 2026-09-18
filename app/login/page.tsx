"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, Mail, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(urlError ? "Invalid credentials or session expired" : "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error || "Failed to sign in. Please verify your email and password.");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("SafePass123!");
    setError("");
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-navy-950 text-white shadow-md mb-3">
          <Shield className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-navy-950 tracking-tight">
          Sign in to LPGSafe BD
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Access your consumer, dealer, inspector, or administrative account
        </p>
      </div>

      {/* Quick Demo Accounts Selection */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
          One-Click Demo Accounts:
        </p>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => fillDemoAccount("consumer@example.com")}
            className="p-1.5 rounded-md bg-white border border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 text-left font-medium transition-all"
          >
            👤 Consumer
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("dealer@example.com")}
            className="p-1.5 rounded-md bg-white border border-slate-200 hover:border-blue-500 text-slate-700 hover:text-blue-700 text-left font-medium transition-all"
          >
            🏪 Dealer
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("inspector@example.com")}
            className="p-1.5 rounded-md bg-white border border-slate-200 hover:border-amber-500 text-slate-700 hover:text-amber-700 text-left font-medium transition-all"
          >
            🔍 Inspector
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("admin@example.com")}
            className="p-1.5 rounded-md bg-white border border-slate-200 hover:border-navy-950 text-slate-700 hover:text-navy-950 text-left font-medium transition-all"
          >
            🛡️ Admin
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="e.g. consumer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="w-full bg-navy-950 hover:bg-navy-900 text-white font-semibold mt-2"
        >
          Sign In Securely
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>

      <div className="text-center pt-2 text-xs text-slate-500">
        Don't have an account yet?{" "}
        <Link
          href="/register"
          className="font-bold text-emerald-600 hover:underline"
        >
          Register Here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading sign in form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
