import { supabase } from "@/lib/supabaseClient";
import { getUserRole } from "@/lib/rbac";

export async function signUp(
  email: string,
  password: string,
  fullName: string
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });
    if (error) return { data: null, error };
    return { data, error: null };
  } catch {
    return {
      data: null,
      error: { message: "Unexpected error during signup." },
    };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { data: null, role: null, error };

    const role = data.user ? await getUserRole(data.user.id) : null;
    console.log("[signIn] Success. Role:", role);

    return { data, role, error: null };
  } catch {
    return {
      data: null,
      role: null,
      error: { message: "Unexpected error during login." },
    };
  }
}

export async function signOut() {
  try {
    // ── Clear celebration state so next login shows confetti again ──
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("celebratedWinId");
    }

    const { error } = await supabase.auth.signOut();
    if (error) console.error("[signOut] Error:", error.message);
    return { error };
  } catch {
    return { error: null };
  }
}

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return { session: null, error };
    return { session: data.session, error: null };
  } catch {
    return { session: null, error: null };
  }
}
