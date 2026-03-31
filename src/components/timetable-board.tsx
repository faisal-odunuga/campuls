'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  MapPin,
  MoreVertical,
  Radar,
  School,
  Settings2,
  SquareActivity,
  TriangleAlert,
} from 'lucide-react';
import type { DepartmentSnapshot } from '@/lib/supabase/queries';

type TimetableRow = DepartmentSnapshot['fullTimetable'][number];

const DAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;
const DAY_SHORT: Record<(typeof DAY_ORDER)[number], string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

function normaliseDayKey(day: string) {
  const value = day.trim().toLowerCase();
  return (
    DAY_ORDER.find(
      (candidate) => candidate.toLowerCase() === value || candidate.toLowerCase().startsWith(value),
    ) ?? day
  );
}

function statusTone(status: string) {
  if (status === 'ONGOING') return 'success';
  if (status === 'CANCELLED') return 'error';
  if (status === 'POSTPONED') return 'warning';
  return 'neutral';
}

function getLagosNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Lagos',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
}

function getWeekStart(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay() === 0 ? 7 : copy.getDay();
  copy.setDate(copy.getDate() - day + 1);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getWeekDates(weekOffset = 0) {
  const start = getWeekStart(getLagosNow());
  start.setDate(start.getDate() + weekOffset * 7);
  return DAY_ORDER.map((day, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      day,
      short: DAY_SHORT[day],
      date,
      label: new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        timeZone: 'Africa/Lagos',
      }).format(date),
    };
  });
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Africa/Lagos',
  }).format(date);
}

function progressPercent(rows: TimetableRow[]) {
  if (!rows.length) return 0;
  const completed = rows.filter(
    (row) => row.status === 'COMPLETED' || row.status === 'CANCELLED',
  ).length;
  return Math.round((completed / rows.length) * 100);
}

