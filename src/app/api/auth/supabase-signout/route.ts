import { auth } from '@/auth';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await auth();

  if (!session?.supabaseAccessToken) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createClient(session.supabaseAccessToken);
  await supabase.auth.signOut({ scope: 'local' });

  return NextResponse.json({ ok: true });
}
