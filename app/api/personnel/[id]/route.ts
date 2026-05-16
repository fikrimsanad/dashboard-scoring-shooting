import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const supabase = createServerClient();
    const { data, error } = await supabase.from('personnel').update(body).eq('id', params.id).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ detail: 'Failed to update personnel' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.from('personnel').delete().eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ detail: 'Deleted' });
  } catch (err) {
    return NextResponse.json({ detail: 'Failed to delete personnel' }, { status: 500 });
  }
}
