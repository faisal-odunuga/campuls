import { auth } from '@/auth';
import { AppChrome } from '@/components/app-chrome';
import { getDepartmentSnapshot } from '@/lib/supabase/queries';
import { ArrowLeft, Clock3, MapPin, RadioTower } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CourseDetailPage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const snapshot = await getDepartmentSnapshot(session.supabaseAccessToken);
  const active = snapshot.activeSession;
  const totalSessions = snapshot.timetable.length;
  const attendedCount = snapshot.timetable.filter(
    (row) => row.status === 'ONGOING' || row.status === 'COMPLETED'
  ).length;
  const attendancePercent = totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : null;
  const attendanceLabel =
    attendancePercent === null
      ? 'Empty'
      : attendancePercent >= 85
        ? 'Excellent'
        : attendancePercent >= 70
          ? 'Good'
          : 'Poor';

  return (
    <AppChrome
      avatarUrl={session.user.image ?? undefined}
      title="Course View"
      searchPlaceholder="Search course materials..."
      userName={session.user.name ?? 'Campuls User'}
      userSubtitle={`${session.user.role ?? 'student'}${session.user.level ? ` • ${session.user.level}` : ''}`}
      userRole={session.user.role ?? 'student'}
    >
      <main className="mx-auto max-w-lg space-y-8 pb-24 md:max-w-3xl">
        <section className="bg-surface-container-low px-6 py-8">
          <div className="flex flex-col gap-1">
            <div className="mb-4 flex items-center gap-4">
            <Link className="rounded-full p-2 transition-all hover:bg-slate-200/50" href="/">
              <span className="sr-only">Back</span>
                <ArrowLeft className="h-5 w-5 text-primary" />
              </Link>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">
                {active?.title ?? 'Course Detail'}
              </h1>
            </div>
            <p className="text-sm font-medium text-on-surface-variant">
              {active?.code ?? 'No active course selected'}
            </p>
          </div>

          {/* Quick Stats Area */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="col-span-2 flex h-32 flex-col justify-between rounded-xl bg-surface-container-lowest p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance</span>
              <div className="flex items-end justify-between">
                <span className="font-headline text-4xl font-extrabold text-primary">
                  {attendancePercent === null ? '--' : `${attendancePercent}%`}
                </span>
                <span className="rounded-full bg-secondary-container px-2 py-1 text-[10px] font-bold text-on-secondary-container uppercase">
                  {attendanceLabel}
                </span>
              </div>
            </div>
            <div className="col-span-1 flex h-32 flex-col justify-between rounded-xl bg-primary-container p-4 text-on-primary">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">Role</span>
              <span className="font-headline text-3xl md:text-4xl font-extrabold capitalize">{session.user.role ?? 'student'}</span>
            </div>
          </div>
        </section>

        <section className="mt-8 px-6">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-headline text-xl font-bold text-primary">Today&apos;s Schedule</h2>
            <span className="text-xs font-semibold text-on-surface-variant">Live Sync</span>
          </div>

          <div className="flex flex-col gap-4">
            {active ? (
              <div className="pulse-effect rounded-xl border-l-4 border-secondary bg-surface-container-lowest p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary">In Progress</span>
                    <h3 className="font-headline text-lg font-bold">{active.code}</h3>
                  </div>
                  <RadioTower className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <Clock3 className="h-4 w-4" />
                    <span>{active.time ?? 'TBA'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{active.room ?? 'TBA'}</span>
                  </div>
                </div>
              </div>
            ) : null}

            {snapshot.timetable.length === 0 && !active ? (
              <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant shadow-sm border-none">
                No classes scheduled for today.
              </div>
            ) : null}
            
            {!active && snapshot.timetable.map((timetableEntry) => (
              <div key={timetableEntry.id} className="rounded-xl bg-surface-container-low p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{timetableEntry.day}</span>
                    <h3 className="font-headline text-base font-semibold text-on-surface">{timetableEntry.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <Clock3 className="h-4 w-4" />
                    <span>{timetableEntry.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{timetableEntry.venue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 px-6">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-headline text-xl font-bold text-primary">Upcoming Deadlines</h2>
            <span className="text-xs font-semibold text-on-surface-variant">From your department feed</span>
          </div>

          <div className="flex flex-col gap-3">
            {snapshot.deadlines.length > 0 ? (
              snapshot.deadlines.slice(0, 2).map((deadline, index) => (
                <div
                  key={deadline.id}
                  className={`rounded-xl p-5 shadow-sm ${
                    index === 0
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                      : 'border border-outline-variant/10 bg-surface-container-lowest'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                        index === 0
                          ? 'bg-on-tertiary-fixed text-tertiary-fixed'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {index === 0 ? 'Urgent' : 'Upcoming'}
                    </span>
                    <span className="text-xs font-bold">{deadline.due}</span>
                  </div>
                  <h4 className="font-headline text-base font-bold">{deadline.title}</h4>
                  <p className={`mt-1 text-xs ${index === 0 ? 'opacity-80' : 'text-on-surface-variant'}`}>
                    {deadline.course}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5 text-sm text-on-surface-variant shadow-sm">
                No upcoming deadlines yet.
              </div>
            )}
          </div>
        </section>
      </main>
    </AppChrome>
  );
}
