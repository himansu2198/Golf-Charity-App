import { supabase } from "@/lib/supabaseClient";
import { User } from "@/types";

export async function getProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, email, full_name, role, subscription_status, selected_charity_id, created_at"
      )
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[getProfile] Error:", error.message);
      return null;
    }

    if (!data) {
      console.warn("[getProfile] No profile found for:", userId);
      return null;
    }

    // Normalise subscription_status — never let it be null
    return {
      ...data,
      subscription_status: data.subscription_status ?? "trial",
    } as User;
  } catch (err) {
    console.error("[getProfile] Unexpected error:", err);
    return null;
  }
}

export async function upsertProfile(
  userId: string,
  email: string,
  fullName?: string
): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: email.trim().toLowerCase(),
          full_name: fullName?.trim() || "",
          subscription_status: "trial", // default on first create
          role: "user",
        },
        { onConflict: "id", ignoreDuplicates: false }
      )
      .select(
        "id, email, full_name, role, subscription_status, selected_charity_id, created_at"
      )
      .single();

    if (error) {
      console.error("[upsertProfile] Error:", error.message);
      return null;
    }

    return {
      ...data,
      subscription_status: data.subscription_status ?? "trial",
    } as User;
  } catch (err) {
    console.error("[upsertProfile] Unexpected error:", err);
    return null;
  }
}

export async function getOrCreateProfile(
  userId: string,
  email: string,
  fullName?: string
): Promise<User | null> {
  const existing = await getProfile(userId);
  if (existing) return existing;

  console.warn("[getOrCreateProfile] Profile missing, creating fallback...");
  return await upsertProfile(userId, email, fullName);
}

export async function getAllProfiles(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, email, full_name, role, subscription_status, selected_charity_id, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getAllProfiles] Error:", error.message);
      return [];
    }

    // Normalise every row
    return (data ?? []).map((row) => ({
      ...row,
      subscription_status: row.subscription_status ?? "trial",
    })) as User[];
  } catch (err) {
    console.error("[getAllProfiles] Unexpected error:", err);
    return [];
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<User>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (error) {
      console.error("[updateProfile] Error:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[updateProfile] Unexpected error:", err);
    return false;
  }
}