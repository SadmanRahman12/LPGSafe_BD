"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-navy-950 text-white shadow-md mb-2">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-navy-950 tracking-tight">
            Reset Password
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Enter your verified registered email address to receive reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-emerald-950">Recovery Link Sent</h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              If an account with <strong>{email}</strong> exists, password reset instructions have been dispatched. For development demo accounts, the default password is <strong>SafePass123!</strong>.
            </p>
            <Link href="/login" className="inline-block pt-2">
              <Button size="sm" variant="outline" className="border-emerald-300">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Registered Email"
              placeholder="e.g. consumer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full bg-navy-950 hover:bg-navy-900 text-white font-semibold"
            >
              Send Password Reset Email
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-950"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
