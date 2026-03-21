import { supabase } from "@/lib/supabaseClient";

export async function getUserRole(
  userId: string
): Promise<"admin" | "user"> {
  try {
    if (!userId) return "user";

    // ✅ Get session to access email
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const email = session?.user?.email;

    if (!email) {
      console.warn("[getUserRole] No email found");
      return "user";
    }

    // ✅ Fetch role using email instead of id
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("[getUserRole] Error:", error.message);
      return "user";
    }

    if (!data) {
      console.warn("[getUserRole] No profile found for email:", email);
      return "user";
    }

    return (data.role as "admin" | "user") ?? "user";
  } catch (err) {
    console.error("[getUserRole] Unexpected error:", err);
    return "user";
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "admin";
}

export async function getSessionWithRole(): Promise<{
  userId: string | null;
  email: string | null;
  role: "admin" | "user" | null;
  isAdmin: boolean;
}> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return { userId: null, email: null, role: null, isAdmin: false };
    }

    const userId = session.user.id;
    const email = session.user.email ?? null;

    const role = await getUserRole(userId);

    return {
      userId,
      email,
      role,
      isAdmin: role === "admin",
    };
  } catch (err) {
    console.error("[getSessionWithRole] Unexpected error:", err);
    return { userId: null, email: null, role: null, isAdmin: false };
  }
}