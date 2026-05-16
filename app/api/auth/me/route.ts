import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });
  return NextResponse.json({ id: session.userId, role: session.role, name: session.userId });
}
