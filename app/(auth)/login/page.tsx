"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import PasswordInput from "@/components/ui/PasswordInput";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail]       = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError]       = useState<string>("");
  const [loading, setLoading]   = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, role, error: signInError } = await signIn(email, password);

      if (signInError || !data) {
        setError(signInError?.message ?? "Login failed. Please try again.");
        return;
      }

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          Welcome back
        </h1>
        <p className="text-green-200/50 text-sm">Sign in to your account</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
        <form onSubmit={handleLogin} className="space-y-5">

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

          {/* Password with eye toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-green-200/70">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-green-400 hover:text-green-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              autoComplete="current-password"
              label=""
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
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-green-200/40">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-green-400 font-medium hover:text-green-300 transition-colors">
              Sign up free
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