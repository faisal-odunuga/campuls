import { auth } from '@/auth';
import { AppChrome } from '@/components/app-chrome';
import { UpdatesBoard } from '@/components/updates-board';
import { getDepartmentSnapshot } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';

export default async function UpdatesPage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const snapshot = await getDepartmentSnapshot(session.supabaseAccessToken);

  return (
    <AppChrome
      avatarUrl={session.user.image ?? undefined}
      title="Updates Board"
      searchPlaceholder="Search updates..."
      userName={session.user.name ?? 'Campuls User'}
      userSubtitle={`${session.user.role ?? 'student'}${session.user.level ? ` • ${session.user.level}` : ''}`}
      userRole={session.user.role ?? 'student'}
    >
      <UpdatesBoard updates={snapshot.updates} />
    </AppChrome>
  );
}
