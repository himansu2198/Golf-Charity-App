"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { getInitials, formatDate } from "@/lib/helpers";
import { getUserScores } from "@/services/scoreService";
import { getCharities } from "@/services/charityService";
import { getOrCreateProfile } from "@/services/userService";
import {
  getUserWinnings,
  getTierLabel,
  getTierColor,
} from "@/services/drawService";
import Navbar from "@/components/layout/Navbar";
import ScoreForm from "@/components/dashboard/ScoreForm";
import ScoreList from "@/components/dashboard/ScoreList";
import CharityList from "@/components/dashboard/CharityList";
import SubscriptionCard from "@/components/dashboard/SubscriptionCard";
import WinnerCelebration from "@/components/dashboard/WinnerCelebration";
import { User, Score, Charity, WinnerWithDraw, WinnerTier } from "@/types";

const menuItems: { icon: string; label: string; href: string }[] = [
  { icon: "🏠", label: "Dashboard",  href: "#top"      },
  { icon: "🏌️", label: "My Scores",  href: "#scores"   },
  { icon: "💚", label: "My Charity", href: "#charity"  },
  { icon: "🏆", label: "Winnings",   href: "#winnings" },
  { icon: "👤", label: "Account",    href: "#account"  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [authUser, setAuthUser] = useState<{
    id: string;
    email: string;
    fullName?: string;
  } | null>(null);

  const [profile, setProfile]             = useState<User | null>(null);
  const [scores, setScores]               = useState<Score[]>([]);
  const [charities, setCharities]         = useState<Charity[]>([]);
  const [winnings, setWinnings]           = useState<WinnerWithDraw[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState<string | undefined>(undefined);
  const [loading, setLoading]             = useState<boolean>(true);
  const [loadError, setLoadError]         = useState<string>("");

  const loadScores = useCallback(async (userId: string) => {
    const s = await getUserScores(userId);
    setScores(s);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session || !session.user) {
          router.push("/login");
          return;
        }

        const user = session.user;
        const email = user.email ?? "";
        const fullName =
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          "";

        setAuthUser({ id: user.id, email, fullName });

        const [prof, scoreList, charityList, wins] = await Promise.all([
          getOrCreateProfile(user.id, email, fullName),
          getUserScores(user.id),
          getCharities(),
          getUserWinnings(user.id),
        ]);

        setProfile(prof);
        setScores(scoreList ?? []);
        setCharities(charityList ?? []);
        setWinnings((wins ?? []) as WinnerWithDraw[]);
        setSelectedCharityId(prof?.selected_charity_id ?? undefined);
      } catch (err) {
        console.error("[Dashboard] Fatal error:", err);
        setLoadError("Something went wrong. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030f06] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-spin mb-4">⛳</div>
          <p className="text-green-200/40 text-sm tracking-wide">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (loadError) {
    return (
      <div className="min-h-screen bg-[#030f06] flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 text-sm mb-6">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-400 text-black font-bold text-sm px-6 py-3 rounded-xl transition-all"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!authUser) {
    router.push("/login");
    return null;
  }

  // ── Derived values ──
  const totalWins       = winnings.length;
  const isWinner        = totalWins > 0;
  const lastScore       = scores.length > 0 ? scores[0].score : null;
  const selectedCharity = charities.find((c) => c.id === selectedCharityId);
  const subscriptionStatus = profile?.subscription_status ?? "trial";

  const latestWin     = winnings.length > 0 ? winnings[0] : null;
  const latestWinId   = latestWin?.draw_id ?? undefined;
  const latestWinTier = (latestWin?.tier ?? null) as WinnerTier | null;

  const statCards: {
    icon: string;
    label: string;
    value: string;
    sub: string;
  }[] = [
    {
      icon: "🏌️",
      label: "Scores Entered",
      value: String(scores.length),
      sub: "of 5 max",
    },
    {
      icon: "🎯",
      label: "Last Score",
      value: lastScore !== null ? String(lastScore) : "—",
      sub: lastScore !== null ? "most recent" : "none yet",
    },
    {
      icon: "🏆",
      label: "Total Wins",
      value: String(totalWins),
      sub:
        totalWins > 0
          ? latestWinTier
            ? getTierLabel(latestWinTier)
            : "prize won"
          : "no wins yet",
    },
    {
      icon: "💚",
      label: "Supporting",
      value: selectedCharity ? "Active" : "None",
      sub: selectedCharity?.name ?? "pick a charity",
    },
  ];

  const accountInfo: { label: string; value: string }[] = [
    { label: "Full Name",    value: profile?.full_name || "—"                                    },
    { label: "Email",        value: authUser.email                                               },
    { label: "Member Since", value: profile?.created_at ? formatDate(profile.created_at) : "—" },
    { label: "Subscription", value: subscriptionStatus                                           },
  ];

  return (
    <div className="min-h-screen bg-[#030f06] text-white">

      <Navbar userEmail={authUser.email} />

      <div className="flex min-h-[calc(100vh-64px)]">

        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-white/10 bg-white/[0.02] px-3 py-6 gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-green-200/50 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto px-6 md:px-10 py-8 space-y-8">

            {/* ── Welcome ── */}
            <div
              id="top"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/25 text-green-400 flex items-center justify-center font-bold text-xl shrink-0">
                  {getInitials(profile?.full_name, authUser.email)}
                </div>
                <div>
                  <h1
                    className="text-2xl md:text-3xl font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Welcome back,{" "}
                    {profile?.full_name?.split(" ")[0] ||
                      authUser.fullName?.split(" ")[0] ||
                      "Golfer"}
                  </h1>
                  <p className="text-sm text-green-200/35 mt-0.5">
                    {authUser.email}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <SubscriptionCard status={subscriptionStatus} />
              </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/[0.07] transition-colors duration-200"
                >
                  <span className="text-2xl">{stat.icon}</span>
                  <div>
                    <p
                      className="text-2xl font-bold text-white"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs text-green-200/40 mt-0.5">
                      {stat.label}
                    </p>
                    <p className="text-xs text-green-400/60 mt-0.5 truncate">
                      {stat.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Scores + Charity grid ── */}
            <div className="grid md:grid-cols-2 gap-6 items-start">

              {/* Scores */}
              <section
                id="scores"
                className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5"
              >
                <div>
                  <h2
                    className="text-lg font-semibold text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    My Scores
                  </h2>
                  <p className="text-xs text-green-200/35 mt-1">
                    Enter scores between 1–45. We keep your latest 5.
                  </p>
                </div>
                <ScoreForm
                  userId={authUser.id}
                  onScoreAdded={() => loadScores(authUser.id)}
                />
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs font-semibold text-green-200/40 uppercase tracking-widest mb-3">
                    History
                  </p>
                  <ScoreList scores={scores} />
                </div>
              </section>

              {/* ── Charity — no flex-col, shrinks to content ── */}
              <section
                id="charity"
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div className="mb-4">
                  <h2
                    className="text-lg font-semibold text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    My Charity
                  </h2>
                  <p className="text-xs text-green-200/35 mt-1">
                    Choose the cause you want to support.
                  </p>
                </div>

                {charities.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-3xl mb-3">💚</p>
                    <p className="text-sm text-green-200/30">
                      No charities found.
                    </p>
                  </div>
                ) : (
                  <CharityList
                    charities={charities}
                    userId={authUser.id}
                    selectedCharityId={selectedCharityId}
                    onSelect={(id: string) => setSelectedCharityId(id)}
                  />
                )}
              </section>
            </div>

            {/* ── Winnings ── */}
            <section
              id="winnings"
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2
                    className="text-lg font-semibold text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    My Winnings
                  </h2>
                  <p className="text-xs text-green-200/35 mt-1">
                    Draws where your scores matched.
                  </p>
                </div>
                {isWinner && (
                  <span className="text-xs bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-3 py-1.5 rounded-full font-semibold">
                    {totalWins} win{totalWins > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <WinnerCelebration
                isWinner={isWinner}
                winCount={totalWins}
                latestWinId={latestWinId}
                latestWinTier={latestWinTier}
              />

              {winnings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-3xl mb-4">
                    🏆
                  </div>
                  <p className="text-white/60 font-medium text-sm mb-1">
                    No wins yet
                  </p>
                  <p className="text-white/25 text-xs max-w-xs leading-relaxed">
                    Keep entering scores. When the drawn numbers match 3+
                    of your scores you&apos;ll win a prize.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {winnings.map((w) => {
                    const tier = (w.tier ?? "tier_1") as WinnerTier;
                    return (
                      <div
                        key={w.id}
                        className="flex items-center justify-between bg-yellow-400/5 border border-yellow-400/15 rounded-xl px-5 py-4 hover:bg-yellow-400/10 transition-all duration-200 hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-lg shrink-0">
                            🏆
                          </div>
                          <div>
                            <div className="flex items-center gap-1 flex-wrap mb-1">
                              <span className="text-xs text-white/30 mr-1">
                                Drawn:
                              </span>
                              {(w.draws?.drawn_numbers ?? []).map((n, i) => (
                                <span
                                  key={i}
                                  className="w-6 h-6 rounded bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold"
                                >
                                  {n}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-yellow-300">
                              {w.matched_count} match
                              {w.matched_count > 1 ? "es" : ""}
                            </p>
                            <p className="text-xs text-white/30 mt-0.5">
                              {w.draws?.created_at
                                ? formatDate(w.draws.created_at)
                                : formatDate(w.created_at)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold border ${getTierColor(tier)}`}
                        >
                          {getTierLabel(tier)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Account info ── */}
            <section
              id="account"
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2
                className="text-lg font-semibold text-white mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Account Info
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {accountInfo.map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-green-200/30 uppercase tracking-widest mb-2">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium text-white truncate">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}