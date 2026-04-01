import { auth } from '@/auth';
import { UpdatesBoard } from '@/components/updates-board';
import { RealtimeRefresh } from '@/components/realtime-refresh';
import { getUpdatesSnapshot } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';

export default async function UpdatesPage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const snapshot = await getUpdatesSnapshot(session.supabaseAccessToken);

  return (
    <>
      <RealtimeRefresh
        accessToken={session.supabaseAccessToken}
        tables={['updates_board']}
      />
      <UpdatesBoard updates={snapshot.updates} />
    </>
  );
}
