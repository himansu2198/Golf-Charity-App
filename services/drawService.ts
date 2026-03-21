import { supabase } from "@/lib/supabaseClient";
import {
  Draw,
  WinnerWithDraw,
  WinnerTier,
  DrawResult,
  EnrichedWinner,
} from "@/types";

// ── Generate 5 unique random numbers between 1–45 ──
function generateDrawNumbers(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers);
}

// ── Determine tier based on match count ──
function getTier(matchedCount: number): WinnerTier | null {
  if (matchedCount >= 5) return "tier_5";
  if (matchedCount === 4) return "tier_4";
  if (matchedCount === 3) return "tier_3";
  return null;
}

// ── Friendly label for UI display ──
export function getTierLabel(tier: WinnerTier | string): string {
  switch (tier) {
    case "tier_5": return "🥇 Tier 5 — 5 Matches";
    case "tier_4": return "🥈 Tier 4 — 4 Matches";
    case "tier_3": return "🥉 Tier 3 — 3 Matches";
    case "tier_2": return "Tier 2 — 2 Matches";
    case "tier_1": return "Tier 1 — 1 Match";
    default:       return String(tier);
  }
}

// ── Tier color classes for UI ──
export function getTierColor(tier: WinnerTier | string): string {
  switch (tier) {
    case "tier_5": return "bg-yellow-400/10 border-yellow-400/20 text-yellow-400";
    case "tier_4": return "bg-gray-300/10 border-gray-300/20 text-gray-300";
    case "tier_3": return "bg-orange-400/10 border-orange-400/20 text-orange-400";
    default:       return "bg-white/5 border-white/10 text-white/40";
  }
}

// ── Internal types ──
interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
}

interface ScoreRow {
  id: string;
  user_id: string;
  score: number;
}

interface WinnerRow {
  id: unknown;
  draw_id: unknown;
  user_id: unknown;
  matched_count: unknown;
  tier: unknown;
  created_at: unknown;
  draws: {
    drawn_numbers: unknown;
    created_at: unknown;
  } | null;
}

export interface AllWinner {
  id: string;
  user_id: string;
  draw_id: string;
  matched_count: number;
  tier: WinnerTier;
  created_at: string;
  user_name: string;
  email: string;
  drawn_numbers: number[];
  draw_date: string;
}

interface AllWinnerRow {
  id: unknown;
  user_id: unknown;
  draw_id: unknown;
  matched_count: unknown;
  tier: unknown;
  created_at: unknown;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
  draws: {
    drawn_numbers: unknown;
    created_at: unknown;
  } | null;
}

