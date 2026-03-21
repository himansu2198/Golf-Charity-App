import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (session.user.email !== adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const drawnNumber = Math.floor(Math.random() * 45) + 1;

    const { data: draw, error: drawError } = await supabase
      .from("draws")
      .insert({ drawn_number: drawnNumber, run_by: session.user.id })
      .select()
      .single();
    if (drawError) throw drawError;

    const { data: matchingScores, error: scoresError } = await supabase
      .from("scores")
      .select("*")
      .eq("score", drawnNumber);
    if (scoresError) throw scoresError;

    const winners = [];
    if (matchingScores && matchingScores.length > 0) {
      const winnerInserts = matchingScores.map((s) => ({
        draw_id: draw.id,
        user_id: s.user_id,
        score_id: s.id,
      }));
      const { data: insertedWinners, error: wError } = await supabase
        .from("winners")
        .insert(winnerInserts)
        .select();
      if (wError) throw wError;
      winners.push(...(insertedWinners || []));
    }

    return NextResponse.json({ draw, drawnNumber, winners });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Draw failed" },
      { status: 500 }
    );
  }
}