function Card({ row }: { row: TimetableRow }) {
  const tone = statusTone(row.status);
  const isOngoing = row.status === 'ONGOING';
  const isCancelled = row.status === 'CANCELLED';
  const isPostponed = row.status === 'POSTPONED';

  if (isCancelled) {
    return (
      <article className='rounded-xl border border-error-container/20 bg-error-container/10 p-5 opacity-60'>
        <div className='mb-3 flex items-start justify-between gap-3'>
          <span className='rounded-full bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant'>
            {row.code}
          </span>
          <span className='rounded-full bg-error-container px-2.5 py-1 text-[10px] font-bold text-on-error-container'>
            Cancelled
          </span>
        </div>
        <h4 className='font-headline text-sm font-bold leading-tight text-on-surface line-through decoration-on-surface-variant'>
          {row.code}: {row.title}
        </h4>
        <p className='mt-1 text-xs text-on-surface-variant'>{row.lecturer}</p>
        <div className='mt-4 flex items-center justify-between gap-4 text-[11px] font-semibold'>
          <div className='flex items-center gap-1.5 text-on-surface-variant'>
            <Clock3 className='h-4 w-4' />
            <span>{row.range}</span>
          </div>
          <div className='flex items-center gap-1.5 text-on-surface-variant'>
            <MapPin className='h-4 w-4' />
            <span className='whitespace-pre-line'>{row.venue}</span>
          </div>
        </div>
      </article>
    );
  }

  if (isPostponed) {
    return (
      <article className='rounded-xl border border-tertiary-fixed/30 bg-surface-container-lowest p-5 shadow-sm'>
        <div className='mb-3 flex items-start justify-between gap-3'>
          <span className='rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant'>
            {row.code}
          </span>
          <span className='rounded-full bg-tertiary-fixed px-2.5 py-1 text-[10px] font-bold text-on-tertiary-fixed'>
            Postponed
          </span>
        </div>
        <h4 className='font-headline text-sm font-bold leading-tight text-on-surface'>
          {row.code}: {row.title}
        </h4>
        <p className='mt-1 text-xs text-on-surface-variant'>{row.lecturer}</p>
        <div className='mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-on-tertiary-fixed-variant'>
          <TriangleAlert className='h-4 w-4' />
          <span>Check email for details</span>
        </div>
      </article>
    );
  }

  if (isOngoing) {
    return (
      <article className='relative rounded-xl bg-white p-3 shadow-xl shadow-secondary/5 ring-2 ring-secondary/20 transition-all duration-300'>
        <div className='pulse-indicator absolute -right-1 -top-1 h-3 w-3 rounded-full bg-secondary' />
        <div className='mb-3 flex items-start justify-between gap-3'>
          <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-primary'>
            {row.code}
          </span>
          <span className='rounded-full bg-secondary-container px-2.5 py-1 text-[10px] font-bold text-on-secondary-container'>
            Ongoing
          </span>
        </div>
        <h4 className='font-headline text-sm font-bold leading-tight text-on-surface'>
          {row.code}: {row.title}
        </h4>
        <p className='mt-1 text-xs text-on-surface-variant'>{row.lecturer}</p>
        <div className='mt-4 flex items-center justify-between gap-4 text-[11px] font-semibold'>
          <div className='flex items-center gap-1 font-bold text-secondary'>
            <Activity className='h-4 w-4' />
            <span>{row.range}</span>
          </div>
          <div className='flex items-center gap-1 text-on-surface-variant'>
            <MapPin className='h-4 w-4' />
            <span className='whitespace-pre-line'>{row.venue}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className='rounded-xl border-l-4 border-primary bg-surface-container-lowest p-5 transition-all duration-300 hover:translate-y-[-4px]'>
      <div className='mb-3 flex items-start justify-between gap-3'>
        <span className='rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant'>
          {row.code}
        </span>
        <span className='rounded-full bg-surface-container-high px-2.5 py-1 text-[10px] font-bold text-on-surface-variant uppercase'>
          {tone === 'neutral' ? 'Scheduled' : row.status}
        </span>
      </div>
      <h4 className='font-headline text-sm font-bold leading-tight text-on-surface'>
        {row.code}: {row.title}
      </h4>
      <p className='mt-1 text-xs text-on-surface-variant'>{row.lecturer}</p>
      <div className='mt-4 flex items-center justify-between gap-4 text-[11px] font-semibold'>
        <div className='flex items-center gap-1 text-on-surface-variant'>
          <Clock3 className='h-4 w-4' />
          <span>{row.range}</span>
        </div>
        <div className='flex items-center gap-1 text-on-surface-variant'>
          <MapPin className='h-4 w-4' />
          <span className='whitespace-pre-line'>{row.venue}</span>
        </div>
      </div>
    </article>
  );
}

export function TimetableBoard({ rows }: { rows: TimetableRow[] }) {
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const today = getLagosNow();
    const dayName = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      timeZone: 'Africa/Lagos',
    }).format(today);
    return normaliseDayKey(dayName);
  });

  const weekDates = useMemo(() => getWeekDates(), []);

  const grouped = useMemo(() => {
    const map = new Map<string, TimetableRow[]>();
    for (const row of rows) {
      const key = normaliseDayKey(row.day);
      const existing = map.get(key) ?? [];
      existing.push(row);
      map.set(key, existing);
    }
    for (const day of DAY_ORDER) {
      const list = map.get(day);
      if (list) {
        list.sort((a, b) => a.timeRaw.localeCompare(b.timeRaw));
      }
    }
    return map;
  }, [rows]);

  const orderedDays = weekDates.map(({ day, short, date }) => ({
    day,
    short,
    date,
    rows: grouped.get(day) ?? [],
  }));

  const selectedRows = grouped.get(selectedDay) ?? [];
  const totalRows = rows.length;
  const progress = progressPercent(rows);
  const completed = rows.filter(
    (row) => row.status === 'COMPLETED' || row.status === 'CANCELLED',
  ).length;

  return (
    <main>
      <section className='hidden lg:block'>
        <div className='mb-10 flex flex-wrap items-center justify-end gap-4'>
          {/* <div className="flex items-center gap-2 overflow-x-auto py-2">
            <button className="whitespace-nowrap rounded-full bg-primary px-5 py-2 text-xs font-bold text-on-primary">All Levels</button>
            <button className="whitespace-nowrap rounded-full bg-surface-container-low px-5 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high">100 Level</button>
            <button className="whitespace-nowrap rounded-full bg-surface-container-low px-5 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high">200 Level</button>
            <button className="whitespace-nowrap rounded-full bg-surface-container-low px-5 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high">300 Level</button>
            <button className="whitespace-nowrap rounded-full bg-surface-container-low px-5 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high">400 Level</button>
          </div> */}
          <div className='flex items-center gap-3'>
            <span className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
              Current Week: {formatDateLabel(weekDates[0]?.date ?? getLagosNow())}
            </span>
            <div className='flex overflow-hidden rounded-lg border border-outline-variant'>
              <button
                className='border-r border-outline-variant p-2 transition-colors hover:bg-surface-container-high'
                type='button'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>
              <button
                className='p-2 transition-colors hover:bg-surface-container-high'
                type='button'
              >
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 xl:grid-cols-5'>
          {orderedDays.map(({ day, date, rows: dayRows }) => (
            <div key={day} className='space-y-4'>
              <div className='mb-6'>
                <h3 className='font-headline text-lg font-bold text-primary'>{day}</h3>
                <p className='mt-0.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60'>
                  {formatDateLabel(date)}
                </p>
              </div>

              {dayRows.length === 0 ? (
                <div className='flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant p-12 text-center opacity-40'>
                  <CalendarDays className='h-10 w-10 text-surface-dim' />
                  <p className='mt-3 text-xs font-bold uppercase tracking-tighter text-on-surface-variant'>
                    No Lectures
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {dayRows.map((row) => (
                    <Card key={row.id} row={row} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className='mt-16 grid grid-cols-1 gap-6 md:grid-cols-3'>
          <div className='group relative col-span-1 overflow-hidden rounded-3xl bg-primary-container p-8 md:col-span-2'>
            <div className='relative z-10'>
              <h3 className='font-headline text-xl font-bold text-white'>
                Week {Math.max(Math.ceil((weekDates[0]?.date.getDate() ?? 0) / 7), 1)} Progress
              </h3>
              <p className='mt-2 max-w-md text-sm text-on-primary-container'>
                {completed} of {totalRows} sessions completed in the current timetable set.
              </p>
              <button
                className='mt-6 rounded-lg bg-white px-6 py-2 text-xs font-bold text-primary transition-transform hover:scale-105'
                type='button'
              >
                Download Exam Schedule
              </button>
            </div>
            <div className='absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl transition-transform duration-700 group-hover:scale-150' />
          </div>
          <div className='flex flex-col justify-between rounded-3xl border border-secondary-container bg-secondary-container/30 p-8'>
            <div>
              <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container'>
                <School className='h-5 w-5' />
              </div>
              <h3 className='font-headline text-lg font-bold text-on-secondary-container'>
                Attendance Health
              </h3>
              <p className='mt-1 text-xs text-on-secondary-container/80'>
                Based on the current timetable rows
              </p>
            </div>
            <div className='mt-6 flex items-end gap-2'>
              <span className='font-headline text-4xl font-black text-on-secondary-container'>
                {progress}%
              </span>
              <span className='mb-1 text-xs font-bold text-secondary'>{completed} done</span>
            </div>
          </div>
        </div>
      </section>

      <section className='lg:hidden'>
        <div className='mb-8'>
          <p className='mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-500'>
            Academic Control Hub
          </p>
          <h1 className='text-3xl font-extrabold tracking-tight text-primary'>Live Timetable</h1>
        </div>

        <nav className='mb-8 flex justify-between rounded-xl bg-surface-container-low p-1.5'>
          {weekDates.slice(0, 5).map(({ day, short, date }) => {
            const active = selectedDay === day;
            return (
              <button
                key={day}
                className={[
                  'flex-1 rounded-lg px-2 py-3 text-center transition-all',
                  active
                    ? 'bg-surface-container-lowest font-bold text-primary shadow-sm'
                    : 'text-slate-500 hover:bg-slate-200/50',
                ].join(' ')}
                onClick={() => setSelectedDay(day)}
                type='button'
              >
                <span className='mb-1 block text-[10px] uppercase tracking-wider opacity-60'>
                  {short}
                </span>
                <span className='text-lg'>{date.getDate()}</span>
              </button>
            );
          })}
        </nav>

        <div className='space-y-6'>
          {selectedRows.length ? (
            selectedRows.map((row) => (
              <div key={row.id} className='relative pl-6'>
                <div className='absolute left-0 top-0 h-full border-l-2 border-secondary-container' />
                <div className='absolute -left-[9px] top-0 h-4 w-4 rounded-full border-4 border-surface bg-secondary pulse-indicator' />
                <Card row={row} />
              </div>
            ))
          ) : (
            <div className='rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant shadow-sm'>
              No classes scheduled for {selectedDay}.
            </div>
          )}
        </div>

        <section className='mt-12 rounded-2xl bg-primary-container p-6 text-white relative overflow-hidden'>
          <div className='relative z-10'>
            <h4 className='mb-1 font-headline text-xl font-bold'>Week Progress</h4>
            <p className='mb-6 text-sm text-indigo-200'>
              {completed} of {totalRows} sessions completed
            </p>
            <div className='mb-2 h-2 w-full overflow-hidden rounded-full bg-indigo-900/40'>
              <div
                className='h-full rounded-full bg-secondary-fixed'
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className='flex justify-between text-[10px] font-bold uppercase tracking-widest text-indigo-300'>
              <span>Performance: High</span>
              <span>{progress}% Done</span>
            </div>
          </div>
          <div className='absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-400/10 blur-3xl' />
        </section>
      </section>
    </main>
  );
}
