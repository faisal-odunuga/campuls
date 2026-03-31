import { auth } from '@/auth';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await auth();

  if (!session?.supabaseAccessToken) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createClient(session.supabaseAccessToken);
  const result = await supabase.auth.signOut({ scope: 'local' });

  if (result.error) {
    console.error('Supabase sign-out failed', result.error);
    return NextResponse.json({ ok: false, error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
