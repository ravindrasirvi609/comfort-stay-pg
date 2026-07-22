"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Mail,
  Loader2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("/api/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      if (response.data?.success) {
        setSubmitted(true);
      } else {
        setError(response.data?.message || "Something went wrong. Try again.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "We couldn't process your request. Please try again."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell side="right">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-white/85 dark:bg-pink-950/30 backdrop-blur-xl p-6 md:p-9 shadow-xl shadow-pink-500/10"
      >
        {submitted ? (
          <div className="text-center">
            <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
              <CheckCircle2 size={26} />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Check your inbox
            </h2>
            <p className="text-sm text-gray-600 dark:text-pink-100/75 leading-relaxed max-w-sm mx-auto mb-6">
              If an account exists for{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {email}
              </span>
              , we&apos;ve sent your new login credentials by email. Please
              check your spam folder too.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/login" className="btn-primary justify-center">
                Go to Sign in <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                className="btn-secondary justify-center"
              >
                Use another email
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-7">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30">
                <KeyRound size={20} />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Forgot your password?
              </h2>
              <p className="mt-1.5 text-sm text-gray-600 dark:text-pink-100/70">
                Enter your email and we&apos;ll send you a fresh password.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2 rounded-xl border border-red-200/70 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-500"
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="pl-10"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending new password…
                  </>
                ) : (
                  <>
                    Send new password <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-pink-600 dark:text-pink-300 hover:text-pink-700 dark:hover:text-pink-200"
              >
                <ArrowLeft size={14} /> Back to Sign in
              </Link>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500 dark:text-pink-100/60 leading-relaxed">
              For your security, we&apos;ll generate a fresh, strong password
              and email it to you. You can change it any time after signing in.
            </p>
          </>
        )}
      </motion.div>
    </AuthShell>
  );
}
