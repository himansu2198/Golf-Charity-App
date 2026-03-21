"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState<string>("");
  const [loading, setLoading]   = useState<boolean>(false);
  const [sent, setSent]         = useState<boolean>(false);
  const [error, setError]       = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Email sent confirmation ──
  if (sent) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-3xl mx-auto mb-5">
            📧
          </div>
          <h2
            className="text-2xl font-bold text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Check your email
          </h2>
          <p className="text-green-200/50 text-sm leading-relaxed mb-2">
            We sent a password reset link to
          </p>
          <p className="text-green-400 font-medium text-sm mb-6">
            {email}
          </p>
          <p className="text-white/20 text-xs leading-relaxed mb-8">
            Click the link in your email to reset your password.
            The link expires in 1 hour. Check your spam folder if
            you don&apos;t see it.
          </p>
          <div className="pt-6 border-t border-white/10">
            <Link
              href="/login"
              className="text-sm text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">

      <div className="text-center mb-8">
        <Link href="/">
          <span className="text-3xl">⛳</span>
        </Link>
        <h1
          className="text-3xl font-bold text-white mt-3 mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Forgot password?
        </h1>
        <p className="text-green-200/50 text-sm">
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-green-200/70 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-green-200/40">
            Remember your password?{" "}
            <Link href="/login" className="text-green-400 font-medium hover:text-green-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center mt-6">
        <Link href="/" className="text-xs text-white/20 hover:text-white/40 transition-colors">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}