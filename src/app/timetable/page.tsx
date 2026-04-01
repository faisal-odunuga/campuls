import { auth } from '@/auth';
import { RealtimeRefresh } from '@/components/realtime-refresh';
import { TimetableBoard } from '@/components/timetable-board';
import { getTimetableSnapshot } from '@/lib/supabase/queries';
import { AlertTriangle } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function TimetablePage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const snapshot = await getTimetableSnapshot(session.supabaseAccessToken);

  if (snapshot.error) {
    return (
      <>
        <RealtimeRefresh accessToken={session.supabaseAccessToken} tables={['timetable', 'class_sessions']} />
        <section className='mx-auto flex max-w-4xl items-start px-4 py-8 sm:px-6 lg:px-8'>
          <div className='w-full rounded-2xl border border-error-container/30 bg-error-container/10 p-6 text-on-surface'>
            <div className='flex items-start gap-4'>
              <div className='rounded-full bg-error-container p-3 text-on-error-container'>
                <AlertTriangle className='h-5 w-5' />
              </div>
              <div className='space-y-2'>
                <h1 className='font-headline text-xl font-bold'>Timetable could not load</h1>
                <p className='text-sm text-on-surface-variant'>
                  {snapshot.error}
                </p>
                <p className='text-sm text-on-surface-variant'>
                  The timetable query is missing a column or the live schema changed. Fix the data source, then reload this page.
                </p>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <RealtimeRefresh accessToken={session.supabaseAccessToken} tables={['timetable', 'class_sessions']} />
      <TimetableBoard rows={snapshot.fullTimetable} />
    </>
  );
}
