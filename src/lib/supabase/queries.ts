import { createClient, supabaseConfigured } from '@/lib/supabase/server';

type TimetableEntry = {
  id: string;
  courseId: string | null;
  day: string;
  time: string;    // 12-hour display format e.g. "2:00 PM"
  timeRaw: string; // 24-hour for math e.g. "14:00"
  range: string;
  code: string;
  title: string;
  lecturer: string;
  venue: string;
  status: string;
  endTime: string | null;
};

type AssignmentItem = {
  id: string;
  title: string;
  detail: string;
  urgency: string;
  daysLeft: string;
};

type AssignmentGroup = {
  course: string;
  count: string;
  items: AssignmentItem[];
};

type MaterialEntry = {
  title: string;
  course: string;
  label: string;
  size: string;
  time: string;
};

type UpdateEntry = {
  id: string;
  date: string;
  title: string;
  body: string;
  category: string;
  courseCode: string | null;
};

type NoteEntry = {
  id: string;
  course: string;
  file: string;
  size: string;
};

type HocStat = {
  label: string;
  value: string;
  pulse: boolean;
};

type ActiveSession = {
  timetableId: string;
  code: string;
  title: string;
  room: string;
  lecturer: string;
  status: string;
  time: string;
} | null;

type DeadlineEntry = {
  id: string;
  title: string;
  course: string;
  due: string;
};

type CourseFileEntry = {
  file: string;
  type: string;
  size: string;
  date: string;
};

export type DepartmentSnapshot = {
  timetable: TimetableEntry[];      // today's entries only
  fullTimetable: TimetableEntry[];  // all days
  assignments: AssignmentGroup[];
  materials: MaterialEntry[];
  updates: UpdateEntry[];
  notes: NoteEntry[];
  hocStats: HocStat[];
  activeSession: ActiveSession;
  deadlines: DeadlineEntry[];
  courseFiles: CourseFileEntry[];
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'hoc';
  level: number | null;
  created_at: string;
} | null;

const emptySnapshot: DepartmentSnapshot = {
  timetable: [],
  fullTimetable: [],
  assignments: [],
  materials: [],
  updates: [],
  notes: [],
  hocStats: [
    { label: 'Ongoing Sessions', value: '00', pulse: false },
    { label: 'Remaining Today', value: '00', pulse: false },
    { label: 'Pending Updates', value: '00', pulse: false }
  ],
  activeSession: null,
  deadlines: [],
  courseFiles: []
};

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

function shortDate(value?: string | null) {
  if (!value) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));
}

function to12Hour(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const total = h * 60 + m + minutes;
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const nextHours = Math.floor(normalized / 60);
  const nextMinutes = normalized % 60;
  return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
}

function timeToMinutes(hhmm?: string | null) {
  if (!hhmm) {
    return null;
  }

  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) {
    return null;
  }

  return h * 60 + m;
}

function formatRange(start: string, end?: string | null, minutes = 90): string {
  if (end) {
    return `${to12Hour(start)} — ${to12Hour(end)}`;
  }

  return `${to12Hour(start)} — ${to12Hour(addMinutes(start, minutes))}`;
}

function longDate(value?: string | null) {
  if (!value) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
}

