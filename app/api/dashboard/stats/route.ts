import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

function computeTotal(score: { technical?: Record<string, number>; tactical?: Record<string, number>; sop?: Record<string, number> }) {
  const sum = (obj: Record<string, number> = {}) =>
    Object.values(obj).reduce((acc, v) => acc + (Number(v) || 0), 0);
  return sum(score.technical ?? {}) + sum(score.tactical ?? {}) + sum(score.sop ?? {});
}

export async function GET() {
  try {
    const supabase = createServerClient();
    const today = new Date().toISOString().slice(0, 10);

    const [
      personnelResult,
      todayResult,
      totalResult,
      scoresResult,
    ] = await Promise.all([
      supabase.from('personnel').select('*', { count: 'exact', head: true }),
      supabase.from('scores').select('*', { count: 'exact', head: true }).eq('simulation_date', today),
      supabase.from('scores').select('*', { count: 'exact', head: true }),
      supabase.from('scores').select('*, personnel:personnel_id (name, nrp, unit)'),
    ]);

    const scored = (scoresResult.data ?? [])
      .map((s) => ({ ...s, total_score: computeTotal(s as Parameters<typeof computeTotal>[0]) }))
      .sort((a, b) => b.total_score - a.total_score);

    const avg_score = scored.length
      ? Math.round(scored.reduce((sum, s) => sum + s.total_score, 0) / scored.length)
      : 0;

    const rankings = scored.slice(0, 10).map((s, i) => ({
      rank: i + 1,
      id: s.id,
      name: (s.personnel as { name?: string } | null)?.name ?? '',
      nrp: (s.personnel as { nrp?: string } | null)?.nrp ?? '',
      unit: (s.personnel as { unit?: string } | null)?.unit ?? '',
      total_score: s.total_score,
      simulation_date: s.simulation_date,
    }));

    return NextResponse.json({
      total_personnel: personnelResult.count ?? 0,
      today_simulations: todayResult.count ?? 0,
      avg_score,
      total_sessions: totalResult.count ?? 0,
      rankings,
    });
  } catch {
    return NextResponse.json({ detail: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
