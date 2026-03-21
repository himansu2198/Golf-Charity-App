import { supabase } from "@/lib/supabaseClient";
import { Score } from "@/types";

const MAX_SCORES = 5;

export async function getUserScores(userId: string): Promise<Score[]> {
  try {
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(MAX_SCORES);

    if (error) {
      console.error("[getUserScores] Error:", error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("[getUserScores] Unexpected error:", err);
    return [];
  }
}

export async function addScore(
  userId: string,
  score: number
): Promise<Score | null> {
  try {
    // Fetch existing scores oldest first
    const { data: existing, error: fetchError } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("[addScore] Fetch error:", fetchError.message);
      throw new Error(fetchError.message);
    }

    // Delete oldest if at max capacity
    if (existing && existing.length >= MAX_SCORES) {
      const { error: deleteError } = await supabase
        .from("scores")
        .delete()
        .eq("id", existing[0].id);

      if (deleteError) {
        console.error("[addScore] Delete error:", deleteError.message);
        throw new Error(deleteError.message);
      }
    }

    // Insert new score
    const { data, error: insertError } = await supabase
      .from("scores")
      .insert({ user_id: userId, score })
      .select()
      .single();

    if (insertError) {
      console.error("[addScore] Insert error:", insertError.message);
      throw new Error(insertError.message);
    }

    console.log("[addScore] Score added:", score, "for user:", userId);
    return data;
  } catch (err) {
    console.error("[addScore] Unexpected error:", err);
    throw err; // Re-throw so ScoreForm can show the error
  }
}