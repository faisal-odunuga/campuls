import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const runtime = 'nodejs';

function hasSignupEnv() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export async function POST(request: Request) {
  if (!hasSignupEnv()) {
    return NextResponse.json(
      { error: 'Signup is unavailable until Supabase and the service role key are configured.' },
      { status: 503 }
    );
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        name?: string;
        email?: string;
        password?: string;
        role?: 'student' | 'hoc';
        level?: number | null;
      }
    | null;

  const name = String(payload?.name ?? '').trim();
  const email = String(payload?.email ?? '').trim().toLowerCase();
  const password = String(payload?.password ?? '').trim();
  const role = payload?.role === 'hoc' ? 'hoc' : 'student';
  const level = typeof payload?.level === 'number' ? payload.level : null;

  if (!name || !email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role,
      level
    }
  });

  if (authError || !authUser.user) {
    return NextResponse.json(
      { error: authError?.message ?? 'Unable to create the Supabase auth user.' },
      { status: 400 }
    );
  }

  const { error: profileError } = await supabase.from('users').insert({
    id: authUser.user.id,
    name,
    email,
    role,
    level
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authUser.user.id).catch(() => undefined);
    return NextResponse.json(
      { error: profileError.message ?? 'Unable to create the user profile.' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    email,
    role
  });
}
