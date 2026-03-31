import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/queries';
import { NextResponse } from 'next/server';

type ActionBody = {
  action?: 'start-session' | 'postpone-session' | 'reschedule-session' | 'post-notice';
  timetableId?: string;
  content?: string;
  category?: 'announcement' | 'assignment' | 'exam' | 'general';
  courseId?: string;
};

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getUserProfile(session.user.email ?? undefined, session.supabaseAccessToken);
  const role = profile?.role ?? session.user.role ?? 'student';

  if (role !== 'hoc') {
    return NextResponse.json({ error: 'Hoc access required' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as ActionBody | null;
  const action = body?.action;

  if (!action) {
    return NextResponse.json({ error: 'Missing action' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    if (action === 'post-notice') {
      const content = body?.content?.trim();
      const courseId = body?.courseId?.trim() || null;

      if (!content) {
        return NextResponse.json({ error: 'Notice content is required' }, { status: 400 });
      }

      const allowedCategories = new Set(['announcement', 'assignment', 'exam', 'general']);
      const category =
        body?.category && allowedCategories.has(body.category) ? body.category : undefined;

      const { error } = await supabase.from('updates_board').insert({
        content,
        created_by: profile?.id ?? null,
        course_id: courseId,
        ...(category ? { category } : {})
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    if (!body?.timetableId) {
      return NextResponse.json({ error: 'timetableId is required' }, { status: 400 });
    }

    const { data: row, error: rowError } = await supabase
      .from('timetable')
      .select('id, status, scheduled_time, day')
      .eq('id', body.timetableId)
      .maybeSingle();

    if (rowError) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (!row) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (action === 'start-session') {
      const { error: sessionError } = await supabase.rpc('start_class_session', {
        p_timetable_id: row.id,
        p_started_by: profile?.id ?? null
      });

      if (sessionError) {
        return NextResponse.json({ error: sessionError.message }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        message: 'Class session created. Location not confirmed yet.'
      });
    }

    if (action === 'postpone-session') {
      const { error: updateError } = await supabase
        .from('timetable')
        .update({ status: 'postponed' })
        .eq('id', row.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    if (action === 'reschedule-session') {
      const { error: updateError } = await supabase
        .from('timetable')
        .update({ status: 'scheduled' })
        .eq('id', row.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Request failed' },
      { status: 500 }
    );
  }
}
