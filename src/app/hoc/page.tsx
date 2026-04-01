import { auth } from '@/auth';
import { HocConsole } from '@/components/hoc-console';
import { RealtimeRefresh } from '@/components/realtime-refresh';
import { getHocSnapshot, getUserProfile } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';

export default async function HocPage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const profile = await getUserProfile(session.user.email ?? undefined, session.supabaseAccessToken);
  const role = profile?.role ?? session.user.role ?? 'student';

  if (role !== 'hoc') {
    redirect('/');
  }

  const snapshot = await getHocSnapshot(session.supabaseAccessToken);

  return (
    <>
      <RealtimeRefresh
        accessToken={session.supabaseAccessToken}
        tables={['timetable', 'class_sessions', 'updates_board', 'materials']}
      />
      <HocConsole snapshot={snapshot} />
    </>
  );
}
