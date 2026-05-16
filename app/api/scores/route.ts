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

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from('scores').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ detail: 'Failed to fetch scores' }, { status: 500 });
  }
}
