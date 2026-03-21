"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSessionWithRole } from "@/lib/rbac";
import { getAllProfiles } from "@/services/userService";
import {
  runDraw,
  getDrawHistory,
  getAllWinners,
  getTierLabel,
  getTierColor,
  AllWinner,
} from "@/services/drawService";
import { signOut } from "@/lib/auth";
import { formatDate } from "@/lib/helpers";
import { User, Draw, EnrichedWinner } from "@/types";

const adminMenuItems: { icon: string; label: string; href: string }[] = [
  { icon: "📊", label: "Overview",    href: "#overview"     },
  { icon: "👥", label: "Users",       href: "#users"        },
  { icon: "🎲", label: "Run Draw",    href: "#draw"         },
  { icon: "📜", label: "History",     href: "#history"      },
  { icon: "🥇", label: "Winners",     href: "#winners"      },
  { icon: "🏅", label: "Leaderboard", href: "#leaderboard"  },
];

export default function AdminPage() {
  const router = useRouter();

  const [adminUser, setAdminUser] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [allWinners, setAllWinners] = useState<AllWinner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const [drawLoading, setDrawLoading] = useState<boolean>(false);
  const [drawError, setDrawError] = useState<string>("");
  const [lastDrawResult, setLastDrawResult] = useState<{
    drawnNumbers: number[];
    winners: EnrichedWinner[];
  } | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { userId, email, isAdmin } = await getSessionWithRole();

        if (!userId || !email) { router.push("/login"); return; }
        if (!isAdmin) { setAccessDenied(true); setLoading(false); return; }

        setAdminUser({ id: userId, email });

        const [userList, drawList, winnerList] = await Promise.all([
          getAllProfiles(),
          getDrawHistory(),
          getAllWinners(),
        ]);

        setUsers(userList);
        setDraws(drawList);
        setAllWinners(winnerList);
      } catch (err) {
        console.error("[Admin] Init error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleRunDraw = async () => {
    if (!adminUser) return;
    setDrawLoading(true);
    setDrawError("");
    setLastDrawResult(null);

    try {
      const { drawnNumbers, winners } = await runDraw(adminUser.id);
      setLastDrawResult({ drawnNumbers, winners });

      const [drawList, winnerList] = await Promise.all([
        getDrawHistory(),
        getAllWinners(),
      ]);
      setDraws(drawList);
      setAllWinners(winnerList);
    } catch (err: unknown) {
      setDrawError(err instanceof Error ? err.message : "Failed to run draw.");
    } finally {
      setDrawLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030f06] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-spin mb-4">⛳</div>
          <p className="text-green-200/40 text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // ── Access Denied ──
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#030f06] flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Access Denied
          </h2>
          <p className="text-green-200/40 text-sm mb-8">
            You do not have admin privileges.
          </p>
          <Link href="/dashboard"
            className="inline-flex items-center justify-center bg-green-500 hover:bg-green-400 text-black font-bold text-sm px-6 py-3 rounded-xl transition-all">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!adminUser) return null;

  // ── Derived stats for leaderboard + highlight card ──
  const totalWinners = allWinners.length;

  // Build leaderboard — group wins by user, sort by count desc
  const leaderboardMap: Record<string, { name: string; email: string; wins: number; topTier: string }> = {};
  for (const w of allWinners) {
    if (!leaderboardMap[w.user_id]) {
      leaderboardMap[w.user_id] = {
        name: w.user_name,
        email: w.email,
        wins: 0,
        topTier: w.tier,
      };
    }
    leaderboardMap[w.user_id].wins += 1;
    // Keep highest tier
    const tierOrder: Record<string, number> = {
      tier_5: 5, tier_4: 4, tier_3: 3, tier_2: 2, tier_1: 1,
    };
    if ((tierOrder[w.tier] ?? 0) > (tierOrder[leaderboardMap[w.user_id].topTier] ?? 0)) {
      leaderboardMap[w.user_id].topTier = w.tier;
    }
  }
  const leaderboard = Object.values(leaderboardMap).sort((a, b) => b.wins - a.wins);

  // Top winner + highest tier for stats highlight
  const topWinner = leaderboard[0] ?? null;
  const highestTier = allWinners.reduce((best, w) => {
    const tierOrder: Record<string, number> = {
      tier_5: 5, tier_4: 4, tier_3: 3, tier_2: 2, tier_1: 1,
    };
    return (tierOrder[w.tier] ?? 0) > (tierOrder[best] ?? 0) ? w.tier : best;
  }, "tier_1");

  const overviewStats = [
    { icon: "👥", label: "Total Users",   value: users.length,   color: "from-blue-500/10 to-blue-400/5",   border: "border-blue-500/20"   },
    { icon: "🎲", label: "Total Draws",   value: draws.length,   color: "from-purple-500/10 to-purple-400/5", border: "border-purple-500/20" },
    { icon: "🏆", label: "Total Winners", value: totalWinners,   color: "from-yellow-500/10 to-yellow-400/5", border: "border-yellow-500/20" },
    {
      icon: "✅",
      label: "Active Users",
      value: users.filter((u) => u.subscription_status === "active").length,
      color: "from-green-500/10 to-green-400/5",
      border: "border-green-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030f06] text-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">⛳</span>
          <span className="text-base font-bold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Golf Charity
          </span>
          <span className="ml-2 text-xs bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-2.5 py-1 rounded-full font-semibold">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-green-200/40 hidden sm:block">{adminUser.email}</span>
          <Link href="/dashboard" className="text-sm text-green-200/60 hover:text-white transition-colors">
            Dashboard
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl transition-all"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-64px)]">

        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-white/10 bg-white/[0.02] px-3 py-6 gap-1">
          {adminMenuItems.map((item) => (
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

            {/* ── Heading ── */}
            <div id="overview">
              <h1 className="text-2xl md:text-3xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Admin Panel
              </h1>
              <p className="text-sm text-green-200/35 mt-1">
                Manage users, run draws, and view results.
              </p>
            </div>

            {/* ── Enhanced Stats Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {overviewStats.map((stat) => (
                <div
                  key={stat.label}
                  className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-5 flex flex-col gap-3 hover:scale-[1.02] transition-all duration-200 cursor-default`}
                >
                  <span className="text-2xl">{stat.icon}</span>
                  <div>
                    <p className="text-3xl font-bold text-white"
                      style={{ fontFamily: "'Playfair Display', serif" }}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-green-200/40 mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Winner Highlight Stats Card ── */}
            {allWinners.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-500/10 via-orange-400/5 to-green-500/10 border border-yellow-400/25 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-yellow-400/80 uppercase tracking-widest mb-4">
                  🏅 Platform Highlights
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
                      Top Winner
                    </p>
                    <p className="text-base font-bold text-white truncate">
                      {topWinner?.name ?? "—"}
                    </p>
                    <p className="text-xs text-yellow-400 mt-0.5">
                      {topWinner ? `${topWinner.wins} win${topWinner.wins > 1 ? "s" : ""}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
                      Highest Tier Achieved
                    </p>
                    <span className={`inline-flex text-xs px-3 py-1.5 rounded-full font-semibold border ${getTierColor(highestTier)}`}>
                      {getTierLabel(highestTier)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
                      Total Prize Events
                    </p>
                    <p className="text-base font-bold text-white">
                      {allWinners.length}
                    </p>
                    <p className="text-xs text-green-400 mt-0.5">across {draws.length} draws</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Run Draw ── */}
            <section id="draw" className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  Run Draw
                </h2>
                <p className="text-xs text-green-200/35 mt-1">
                  Draws 5 unique random numbers (1–45). Users with 3+ matching scores win. More matches = higher tier.
                </p>
              </div>

              {/* Tier legend */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(["tier_5", "tier_4", "tier_3"] as const).map((tier) => (
                  <span
                    key={tier}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border ${getTierColor(tier)}`}
                  >
                    {getTierLabel(tier)}
                  </span>
                ))}
              </div>

              {/* Draw result */}
              {lastDrawResult && (
                <div className="mb-6 p-5 bg-green-500/10 border border-green-500/20 rounded-xl space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-green-400 mb-3">✅ Draw complete!</p>
                    <div className="flex flex-wrap gap-2">
                      {lastDrawResult.drawnNumbers.map((n, i) => (
                        <span
                          key={i}
                          className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/25 text-green-400 flex items-center justify-center font-bold text-sm"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {lastDrawResult.winners.length === 0 ? (
                    <p className="text-sm text-green-200/40">
                      No winners this round — no user had 3+ matching scores.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">
                        🏆 {lastDrawResult.winners.length} winner{lastDrawResult.winners.length > 1 ? "s" : ""} found
                      </p>
                      {lastDrawResult.winners.map((w) => (
                        <div
                          key={w.userId}
                          className="flex items-center justify-between bg-gradient-to-r from-yellow-500/10 to-green-500/10 border border-yellow-400/30 rounded-xl px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">
                              🏆 {w.fullName || w.email}
                            </p>
                            <p className="text-xs text-green-200/40 mt-0.5">
                              🎯 {w.matchedCount} matching score{w.matchedCount > 1 ? "s" : ""}
                            </p>
                          </div>
                          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${getTierColor(w.tier)}`}>
                            {getTierLabel(w.tier)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {drawError && (
                <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
                  {drawError}
                </div>
              )}

              <button
                onClick={handleRunDraw}
                disabled={drawLoading}
                className="bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/25 flex items-center gap-2"
              >
                {drawLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Running draw...
                  </>
                ) : (
                  <>🎲 Run Draw Now</>
                )}
              </button>
            </section>

            {/* ── Draw History ── */}
            <section id="history" className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    Draw History
                  </h2>
                  <p className="text-xs text-green-200/35 mt-1">Last 20 draws with tier-based winners.</p>
                </div>
                {draws.length > 0 && (
                  <span className="text-xs bg-white/5 border border-white/10 text-green-200/50 px-3 py-1.5 rounded-full">
                    {draws.length} draw{draws.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {draws.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-4">🎲</div>
                  <p className="text-white/40 text-sm">No draws yet.</p>
                  <p className="text-white/20 text-xs mt-1">Run your first draw above.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {draws.map((draw) => (
                    <div key={draw.id} className="border border-white/10 rounded-xl p-4 hover:bg-white/[0.03] transition-colors">
                      <div className="flex items-start justify-between mb-3 gap-4">
                        <div>
                          <p className="text-xs text-green-200/40 font-medium mb-2 uppercase tracking-widest">
                            🎲 Drawn Numbers
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {(draw.drawn_numbers ?? []).map((n, i) => (
                              <span key={i}
                                className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">
                                {n}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-white/30 mt-2">{formatDate(draw.created_at)}</p>
                        </div>
                        <span className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium border ${
                          draw.winners && draw.winners.length > 0
                            ? "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"
                            : "bg-white/5 border-white/10 text-white/30"
                        }`}>
                          {draw.winners && draw.winners.length > 0
                            ? `${draw.winners.length} winner(s)`
                            : "No winners"}
                        </span>
                      </div>

                      {draw.winners && draw.winners.length > 0 && (
                        <div className="mt-3 space-y-2 pl-2 border-l-2 border-green-500/20">
                          {draw.winners.map((w) => {
                            const wAny = w as any;
                            return (
                              <div key={w.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-white/60">
                                  <span>🏆</span>
                                  <span className="font-medium text-white/80">
                                    {wAny.profiles?.full_name || wAny.profiles?.email || "Unknown"}
                                  </span>
                                  <span className="text-white/30">
                                    — 🎯 {w.matched_count} match{w.matched_count > 1 ? "es" : ""}
                                  </span>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full font-semibold border ${getTierColor(w.tier)}`}>
                                  {getTierLabel(w.tier)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── ALL WINNERS ── */}
            <section id="winners" className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    All Winners
                  </h2>
                  <p className="text-xs text-green-200/35 mt-1">Every user who has won across all draws.</p>
                </div>
                {allWinners.length > 0 && (
                  <span className="text-xs bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-3 py-1.5 rounded-full font-semibold">
                    {allWinners.length} winner{allWinners.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Enhanced empty state */}
              {allWinners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400/10 to-orange-400/5 border border-yellow-400/20 flex items-center justify-center text-4xl mb-5">
                    🏆
                  </div>
                  <p className="text-white/50 font-semibold text-base mb-1">
                    No winners yet
                  </p>
                  <p className="text-white/20 text-sm max-w-xs leading-relaxed">
                    No winners yet — run a draw to find lucky players!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allWinners.map((w) => (
                    <div
                      key={w.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-yellow-500/10 to-green-500/10 border border-yellow-400/30 rounded-xl px-5 py-4 hover:from-yellow-500/15 hover:to-green-500/15 hover:border-yellow-400/50 transition-all duration-200 hover:scale-[1.01]"
                    >
                      {/* User info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-400/15 border border-yellow-400/25 flex items-center justify-center text-lg shrink-0">
                          🏆
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            🏆 {w.user_name}
                          </p>
                          <p className="text-xs text-green-200/40 mt-0.5">{w.email}</p>
                        </div>
                      </div>

                      {/* Draw numbers + match count */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs text-white/30 mr-1">🎲</span>
                          {w.drawn_numbers.map((n, i) => (
                            <span key={i}
                              className="w-6 h-6 rounded bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">
                              {n}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-yellow-300">
                          🎯 {w.matched_count} match{w.matched_count > 1 ? "es" : ""}
                          {" · "}
                          {formatDate(w.draw_date || w.created_at)}
                        </p>
                      </div>

                      {/* Tier badge */}
                      <span className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold border ${getTierColor(w.tier)}`}>
                        {getTierLabel(w.tier)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── LEADERBOARD (NEW) ── */}
            <section id="leaderboard" className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    🏅 Leaderboard
                  </h2>
                  <p className="text-xs text-green-200/35 mt-1">Top users ranked by total wins.</p>
                </div>
                {leaderboard.length > 0 && (
                  <span className="text-xs bg-white/5 border border-white/10 text-green-200/50 px-3 py-1.5 rounded-full">
                    {leaderboard.length} player{leaderboard.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-4">
                    🏅
                  </div>
                  <p className="text-white/40 text-sm font-medium">No rankings yet</p>
                  <p className="text-white/20 text-xs mt-1">
                    Run a draw to populate the leaderboard.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((player, index) => {
                    const rankColors = [
                      "from-yellow-500/20 to-yellow-400/5 border-yellow-400/40",
                      "from-gray-400/15 to-gray-300/5 border-gray-400/30",
                      "from-orange-500/15 to-orange-400/5 border-orange-400/30",
                    ];
                    const rankIcons = ["🥇", "🥈", "🥉"];
                    const rankClass = rankColors[index] ?? "from-white/5 to-white/[0.02] border-white/10";
                    const rankIcon = rankIcons[index] ?? `#${index + 1}`;

                    return (
                      <div
                        key={player.email}
                        className={`flex items-center gap-4 bg-gradient-to-r ${rankClass} border rounded-xl px-5 py-4 hover:scale-[1.01] transition-all duration-200`}
                      >
                        {/* Rank */}
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold shrink-0">
                          {rankIcon}
                        </div>

                        {/* Name + email */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {player.name}
                          </p>
                          <p className="text-xs text-green-200/35 mt-0.5 truncate">
                            {player.email}
                          </p>
                        </div>

                        {/* Win count */}
                        <div className="text-center shrink-0">
                          <p className="text-2xl font-bold text-white"
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            {player.wins}
                          </p>
                          <p className="text-xs text-green-200/35">
                            win{player.wins > 1 ? "s" : ""}
                          </p>
                        </div>

                        {/* Top tier */}
                        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold border ${getTierColor(player.topTier)}`}>
                          {getTierLabel(player.topTier)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Users Table ── */}
            <section id="users" className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    All Users
                  </h2>
                  <p className="text-xs text-green-200/35 mt-1">Everyone registered on the platform.</p>
                </div>
                <span className="text-xs bg-white/5 border border-white/10 text-green-200/50 px-3 py-1.5 rounded-full">
                  {users.length} user{users.length !== 1 ? "s" : ""}
                </span>
              </div>

              {users.length === 0 ? (
                <p className="text-center text-white/30 text-sm py-10">No users yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {["Name", "Email", "Role", "Status", "Joined"].map((h) => (
                          <th key={h} className="text-left pb-3 text-xs font-semibold text-green-200/30 uppercase tracking-widest">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 font-medium text-white">{user.full_name || "—"}</td>
                          <td className="py-3 text-green-200/50">{user.email}</td>
                          <td className="py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                              user.role === "admin"
                                ? "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"
                                : "bg-white/5 border-white/10 text-white/40"
                            }`}>
                              {user.role ?? "user"}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                              user.subscription_status === "active"
                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                : user.subscription_status === "trial"
                                ? "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"
                                : "bg-white/5 border-white/10 text-white/30"
                            }`}>
                              {user.subscription_status ?? "trial"}
                            </span>
                          </td>
                          <td className="py-3 text-white/30 text-xs">{formatDate(user.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}