// ════════════════════════════════════════════════
// ── RUN DRAW ──
// ════════════════════════════════════════════════
export async function runDraw(adminId: string): Promise<DrawResult> {

  // Step 1 — generate 5 unique random numbers
  const drawnNumbers = generateDrawNumbers();

  // Step 2 — insert draw record
  const { data: draw, error: drawError } = await supabase
    .from("draws")
    .insert({
      drawn_numbers: drawnNumbers,
      run_by: adminId,
    })
    .select()
    .single();

  if (drawError || !draw) {
    throw new Error(drawError?.message ?? "Failed to create draw.");
  }

  // Step 3 — fetch all scores
  const { data: allScores, error: scoresError } = await supabase
    .from("scores")
    .select("id, user_id, score");

  if (scoresError) {
    throw new Error(scoresError.message);
  }

  const scoreRows = (allScores ?? []) as ScoreRow[];

  if (scoreRows.length === 0) {
    return { draw, drawnNumbers, winners: [] };
  }

  // Step 4 — fetch all profiles with role
  const { data: allProfiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role");

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profiles = (allProfiles ?? []) as ProfileRow[];

  // Build eligible users — exclude admins
  const eligibleUserIds = new Set<string>();
  const profileMap: Record<string, { email: string; full_name: string }> = {};

  for (const p of profiles) {
    if (p.role === "admin") continue;
    eligibleUserIds.add(p.id);
    profileMap[p.id] = {
      email: p.email ?? "",
      full_name: p.full_name ?? "",
    };
  }

  if (eligibleUserIds.size === 0) {
    return { draw, drawnNumbers, winners: [] };
  }

  // Step 5 — group scores by eligible user only
  const userScoresMap: Record<string, number[]> = {};

  for (const s of scoreRows) {
    if (!eligibleUserIds.has(s.user_id)) continue;
    if (!userScoresMap[s.user_id]) {
      userScoresMap[s.user_id] = [];
    }
    userScoresMap[s.user_id].push(s.score);
  }

  // Step 6 — count matches per user
  const drawnSet = new Set(drawnNumbers);
  const userMatchMap: Record<string, number> = {};

  for (const [userId, userScores] of Object.entries(userScoresMap)) {
    let matchCount = 0;
    for (const score of userScores) {
      if (drawnSet.has(score)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      userMatchMap[userId] = matchCount;
    }
  }

  // Step 7 — filter 3+ matches
  const qualifyingUsers = Object.entries(userMatchMap).filter(
    ([, count]) => count >= 3
  );

  if (qualifyingUsers.length === 0) {
    return { draw, drawnNumbers, winners: [] };
  }

  // Step 8 — insert winners
  const winnerInserts = qualifyingUsers
    .map(([userId, count]) => {
      const tier = getTier(count);
      if (!tier) return null;
      return {
        draw_id: draw.id,
        user_id: userId,
        matched_count: count,
        tier,
      };
    })
    .filter((w): w is NonNullable<typeof w> => w !== null);

  if (winnerInserts.length > 0) {
    const { error: winnersError } = await supabase
      .from("winners")
      .insert(winnerInserts);

    if (winnersError) {
      throw new Error(winnersError.message);
    }
  }

  // Step 9 — build enriched result for UI
  const enrichedWinners: EnrichedWinner[] = qualifyingUsers
    .map(([userId, count]) => {
      const tier = getTier(count);
      if (!tier) return null;
      const profile = profileMap[userId];
      return {
        userId,
        email: profile?.email ?? "Unknown",
        fullName: profile?.full_name ?? "Unknown",
        matchedCount: count,
        tier,
      };
    })
    .filter((w): w is NonNullable<typeof w> => w !== null);

  return { draw, drawnNumbers, winners: enrichedWinners };
}

// ════════════════════════════════════════════════
// ── DRAW HISTORY — admin draw history section ──
// ════════════════════════════════════════════════
export async function getDrawHistory(): Promise<Draw[]> {
  try {
    const { data, error } = await supabase
      .from("draws")
      .select(`
        id,
        drawn_numbers,
        run_by,
        created_at,
        winners (
          id,
          user_id,
          matched_count,
          tier,
          created_at,
          profiles ( email, full_name )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) return [];

    return (data ?? []) as unknown as Draw[];
  } catch {
    return [];
  }
}

// ════════════════════════════════════════════════
// ── ALL WINNERS — admin winners section ──
// ════════════════════════════════════════════════
export async function getAllWinners(): Promise<AllWinner[]> {
  try {
    const { data, error } = await supabase
      .from("winners")
      .select(`
        id,
        user_id,
        draw_id,
        matched_count,
        tier,
        created_at,
        profiles ( full_name, email ),
        draws ( drawn_numbers, created_at )
      `)
      .order("created_at", { ascending: false });

    if (error) return [];

    if (!data || data.length === 0) return [];

    return (data as unknown as AllWinnerRow[]).map((row): AllWinner => ({
      id: String(row.id ?? ""),
      user_id: String(row.user_id ?? ""),
      draw_id: String(row.draw_id ?? ""),
      matched_count:
        typeof row.matched_count === "number"
          ? row.matched_count
          : Number(row.matched_count ?? 1),
      tier: (
        typeof row.tier === "string" && row.tier.startsWith("tier_")
          ? row.tier
          : "tier_1"
      ) as WinnerTier,
      created_at: String(row.created_at ?? ""),
      user_name:
        row.profiles?.full_name ||
        row.profiles?.email ||
        "Unknown",
      email: row.profiles?.email ?? "",
      drawn_numbers: Array.isArray(row.draws?.drawn_numbers)
        ? row.draws.drawn_numbers.map(Number)
        : [],
      draw_date: String(row.draws?.created_at ?? ""),
    }));
  } catch {
    return [];
  }
}

// ════════════════════════════════════════════════
// ── USER WINNINGS — user dashboard ──
// ════════════════════════════════════════════════
export async function getUserWinnings(
  userId: string
): Promise<WinnerWithDraw[]> {
  try {
    if (!userId) return [];

    const { data, error } = await supabase
      .from("winners")
      .select(`
        id,
        draw_id,
        user_id,
        matched_count,
        tier,
        created_at,
        draws (
          drawn_numbers,
          created_at
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return [];

    if (!data || data.length === 0) return [];

    return (data as unknown as WinnerRow[]).map((row): WinnerWithDraw => ({
      id: String(row.id ?? ""),
      draw_id: String(row.draw_id ?? ""),
      user_id: String(row.user_id ?? ""),
      matched_count:
        typeof row.matched_count === "number"
          ? row.matched_count
          : Number(row.matched_count ?? 1),
      tier: (
        typeof row.tier === "string" && row.tier.startsWith("tier_")
          ? row.tier
          : "tier_1"
      ) as WinnerTier,
      created_at: String(row.created_at ?? ""),
      draws: row.draws
        ? {
            drawn_numbers: Array.isArray(row.draws.drawn_numbers)
              ? row.draws.drawn_numbers.map(Number)
              : [],
            created_at: String(row.draws.created_at ?? ""),
          }
        : null,
    }));
  } catch {
    return [];
  }
}