'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import {
  Bell,
  CalendarClock,
  Clock3,
  Loader2,
  MapPin,
  Megaphone,
  MoreVertical,
  Paperclip,
  PersonStanding,
  Play,
  TriangleAlert
} from 'lucide-react';
import type { HocSnapshot } from '@/lib/supabase/queries';
import {
  formatNoticeCategory,
  getCardStyles,
  getIconTone,
  getStatusLabel,
  noticeCategories,
  type NoticeCategory,
  type SessionRow,
} from '@/components/hoc-console.utils';

type HocConsoleProps = {
  snapshot: HocSnapshot;
};

export function HocConsole({ snapshot }: HocConsoleProps) {
  const noticeRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();
  const [notice, setNotice] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<NoticeCategory>('announcement');
  const [noticeCourseId, setNoticeCourseId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [todayLabel, setTodayLabel] = useState<string>('');

  const activeSession = snapshot.activeSession;
  const todayRows = snapshot.timetable;
  const courseOptions = useMemo(() => {
    const seen = new Map<string, { id: string; code: string; title: string }>();

    for (const row of snapshot.fullTimetable) {
      if (!row.courseId || seen.has(row.courseId)) continue;
      seen.set(row.courseId, {
        id: row.courseId,
        code: row.code,
        title: row.title
      });
    }

    return Array.from(seen.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [snapshot.fullTimetable]);

  const ongoingCount = snapshot.hocStats.find((stat) => stat.label === 'Ongoing Sessions')?.value ?? '00';
  const remainingCount = snapshot.hocStats.find((stat) => stat.label === 'Remaining Today')?.value ?? '00';
  const alertsCount = String(
    todayRows.filter((row) => row.status === 'CANCELLED' || row.status === 'POSTPONED').length
  ).padStart(2, '0');
  const featuredRow =
    todayRows.find((row) => row.status === 'ONGOING') ??
    todayRows.find((row) => row.status === 'UP NEXT' || row.status === 'SCHEDULED') ??
    todayRows[0];

  useEffect(() => {
    setTodayLabel(
      new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'Africa/Lagos'
      })
        .format(new Date())
        .toUpperCase()
    );
  }, []);

  async function runAction(body: Record<string, string | undefined>, actionId: string, successMessage: string) {
    setPendingAction(actionId);
    setMessage(null);

    try {
      const response = await fetch('/api/hoc/session', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; ok?: boolean; message?: string }
        | null;

      if (!response.ok) {
        setMessage(payload?.error ?? 'Action failed.');
        return;
      }

      startTransition(() => {
        router.refresh();
      });

      if (actionId === 'post-notice') {
        setNotice('');
        setNoticeCategory('announcement');
        setNoticeCourseId('');
      }
      setMessage(payload?.message ?? successMessage);
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-center md:gap-8">
        <div>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-primary">
            HOC Control Panel
          </h2>
          <p className="mt-2 font-medium text-on-surface-variant">
            Manage live sessions and department notices from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-xl bg-surface-container-high p-3 text-on-surface-variant transition-colors hover:bg-surface-container-highest"
            type="button"
          >
            <Bell className="h-5 w-5" />
          </button>
          <div className="hidden h-10 w-px bg-outline-variant/30 md:block" />
          <button
            className="rounded-xl bg-error px-5 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
            onClick={() => noticeRef.current?.focus()}
            type="button"
          >
            Emergency Broadcast
          </button>
        </div>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-surface-container-lowest p-5 shadow-sm">
          <span className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-outline-variant">
            Ongoing Sessions
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-5xl font-extrabold text-secondary">
              {ongoingCount}
            </span>
            <span className="h-3 w-3 rounded-full bg-secondary pulse-active" />
          </div>
          <p className="mt-4 text-sm font-medium italic text-on-surface-variant">
            {activeSession ? `${activeSession.code}: ${activeSession.title}` : 'No active session right now.'}
          </p>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-5 shadow-sm">
          <span className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-outline-variant">
            Remaining Today
          </span>
          <span className="font-headline text-5xl font-extrabold text-primary">{remainingCount}</span>
          <p className="mt-4 text-sm font-medium text-on-surface-variant">
            {featuredRow ? `Next: ${featuredRow.code} at ${featuredRow.time}` : 'No more sessions for today.'}
          </p>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-5 shadow-sm">
          <span className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-outline-variant">
            Alerts
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-5xl font-extrabold text-error">{alertsCount}</span>
            <TriangleAlert className="h-5 w-5 text-error" />
          </div>
          <p className="mt-4 text-sm font-medium text-on-surface-variant">
            Cancelled and postponed sessions need attention.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold text-on-surface">Today&apos;s Academic Flow</h3>
            <span className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-primary">
              {todayLabel || 'Today'}
            </span>
          </div>

          <div className="space-y-4">
            {todayRows.length > 0 ? (
              todayRows.map((row) => {
                const isOngoing = row.status === 'ONGOING';
                const isStarted = isOngoing;
                const canStart = row.status === 'UP NEXT' || row.status === 'SCHEDULED';
                const canReschedule = row.status === 'POSTPONED' || row.status === 'CANCELLED';

                return (
                  <div key={row.id} className={`${getCardStyles(row)} rounded-xl relative overflow-hidden`}>
                    {isOngoing ? (
                      <div className="absolute right-0 top-0 p-4">
                        <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-black uppercase tracking-wider text-on-secondary-container">
                          Live Now
                        </span>
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-6 md:flex-row">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${getIconTone(row)}`}>
                        <span className="text-3xl font-black">{row.code.slice(0, 2)}</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="font-headline text-lg font-bold text-on-surface">
                            {row.title} ({row.code})
                          </h4>
                          <span className="rounded-full bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            {getStatusLabel(row)}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                          <span className="flex items-center gap-1.5 text-sm font-medium text-on-surface-variant">
                            <MapPin className="h-4 w-4" />
                            {row.venue}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm font-medium text-on-surface-variant">
                            <PersonStanding className="h-4 w-4" />
                            {row.lecturer}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm font-medium text-on-surface-variant">
                            <Clock3 className="h-4 w-4" />
                            {row.range}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-xl bg-surface-container-high p-3 text-primary transition-colors hover:bg-surface-container-highest"
                          type="button"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {isStarted ? (
                          <button
                            className="rounded-xl bg-surface-dim px-6 py-3 text-sm font-bold text-on-surface-variant"
                            disabled
                            type="button"
                          >
                            Class Started
                          </button>
                        ) : canStart ? (
                          <button
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-6 py-3 text-sm font-bold text-on-primary transition-all hover:opacity-90 disabled:opacity-60"
                            disabled={pendingAction !== null || isPending}
                            onClick={() =>
                              void runAction(
                                { action: 'start-session', timetableId: row.id },
                                `start-${row.id}`,
                                `Started ${row.code}.`
                              )
                            }
                            type="button"
                          >
                            {pendingAction === `start-${row.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                            Start Class
                          </button>
                        ) : canReschedule ? (
                          <button
                            className="rounded-xl bg-surface-container-high px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-surface-container-highest disabled:opacity-60"
                            disabled={pendingAction !== null || isPending}
                            onClick={() =>
                              void runAction(
                                { action: 'reschedule-session', timetableId: row.id },
                                `reschedule-${row.id}`,
                                `Rescheduled ${row.code}.`
                              )
                            }
                            type="button"
                          >
                            {pendingAction === `reschedule-${row.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CalendarClock className="h-4 w-4" />
                            )}
                            Reschedule
                          </button>
                        ) : (
                          <button
                            className="rounded-xl bg-surface-dim px-6 py-3 text-sm font-bold text-on-surface-variant"
                            disabled
                            type="button"
                          >
                            Completed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant shadow-sm">
                No sessions are scheduled for today.
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6 lg:col-span-4">
          <section className="relative overflow-hidden rounded-xl bg-primary-container p-8 text-white">
            <div className="relative z-10">
              <h3 className="mb-4 font-headline text-xl font-bold">Announcement Board</h3>
              <p className="mb-6 text-sm leading-relaxed text-on-primary-container">
                Broadcast updates to students from the same control panel.
              </p>
              <div className="space-y-4">
                <textarea
                  ref={noticeRef}
                  className="min-h-[120px] w-full rounded-xl border-none bg-indigo-900/40 p-4 text-sm placeholder:text-indigo-300 focus:ring-2 focus:ring-on-primary-container"
                  onChange={(event) => setNotice(event.target.value)}
                  placeholder="Type a class update or FAQ answer..."
                  value={notice}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-primary-container">
                      Category
                    </span>
                    <select
                      className="w-full rounded-xl border-none bg-white/10 px-4 py-3 text-sm font-medium text-white outline-none ring-0 focus:bg-white/15"
                      value={noticeCategory}
                      onChange={(event) => setNoticeCategory(event.target.value as NoticeCategory)}
                    >
                      {noticeCategories.map((category) => (
                        <option key={category.value} value={category.value} className="text-on-surface">
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-primary-container">
                      Course
                    </span>
                    <select
                      className="w-full rounded-xl border-none bg-white/10 px-4 py-3 text-sm font-medium text-white outline-none ring-0 focus:bg-white/15"
                      value={noticeCourseId}
                      onChange={(event) => setNoticeCourseId(event.target.value)}
                    >
                      <option value="" className="text-on-surface">
                        All students
                      </option>
                      {courseOptions.map((course) => (
                        <option key={course.id} value={course.id} className="text-on-surface">
                          {course.code} - {course.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="flex-1 rounded-xl bg-surface-container-lowest py-3 text-sm font-bold text-primary transition-colors hover:bg-primary-fixed disabled:opacity-60"
                    disabled={!notice.trim() || pendingAction !== null || isPending}
                    onClick={() =>
                      void runAction(
                        {
                          action: 'post-notice',
                          content: notice,
                          category: noticeCategory,
                          courseId: noticeCourseId || undefined
                        },
                        'post-notice',
                        'Notice posted successfully.'
                      )
                    }
                    type="button"
                  >
                    {pendingAction === 'post-notice' ? 'Posting...' : 'Post Update'}
                  </button>
                  <button className="rounded-xl bg-indigo-900/40 p-3 transition-colors hover:bg-indigo-800/40" type="button">
                    <Paperclip className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
          </section>

          <section className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <h4 className="mb-6 font-headline text-sm font-bold uppercase tracking-widest text-on-surface-variant">
              Recent Notices
            </h4>
            <div className="space-y-4">
              {snapshot.updates.slice(0, 4).map((update) => (
                <div key={update.id} className="rounded-xl bg-surface-container-low p-4">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-primary">{update.title}</p>
                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {formatNoticeCategory(update.category)}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-on-surface-variant">{update.date}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{update.body}</p>
                  {update.courseCode ? (
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {update.courseCode}
                    </p>
                  ) : null}
                </div>
              ))}
              {snapshot.updates.length === 0 && (
                <p className="text-sm text-on-surface-variant">No notices have been posted yet.</p>
              )}
            </div>
            {snapshot.updates.length > 0 ? (
              <button className="mt-6 w-full text-xs font-bold uppercase tracking-tighter text-primary hover:underline" type="button">
                View All {snapshot.updates.length} Notices
              </button>
            ) : null}
          </section>
        </aside>
      </div>

      {message ? <p className="mt-6 text-sm text-on-surface-variant">{message}</p> : null}
    </main>
  );
}
