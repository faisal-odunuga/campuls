import { auth } from '@/auth';
import { AppChrome } from '@/components/app-chrome';
import { getDepartmentSnapshot } from '@/lib/supabase/queries';
import { Clock3, Search, SlidersHorizontal, UploadCloud } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function AssignmentsPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string | string[] }>;
}) {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const snapshot = await getDepartmentSnapshot(session.supabaseAccessToken);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query =
    typeof resolvedSearchParams?.q === 'string' ? resolvedSearchParams.q.trim().toLowerCase() : '';
  const filteredAssignments = query
    ? snapshot.assignments
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) =>
              group.course.toLowerCase().includes(query) ||
              item.title.toLowerCase().includes(query) ||
              item.detail.toLowerCase().includes(query)
          )
        }))
        .filter((group) => group.items.length > 0)
    : snapshot.assignments;
  const totalPending = filteredAssignments.reduce((total, group) => total + group.items.length, 0);

  return (
    <AppChrome
      avatarUrl={session.user.image ?? undefined}
      title="Assignments & Tasks"
      searchPlaceholder="Search assignments..."
      userName={session.user.name ?? 'Campuls User'}
      userSubtitle={`${session.user.role ?? 'student'}${session.user.level ? ` • ${session.user.level}` : ''}`}
    >
      <main className="mx-auto max-w-lg space-y-8 md:max-w-3xl">
        <section className="mb-8">
          <p className="mb-1 font-['Inter'] text-[10px] font-medium tracking-wide text-slate-500 uppercase">
            Academic Control
          </p>
          <div className="flex items-center justify-between">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">Assignments</h1>
            <span className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-semibold text-on-surface-variant">
              {totalPending} Pending
            </span>
          </div>
        </section>

        {/* Search & Filter Bar (Minimalist) */}
        <form className="flex gap-2" method="get">
          <div className="flex flex-1 items-center gap-3 rounded-xl bg-surface-container px-4 py-3">
            <Search className="h-4 w-4 text-outline" />
            <input
              aria-label="Filter by course"
              className="w-full border-none bg-transparent p-0 text-sm placeholder:text-outline focus:ring-0"
              defaultValue={query}
              name="q"
              placeholder="Filter by course..."
              type="search"
            />
          </div>
          <button aria-label="Open filters" className="rounded-xl bg-surface-container-highest p-3" type="submit">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
          </button>
        </form>

        {/* Assignments Groups */}
        <div className="space-y-10">
          {filteredAssignments.length ? (
            filteredAssignments.map((group) => (
              <section key={group.course} className="space-y-4">
                <div className="flex items-end justify-between border-b border-surface-container-highest px-1 pb-2">
                  <h3 className="font-headline text-lg font-bold text-primary">{group.course}</h3>
                  <span className="font-label text-[10px] font-bold uppercase tracking-widest text-outline-variant">
                    {group.count} Tasks
                  </span>
                </div>

                <div className="space-y-4">
                  {group.items.map((item) => {
                    const isUrgent = item.urgency === 'URGENT';
                    return (
                      <div
                        key={item.title}
                        className={`relative overflow-hidden rounded-xl border-l-4 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${
                          isUrgent ? 'border-error bg-surface-container-lowest' : 'border-tertiary-fixed-dim bg-surface-container-lowest'
                        }`}
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div className="space-y-1 flex-1 pr-4">
                            <h4 className="font-headline font-bold leading-tight text-on-surface">
                              {item.title}
                            </h4>
                            <p className="text-xs text-on-surface-variant line-clamp-1">{item.detail}</p>
                          </div>
                          <div
                            className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-tighter ${
                              isUrgent
                                ? 'bg-error-container text-on-error-container'
                                : 'bg-tertiary-fixed text-on-tertiary-container'
                            }`}
                          >
                            {isUrgent ? 'Urgent' : 'Upcoming'}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-2 ${isUrgent ? 'text-error' : 'text-on-tertiary-fixed-variant'}`}>
                            <Clock3 className="h-4 w-4" />
                            <span className="font-label text-sm font-bold">{item.daysLeft}</span>
                          </div>
                          <button
                            aria-label={isUrgent ? 'Quick Submit' : 'View Brief'}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-label text-xs font-semibold transition-transform active:scale-95 ${
                              isUrgent
                                ? 'bg-primary text-on-primary shadow-sm'
                                : 'bg-surface-container-high text-primary-container'
                            }`}
                            disabled
                            title="Submission action not implemented yet"
                            type="button"
                          >
                            {isUrgent && <UploadCloud className="h-4 w-4" />}
                            {isUrgent ? 'Quick Submit' : 'View Brief'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
             <div className="rounded-xl border border-surface-container-highest bg-surface-container-lowest p-6 text-sm text-on-surface-variant shadow-sm">
                No assignments pending! You&apos;re all caught up.
             </div>
          )}
        </div>
      </main>
    </AppChrome>
  );
}
