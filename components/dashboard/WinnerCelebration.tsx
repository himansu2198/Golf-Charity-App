"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { WinnerTier } from "@/types";

interface WinnerCelebrationProps {
  isWinner: boolean;
  winCount: number;
  latestWinId?: string;
  latestWinTier?: WinnerTier | null;
}

// ── sessionStorage key — clears on tab/browser close ──
// This means confetti fires on every NEW login session
// but NOT on page refresh within the same session
const SESSION_KEY = "celebratedWinId";

export default function WinnerCelebration({
  isWinner,
  winCount,
  latestWinId,
  latestWinTier,
}: WinnerCelebrationProps) {
  const hasFired = useRef<boolean>(false);

  useEffect(() => {
    // Guard 1 — must be a winner
    if (!isWinner || winCount === 0) return;

    // Guard 2 — must have a win ID
    if (!latestWinId) return;

    // Guard 3 — React strict mode double-fire guard
    if (hasFired.current) return;

    // Guard 4 — sessionStorage check
    // Fires on every login (new session) but not on refresh
    const alreadyCelebrated = sessionStorage.getItem(SESSION_KEY);
    if (alreadyCelebrated === latestWinId) {
      console.log("[WinnerCelebration] Already celebrated this session — skipping confetti");
      return;
    }

    // ── All guards passed — fire confetti ──
    hasFired.current = true;
    sessionStorage.setItem(SESSION_KEY, latestWinId);

    console.log("[WinnerCelebration] 🎉 Firing confetti for win:", latestWinId);

    const colors = ["#22c55e", "#16a34a", "#c9a84c", "#ffffff", "#86efac"];

    // Burst 1 — center explosion
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { x: 0.5, y: 0.55 },
      colors,
      startVelocity: 45,
      gravity: 0.9,
      scalar: 1.1,
      ticks: 200,
    });

    // Burst 2 — left cannon
    const leftTimer = setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
        startVelocity: 50,
        gravity: 0.85,
        scalar: 1.0,
      });
    }, 300);

    // Burst 3 — right cannon
    const rightTimer = setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
        startVelocity: 50,
        gravity: 0.85,
        scalar: 1.0,
      });
    }, 500);

    // Burst 4 — final shower
    const finalTimer = setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { x: 0.5, y: 0.6 },
        colors,
        startVelocity: 30,
        gravity: 1.2,
        scalar: 0.9,
        ticks: 150,
      });
    }, 900);

    return () => {
      clearTimeout(leftTimer);
      clearTimeout(rightTimer);
      clearTimeout(finalTimer);
    };
  }, [latestWinId, isWinner, winCount]);

  // Don't render if not a winner
  if (!isWinner || winCount === 0) return null;

  const tierName =
    latestWinTier === "tier_5" ? "Tier 5" :
    latestWinTier === "tier_4" ? "Tier 4" :
    latestWinTier === "tier_3" ? "Tier 3" : "";

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-green-500/10 via-yellow-400/10 to-green-500/10 border border-green-500/25 rounded-2xl px-6 py-5 mb-6">

      {/* Shimmer sweep */}
      <div
        className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
          animation: "shimmer 2.5s infinite",
        }}
      />

      <div className="relative flex items-center gap-4">

        {/* Pulsing trophy */}
        <div
          className="w-14 h-14 rounded-2xl bg-yellow-400/15 border border-yellow-400/25 flex items-center justify-center text-3xl shrink-0"
          style={{ animation: "scalePulse 1.5s ease-in-out infinite" }}
        >
          🏆
        </div>

        <div>
          <p
            className="text-lg font-bold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            🎉 Congratulations! You won{tierName ? ` ${tierName}` : ""}!
          </p>
          <p className="text-sm text-green-200/60 mt-0.5">
            You have{" "}
            <span className="text-green-400 font-semibold">{winCount}</span>{" "}
            prize win{winCount > 1 ? "s" : ""} on record. Well played! ⛳
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes scalePulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}