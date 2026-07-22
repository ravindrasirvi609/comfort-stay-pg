"use client";

import React, { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, LogIn, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import AuthShell from "@/components/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading, login } = useAuth();
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const [userForm, setUserForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo = searchParams.get("redirect") || "";
  const safeRedirect =
    redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "";

  const getRoleRedirect = useCallback(
    (role: string) => {
      if (safeRedirect) return safeRedirect;
      if (role === "admin") return "/admin";
      if (role === "manager") return "/manager";
      return "/dashboard";
    },
    [safeRedirect]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && isAuthenticated) {
      router.push(getRoleRedirect(user?.role || "user"));
    }
  }, [mounted, loading, isAuthenticated, router, user, getRoleRedirect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    try {
      const response = await axios.post("/api/auth/user-login", userForm);
      if (response.data.success) {
        const u = response.data.user;
        login(u);
        router.push(getRoleRedirect(u.role));
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "An error occurred during login"
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setFormLoading(false);
    }
  };

  if (!mounted || loading) return null;
  if (isAuthenticated) return null;

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-pink-100/60 dark:border-pink-900/40 bg-white/85 dark:bg-pink-950/30 backdrop-blur-xl p-6 md:p-9 shadow-xl shadow-pink-500/10"
      >
        <div className="text-center mb-7">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30">
            <LogIn size={20} />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-1.5 text-sm text-gray-600 dark:text-pink-100/70">
            Sign in to your ComfortStay account
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

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
                value={userForm.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-pink-600 dark:text-pink-300 hover:text-pink-700 dark:hover:text-pink-200"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-500"
              />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className="pl-10 pr-10"
                placeholder="Enter your password"
                value={userForm.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-600 dark:hover:text-pink-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={formLoading}
            size="lg"
            className="w-full"
          >
            {formLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Signing in…
              </>
            ) : (
              <>
                Sign in <ArrowRight size={16} />
              </>
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
          <div className="flex-1 h-px bg-pink-100 dark:bg-pink-900/40" />
          <span className="uppercase tracking-widest">New here?</span>
          <div className="flex-1 h-px bg-pink-100 dark:bg-pink-900/40" />
        </div>

        <Link
          href="/register"
          className="flex items-center justify-center gap-2 w-full h-11 rounded-full border border-pink-200/70 dark:border-pink-800/60 bg-white/60 dark:bg-pink-950/20 backdrop-blur text-pink-700 dark:text-pink-200 font-semibold hover:bg-pink-50 dark:hover:bg-pink-900/30 transition-colors"
        >
          Create an account
        </Link>
      </motion.div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
