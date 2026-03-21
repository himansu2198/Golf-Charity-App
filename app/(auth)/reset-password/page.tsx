"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PasswordInput from "@/components/ui/PasswordInput";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword]         = useState<string>("");
  const [confirm, setConfirm]           = useState<string>("");
  const [loading, setLoading]           = useState<boolean>(false);
  const [success, setSuccess]           = useState<boolean>(false);
  const [error, setError]               = useState<string>("");
  const [sessionReady, setSessionReady] = useState<boolean>(false);

  // Supabase sends the user back with a session in the URL hash
  // We need to wait for it to be picked up
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setSessionReady(true);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──
  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-3xl mx-auto mb-5">
            ✅
          </div>
          <h2
            className="text-2xl font-bold text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Password updated!
          </h2>
          <p className="text-green-200/50 text-sm mb-6">
            Your password has been changed successfully.
            Redirecting you to login...
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-green-500 hover:bg-green-400 text-black font-bold text-sm px-6 py-3 rounded-xl transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Waiting for session from email link ──
  if (!sessionReady) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 backdrop-blur-sm">
          <div className="text-4xl animate-spin mb-4">⛳</div>
          <p className="text-green-200/50 text-sm">
            Verifying your reset link...
          </p>
          <p className="text-white/20 text-xs mt-3">
            If this takes too long,{" "}
            <Link href="/forgot-password" className="text-green-400 hover:text-green-300">
              request a new link
            </Link>
          </p>
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
          Reset password
        </h1>
        <p className="text-green-200/50 text-sm">
          Choose a strong new password.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
        <form onSubmit={handleReset} className="space-y-5">

          {/* New password with eye toggle */}
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            label="New Password"
          />

          {/* Confirm password with eye toggle */}
          <PasswordInput
            value={confirm}
            onChange={setConfirm}
            placeholder="Re-enter new password"
            autoComplete="new-password"
            label="Confirm Password"
          />

          {/* Password strength hints */}
          <div className="space-y-1.5">
            {[
              { label: "At least 6 characters", met: password.length >= 6 },
              { label: "Passwords match",        met: password === confirm && confirm.length > 0 },
            ].map((hint) => (
              <div key={hint.label} className="flex items-center gap-2 text-xs">
                <span className={hint.met ? "text-green-400" : "text-white/20"}>
                  {hint.met ? "✓" : "○"}
                </span>
                <span className={hint.met ? "text-green-400/70" : "text-white/20"}>
                  {hint.label}
                </span>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || password.length < 6 || password !== confirm}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>

      <p className="text-center mt-6">
        <Link href="/" className="text-xs text-white/20 hover:text-white/40 transition-colors">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}