function relativeDue(value?: string | null) {
  if (!value) {
    return 'No deadline';
  }

  const target = new Date(value);
  const diffDays = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

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

function fileNameFromUrl(url?: string | null, fallback = 'Document') {
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

function normaliseDayKey(day: string) {
  const value = day.trim().toLowerCase();
  return DAY_ORDER.find((candidate) => candidate.toLowerCase() === value || candidate.toLowerCase().startsWith(value)) ?? day;
}

function dayIndex(day: string) {
  const key = normaliseDayKey(day);
  return DAY_ORDER.indexOf(key as (typeof DAY_ORDER)[number]);
}

export async function getDepartmentSnapshot(accessToken?: string): Promise<DepartmentSnapshot> {
  if (!supabaseConfigured()) {
    return emptySnapshot;
  }

  try {
    const supabase = await createClient(accessToken);

    // Determine today's weekday — both full (Monday) and abbreviated (Mon)
    const todayWeekday = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      timeZone: 'Africa/Lagos'
    }).format(new Date());
    const todayWeekdayShort = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      timeZone: 'Africa/Lagos'
    }).format(new Date());

    const [timetableRes, assignmentsRes, updatesRes, notesRes, coursesRes] = await Promise.all([
      supabase
        .from('timetable')
        .select('id, day, scheduled_time, end_time, lecturer, venue, status, course_id, courses:course_id(code, title)')
        .order('scheduled_time'),
      supabase
        .from('assignments')
        .select('id, title, description, deadline, course_id, courses:course_id(code, title)')
        .order('deadline'),
      supabase
        .from('updates_board')
        .select('id, content, created_at, category, course_id, courses:course_id(code, title)')
        .order('created_at', { ascending: false }),
      supabase
        .from('notes')
        .select('id, file_url, created_at, course_id, uploaded_by, courses:course_id(code, title)')
        .order('created_at', { ascending: false }),
      supabase.from('courses').select('id, code, title').order('code')
    ]);

    if (timetableRes.error || assignmentsRes.error || updatesRes.error || notesRes.error || coursesRes.error) {
      return emptySnapshot;
    }

    const coursesById = new Map(
      (coursesRes.data ?? []).map((course) => [
        course.id,
        {
          code: course.code,
          title: course.title
        }
      ])
    );

    const timetable = (timetableRes.data ?? [])
      .map((row) => {
      const course = (row as { courses?: { code?: string; title?: string } }).courses;
      const timeRaw = row.scheduled_time?.slice(0, 5) ?? '09:00'; // 24h for math
      const endTime = row.end_time?.slice(0, 5) ?? null;
      return {
        id: row.id,
        courseId: row.course_id ?? null,
        day: row.day,
        time: to12Hour(timeRaw),   // 12h for display
        timeRaw,                   // 24h kept for status computation
        range: formatRange(timeRaw, endTime),
        code: course?.code ?? coursesById.get(row.course_id)?.code ?? 'COURSE',
        title: course?.title ?? coursesById.get(row.course_id)?.title ?? 'Untitled course',
        lecturer: row.lecturer ?? 'TBA',
        venue: row.venue ?? 'TBA',
        status: String(row.status ?? 'scheduled').toUpperCase(),
        endTime
      };
      })
      .sort((a, b) => {
        const dayDiff = dayIndex(a.day) - dayIndex(b.day);
        if (dayDiff !== 0) {
          return dayDiff;
        }
        return a.timeRaw.localeCompare(b.timeRaw);
      });

    // Compute the current time in Africa/Lagos (minutes since midnight)
    const nowLagos = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' })
    );
    const nowMinutes = nowLagos.getHours() * 60 + nowLagos.getMinutes();
    const todayIndex = dayIndex(todayWeekday);

    // Assign date-aware statuses. Only today's rows receive live time-based states.
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
      const endMinutes = timeToMinutes(row.endTime) ?? startMinutes + 60;

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

    const groupedAssignments = new Map<string, AssignmentGroup>();

    (assignmentsRes.data ?? []).forEach((row) => {
      const course = (row as { courses?: { code?: string; title?: string } }).courses;
      const courseCode = course?.code ?? coursesById.get(row.course_id)?.code ?? 'COURSE';
      const courseTitle = course?.title ?? coursesById.get(row.course_id)?.title ?? 'Untitled course';
      const key = `${courseCode}: ${courseTitle}`;
      const deadline = row.deadline ? new Date(row.deadline) : null;

      const existing =
        groupedAssignments.get(key) ??
        ({
          course: key,
          count: '0 Assignments',
          items: []
        } satisfies AssignmentGroup);

      existing.items.push({
        id: row.id,
        title: row.title,
        detail: deadline ? `Due ${longDate(row.deadline)}` : 'No deadline recorded',
        urgency: deadline && deadline.getTime() <= Date.now() ? 'Urgent' : 'Due Soon',
        daysLeft: relativeDue(row.deadline)
      });
      existing.count = `${existing.items.length} Assignment${existing.items.length === 1 ? '' : 's'}`;
      groupedAssignments.set(key, existing);
    });

    const updates = (updatesRes.data ?? []).map((row) => {
      const course = (row as { courses?: { code?: string; title?: string } }).courses;
      const courseCode = course?.code ?? coursesById.get(row.course_id)?.code ?? 'GENERAL';
      const title = row.content.slice(0, 72);

      return {
        id: row.id,
        date: shortDate(row.created_at),
        title: `${courseCode} Update`,
        body: title,
        category: String(row.category ?? 'announcement'),
        courseCode: courseCode ?? null
      };
    });

    const notes = (notesRes.data ?? []).map((row, index) => {
      const course = (row as { courses?: { code?: string } }).courses;
      const courseCode = course?.code ?? coursesById.get(row.course_id)?.code ?? 'COURSE';

      return {
        id: row.id,
        course: courseCode,
        file: fileNameFromUrl(row.file_url, `Note ${index + 1}`),
        size: 'Stored in Supabase'
      };
    });

    const materials = (notesRes.data ?? []).map((row, index) => {
      const course = (row as { courses?: { code?: string; title?: string } }).courses;
      const courseCode = course?.code ?? coursesById.get(row.course_id)?.code ?? 'COURSE';
      const courseTitle = course?.title ?? coursesById.get(row.course_id)?.title ?? 'Untitled course';

      return {
        title: fileNameFromUrl(row.file_url, `Document ${index + 1}`),
        course: `${courseCode} • ${courseTitle}`,
        label: 'Uploaded',
        size: 'Supabase',
        time: shortDate(row.created_at)
      };
    });

    const courseFiles = (notesRes.data ?? []).map((row, index) => ({
      file: fileNameFromUrl(row.file_url, `Document ${index + 1}`),
      type: 'Supabase File',
      size: 'Stored',
      date: shortDate(row.created_at)
    }));

    // All stats use time-accurate computed statuses
    const ongoingSessions = todaysEntries.filter((row) => row.status === 'ONGOING').length;

    // Active session: prefer ONGOING, then UP NEXT
    const activeSessionRow =
      todaysEntries.find((row) => row.status === 'ONGOING') ??
      todaysEntries.find((row) => row.status === 'UP NEXT') ??
      null;

    const activeSession = activeSessionRow
      ? {
          timetableId: activeSessionRow.id,
          code: activeSessionRow.code,
          title: activeSessionRow.title,
          room: activeSessionRow.venue,
          lecturer: activeSessionRow.lecturer,
          status: activeSessionRow.status,
          time: activeSessionRow.time
        }
      : null;

    const hocStats: HocStat[] = [
      { label: 'Ongoing Sessions', value: String(ongoingSessions).padStart(2, '0'), pulse: ongoingSessions > 0 },
      { label: 'Remaining Today', value: String(Math.max(todaysEntries.length - ongoingSessions, 0)).padStart(2, '0'), pulse: false },
      { label: 'Pending Updates', value: String(updates.length).padStart(2, '0'), pulse: false }
    ];

    const deadlines: DeadlineEntry[] = (assignmentsRes.data ?? []).map((row) => {
      const course = (row as { courses?: { code?: string } }).courses;
      const courseCode = course?.code ?? coursesById.get(row.course_id)?.code ?? 'COURSE';
      return {
        id: row.id,
        title: row.title,
        course: `${courseCode}`,
        due: relativeDue(row.deadline)
      };
    });

    return {
      timetable: todaysEntries,
      fullTimetable: timetableWithStatus,
      assignments: [...groupedAssignments.values()],
      materials,
      updates,
      notes,
      hocStats,
      activeSession,
      deadlines,
      courseFiles
    };
  } catch {
    return emptySnapshot;
  }
}

export async function getUserProfile(email?: string, accessToken?: string): Promise<UserProfile> {
  if (!supabaseConfigured() || !email) {
    return null;
  }

  try {
    const supabase = await createClient(accessToken);
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, level, created_at')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role === 'hoc' ? 'hoc' : 'student',
      level: data.level ?? null,
      created_at: data.created_at
    };
  } catch {
    return null;
  }
}
