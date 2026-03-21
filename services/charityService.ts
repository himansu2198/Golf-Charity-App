import { supabase } from "@/lib/supabaseClient";
import { Charity } from "@/types";

export async function getCharities(): Promise<Charity[]> {
  try {
    const { data, error } = await supabase
      .from("charities")
      .select("*")
      .order("name");

    if (error) {
      console.error("[getCharities] Error:", error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("[getCharities] Unexpected error:", err);
    return [];
  }
}

export async function selectCharity(
  userId: string,
  charityId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ selected_charity_id: charityId })
      .eq("id", userId);

    if (error) {
      console.error("[selectCharity] Error:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[selectCharity] Unexpected error:", err);
    return false;
  }
}