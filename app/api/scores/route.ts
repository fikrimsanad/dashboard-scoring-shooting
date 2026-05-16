import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createServerClient();
    // normalize: ensure simulation_date and personnel_id exist
    const { personnel_id, simulation_date, technical, tactical, sop, notes } = body;
    if (!personnel_id || !simulation_date) return NextResponse.json({ detail: 'Missing fields' }, { status: 400 });
    const payload = { personnel_id, simulation_date, technical: technical || null, tactical: tactical || null, sop: sop || null, notes: notes || null };
    const { data, error } = await supabase.from('scores').insert([payload]).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ detail: 'Failed to create score' }, { status: 500 });
  }
}

function computeTotal(score: { technical?: Record<string, number>; tactical?: Record<string, number>; sop?: Record<string, number> }) {
  const sum = (obj: Record<string, number> = {}) =>
    Object.values(obj).reduce((acc, v) => acc + (Number(v) || 0), 0);
  const total_technical = sum(score.technical ?? {});
  const total_tactical = sum(score.tactical ?? {});
  const total_sop = sum(score.sop ?? {});
  return { total_technical, total_tactical, total_sop, total_score: total_technical + total_tactical + total_sop };
}

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('scores')
      .select('*, personnel:personnel_id (name, nrp, rank, unit)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const enriched = (data ?? []).map((score) => {
      const p = score.personnel as { name?: string; nrp?: string; rank?: string; unit?: string } | null;
      const totals = computeTotal(score as Parameters<typeof computeTotal>[0]);
      return {
        ...score,
        personnel_name: p?.name ?? '',
        personnel_nrp: p?.nrp ?? '',
        personnel_rank: p?.rank ?? '',
        personnel_unit: p?.unit ?? '',
        ...totals,
      };
    });
    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ detail: 'Failed to fetch scores' }, { status: 500 });
  }
}
