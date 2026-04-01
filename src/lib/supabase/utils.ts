import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import type { CourseRelation, CoursesById } from './types';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const DEFAULT_SESSION_MINUTES = 60;

export function shortDate(value?: string | null) {
  if (!value) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function to12Hour(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const total = h * 60 + m + minutes;
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const nextHours = Math.floor(normalized / 60);
  const nextMinutes = normalized % 60;
  return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
}

export function timeToMinutes(hhmm?: string | null) {
  if (!hhmm) {
    return null;
  }

  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) {
    return null;
  }

  return h * 60 + m;
}

export function formatRange(start: string, end?: string | null, minutes = DEFAULT_SESSION_MINUTES): string {
  if (end) {
    return `${to12Hour(start)} — ${to12Hour(end)}`;
  }

  return `${to12Hour(start)} — ${to12Hour(addMinutes(start, minutes))}`;
}

export function longDate(value?: string | null) {
  if (!value) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function lagosDayStart(value: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day));
}

export function relativeDue(value?: string | null) {
  if (!value) {
    return 'No deadline';
  }

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return shortDate(value);
  }

  const diffDays = Math.ceil((lagosDayStart(target) - lagosDayStart(new Date())) / (1000 * 60 * 60 * 24));

  if (Number.isNaN(diffDays)) {
    return shortDate(value);
  }

  if (diffDays <= 0) {
    return 'Due now';
  }

  if (diffDays === 1) {
    return 'a day';
  }

  return `${diffDays} days`;
}

export function fileNameFromUrl(url?: string | null, fallback = 'Document') {
  if (!url) {
    return fallback;
  }

  const parts = url.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  if (!last) {
    return fallback;
  }

  return decodeURIComponent(last);
}

export function normaliseDayKey(day: string) {
  const value = day.trim().toLowerCase();
  return DAY_ORDER.find((candidate) => candidate.toLowerCase() === value || candidate.toLowerCase().startsWith(value)) ?? day;
}

export function dayIndex(day: string) {
  const key = normaliseDayKey(day);
  return DAY_ORDER.indexOf(key as (typeof DAY_ORDER)[number]);
}

export function pickCourse(course: CourseRelation) {
  return Array.isArray(course) ? course[0] ?? null : course ?? null;
}

export async function createDepartmentContext(accessToken?: string) {
  if (!supabaseConfigured()) {
    return null;
  }

  const supabase = await createClient(accessToken);
  const { data, error } = await supabase.from('courses').select('id, code, title').order('code');
  if (error) {
    return null;
  }

  return { supabase, coursesById: new Map(data.map((course) => [course.id, { code: course.code, title: course.title }])) };
}

export function buildTimetableEntries(
  timetableRows: Array<{
    id: string;
    day: string;
    scheduled_time: string | null;
    end_time: string | null;
    lecturer?: string | null;
    status?: string | null;
    course_id: string | null;
    courses?: CourseRelation;
  }>,
  sessionsRows: Array<{
    id: string;
    timetable_id: string | null;
    location: string | null;
    status: string | null;
    lecturer: string | null;
  }>,
  coursesById: CoursesById,
  todayWeekday: string,
) {
  const sessionsByTimetableId = new Map<
    string,
    { id: string; location: string | null; status: string | null; lecturer: string | null }
  >();

  for (const session of sessionsRows) {
    if (!session.timetable_id || sessionsByTimetableId.has(session.timetable_id)) {
      continue;
    }

    sessionsByTimetableId.set(session.timetable_id, {
      id: session.id,
      location: session.location ?? null,
      status: session.status ?? null,
      lecturer: session.lecturer ?? null,
    });
  }

  const timetable = timetableRows
    .map((row) => {
      const course = pickCourse(row.courses);
      const timeRaw = row.scheduled_time?.slice(0, 5) ?? '09:00';
      const endTime = row.end_time?.slice(0, 5) ?? null;
      const session = sessionsByTimetableId.get(row.id);
      const sessionLocation = session?.location?.trim() || null;
      return {
        id: row.id,
        courseId: row.course_id ?? null,
        day: row.day,
        time: to12Hour(timeRaw),
        timeRaw,
        range: formatRange(timeRaw, endTime),
        code: course?.code ?? coursesById.get(row.course_id ?? '')?.code ?? 'COURSE',
        title: course?.title ?? coursesById.get(row.course_id ?? '')?.title ?? 'Untitled course',
        lecturer: session?.lecturer ?? row.lecturer ?? 'TBA',
        venue: sessionLocation ?? 'Not confirmed',
        status: String(row.status ?? 'scheduled').toUpperCase(),
        endTime,
      };
    })
    .sort((a, b) => {
      const dayDiff = dayIndex(a.day) - dayIndex(b.day);
      if (dayDiff !== 0) {
        return dayDiff;
      }
      return a.timeRaw.localeCompare(b.timeRaw);
    });

  const nowParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Lagos',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date());
  const nowMap = Object.fromEntries(nowParts.map((part) => [part.type, part.value]));
  const nowMinutes = Number(nowMap.hour) * 60 + Number(nowMap.minute);
  const todayIndex = dayIndex(todayWeekday);

  let upNextMarked = false;
  const timetableWithStatus = timetable.map((row) => {
    const immutable = row.status === 'CANCELLED' || row.status === 'POSTPONED';
    if (immutable) return row;

    const rowIndex = dayIndex(row.day);
    if (rowIndex < 0) {
      return row;
    }

    if (rowIndex < todayIndex) {
      return { ...row, status: 'COMPLETED' };
    }

    if (rowIndex > todayIndex) {
      return { ...row, status: 'SCHEDULED' };
    }

    const [h, m] = row.timeRaw.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return row;
    const startMinutes = h * 60 + m;
    const endMinutes = timeToMinutes(row.endTime) ?? startMinutes + DEFAULT_SESSION_MINUTES;

    if (nowMinutes >= startMinutes && nowMinutes < endMinutes) {
      return { ...row, status: 'ONGOING' };
    }
    if (nowMinutes >= endMinutes) {
      return { ...row, status: 'COMPLETED' };
    }
    if (!upNextMarked) {
      upNextMarked = true;
      return { ...row, status: 'UP NEXT' };
    }
    return { ...row, status: 'SCHEDULED' };
  });

  const todaysEntries = timetableWithStatus.filter((row) => dayIndex(row.day) === todayIndex);
  const ongoingSessions = todaysEntries.filter((row) => row.status === 'ONGOING').length;
  const activeSessionRow =
    todaysEntries.find((row) => row.status === 'ONGOING') ??
    todaysEntries.find((row) => row.status === 'UP NEXT') ??
    null;

  const activeSession = activeSessionRow
    ? {
        timetableId: activeSessionRow.id,
        code: activeSessionRow.code,
        title: activeSessionRow.title,
        room: activeSessionRow.venue ?? 'Not confirmed',
        lecturer: activeSessionRow.lecturer,
        status: activeSessionRow.status,
        time: activeSessionRow.time,
      }
    : null;

  const hocStats = [
    { label: 'Ongoing Sessions', value: String(ongoingSessions).padStart(2, '0'), pulse: ongoingSessions > 0 },
    {
      label: 'Remaining Today',
      value: String(
        todaysEntries.filter((entry) => entry.status === 'SCHEDULED' || entry.status === 'UP NEXT').length,
      ).padStart(2, '0'),
      pulse: false,
    },
    { label: 'Pending Updates', value: '00', pulse: false },
  ];

  return { timetable, fullTimetable: timetableWithStatus, todaysEntries, activeSession, hocStats };
}
