import { auth } from '@/auth';
import { AppChrome } from '@/components/app-chrome';
import { HocConsole } from '@/components/hoc-console';
import { getDepartmentSnapshot, getUserProfile } from '@/lib/supabase/queries';
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

  const snapshot = await getDepartmentSnapshot(session.supabaseAccessToken);

  return (
    <AppChrome
      avatarUrl={session.user.image ?? undefined}
      title="HOC Control Panel"
      searchPlaceholder="Search control actions..."
      userName={session.user.name ?? 'Campuls User'}
      userSubtitle={`${role ?? 'student'}${session.user.level ? ` • ${session.user.level}` : ''}`}
    >
      <HocConsole snapshot={snapshot} />
    </AppChrome>
  );
}
