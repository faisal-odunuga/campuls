import { auth } from '@/auth';
import { AppChrome } from '@/components/app-chrome';
import { TimetableBoard } from '@/components/timetable-board';
import { getDepartmentSnapshot } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';

export default async function TimetablePage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const snapshot = await getDepartmentSnapshot(session.supabaseAccessToken);
  console.log(snapshot);
  return (
    <AppChrome
      avatarUrl={session.user.image ?? undefined}
      title='Live Timetable'
      searchPlaceholder='Search courses or venues...'
      userName={session.user.name ?? 'Campuls User'}
      userSubtitle={`${session.user.role ?? 'student'}${session.user.level ? ` • ${session.user.level}` : ''}`}
    >
      <TimetableBoard rows={snapshot.fullTimetable} />
    </AppChrome>
  );
}
