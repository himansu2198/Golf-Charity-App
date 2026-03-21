export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: "user" | "admin";
  is_admin?: boolean;
  subscription_status?: "active" | "trial" | "expired" | "inactive";
  selected_charity_id?: string;
  created_at: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  created_at: string;
}

// ── Draw now stores 5 drawn numbers as array ──
export interface Draw {
  id: string;
  drawn_numbers: number[];          // ARRAY — not single number
  run_by: string;
  created_at: string;
  winners?: WinnerWithRelations[];
}

export type WinnerTier =
  | "tier_1"
  | "tier_2"
  | "tier_3"
  | "tier_4"
  | "tier_5";

// ── Base winner — no score_id needed anymore ──
export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  matched_count: number;
  tier: WinnerTier;
  created_at: string;
}

// ── Winner joined with draw data — used in dashboard ──
export interface WinnerWithDraw extends Winner {
  draws: {
    drawn_numbers: number[];        // array from draws table
    created_at: string;
  } | null;
}

// ── Winner joined with profile — used in admin ──
export interface WinnerWithRelations extends Winner {
  profiles?: {
    email: string;
    full_name: string | null;
  } | null;
}

// ── Result returned from runDraw() ──
export interface DrawResult {
  draw: Draw;
  drawnNumbers: number[];           // array — not single number
  winners: EnrichedWinner[];
}

export interface EnrichedWinner {
  userId: string;
  email: string;
  fullName: string;
  matchedCount: number;
  tier: WinnerTier;
}