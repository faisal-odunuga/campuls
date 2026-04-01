import { supabaseConfigured } from '@/lib/supabase/server';
import {
  buildTimetableEntries,
  createDepartmentContext,
  fileNameFromUrl,
  longDate,
  relativeDue,
  shortDate,
} from './utils';
import { formatLagosWeekday, getLagosDateIso } from '@/lib/date';
import type {
  AssignmentsSnapshotData,
  DepartmentSnapshot,
  HocSnapshot,
  MaterialEntry,
  MaterialsSnapshotData,
  TimetableSnapshotResult,
  UpdatesSnapshotData,
  UserProfile,
} from './types';

export type { DepartmentSnapshot, HocSnapshot, TimetableSnapshotResult, UserProfile } from './types';

type UpdateEntry = UpdatesSnapshotData['updates'][number];
type AssignmentGroup = AssignmentsSnapshotData['assignments'][number];
type DeadlineEntry = AssignmentsSnapshotData['deadlines'][number];

const emptySnapshot: DepartmentSnapshot = {
  timetable: [],
  fullTimetable: [],
  assignments: [],
  materials: [],
  updates: [],
  hocStats: [
    { label: 'Ongoing Sessions', value: '00', pulse: false },
    { label: 'Remaining Today', value: '00', pulse: false },
    { label: 'Pending Updates', value: '00', pulse: false },
  ],
  activeSession: null,
  deadlines: [],
  courseFiles: [],
};

async function buildTimetableSnapshot(accessToken?: string): Promise<TimetableSnapshotResult | null> {
  const context = await createDepartmentContext(accessToken);
  if (!context) return null;

  const { supabase, coursesById } = context;
  const todayWeekday = formatLagosWeekday();
  const todayDate = getLagosDateIso();

  const [timetableRes, sessionsRes] = await Promise.all([
    supabase
      .from('timetable')
      .select('id, day, scheduled_time, end_time, course_id, courses:course_id(code, title)')
      .order('scheduled_time'),
    supabase
      .from('class_sessions')
      .select('id, timetable_id, date, status, location, lecturer, scheduled_time, end_time, started_at, ended_at, created_at')
      .eq('date', todayDate)
      .order('created_at', { ascending: false }),
  ]);

  if (timetableRes.error || sessionsRes.error) {
    return {
      timetable: [],
      fullTimetable: [],
      activeSession: null,
      hocStats: [
        { label: 'Ongoing Sessions', value: '00', pulse: false },
        { label: 'Remaining Today', value: '00', pulse: false },
        { label: 'Pending Updates', value: '00', pulse: false },
      ],
      error: timetableRes.error?.message ?? sessionsRes.error?.message ?? 'Unable to load timetable data.',
    };
  }

  const data = buildTimetableEntries(
    timetableRes.data ?? [],
    sessionsRes.data ?? [],
    coursesById,
    todayWeekday,
  );

  return {
    timetable: data.todaysEntries,
    fullTimetable: data.fullTimetable,
    activeSession: data.activeSession,
    hocStats: data.hocStats,
    error: null,
  };
}

async function buildUpdatesSnapshot(accessToken?: string): Promise<UpdatesSnapshotData | null> {
  const context = await createDepartmentContext(accessToken);
  if (!context) return null;

  const { supabase, coursesById } = context;
  const { data, error } = await supabase
    .from('updates_board')
    .select('id, content, created_at, category, course_id, courses:course_id(code, title)')
    .order('created_at', { ascending: false });

  if (error) {
    return null;
  }

  const updates = (data ?? []).map((row) => {
    const course = (row as { courses?: { code?: string; title?: string } }).courses;
    const courseCode = course?.code ?? coursesById.get(row.course_id)?.code ?? 'GENERAL';
    const title = String(row.content ?? '').slice(0, 72);

    return {
      id: row.id,
      date: shortDate(row.created_at),
      title: `${courseCode} Update`,
      body: title,
      category: String(row.category ?? 'announcement'),
      courseCode: courseCode ?? null,
    };
  });

  return { updates };
}

async function buildMaterialsSnapshot(accessToken?: string): Promise<MaterialsSnapshotData | null> {
  const context = await createDepartmentContext(accessToken);
  if (!context) return null;

  const { supabase, coursesById } = context;
  const { data, error } = await supabase
    .from('materials')
    .select('id, file_url, created_at, course_id, uploaded_by, courses:course_id(code, title)')
    .order('created_at', { ascending: false });

  if (error) {
    return null;
  }

  const materials: MaterialEntry[] = (data ?? []).map((row, index) => {
    const course = (row as { courses?: { code?: string; title?: string } }).courses;
    const courseCode = course?.code ?? coursesById.get(row.course_id)?.code ?? 'COURSE';
    const courseTitle = course?.title ?? coursesById.get(row.course_id)?.title ?? 'Untitled course';

    return {
      id: row.id,
      title: fileNameFromUrl(row.file_url, `Document ${index + 1}`),
      course: `${courseCode} • ${courseTitle}`,
      label: 'Uploaded',
      size: 'Supabase',
      time: shortDate(row.created_at),
    };
  });

  const courseFiles = (data ?? []).map((row, index) => ({
    file: fileNameFromUrl(row.file_url, `Document ${index + 1}`),
    type: 'Supabase File',
    size: 'Stored',
    date: shortDate(row.created_at),
  }));

  return { materials, courseFiles };
}

async function buildAssignmentsSnapshot(accessToken?: string): Promise<AssignmentsSnapshotData | null> {
  const context = await createDepartmentContext(accessToken);
  if (!context) return null;

  const { supabase, coursesById } = context;
  const { data, error } = await supabase
    .from('assignments')
    .select('id, title, description, deadline, course_id, courses:course_id(code, title)')
    .order('deadline');

  if (error) {
    return null;
  }

  const groupedAssignments = new Map<string, AssignmentGroup>();

  (data ?? []).forEach((row) => {
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
        items: [],
      } satisfies AssignmentGroup);

    existing.items.push({
      id: row.id,
      title: row.title,
      detail: deadline ? `Due ${longDate(row.deadline)}` : 'No deadline recorded',
      urgency: deadline && deadline.getTime() <= Date.now() ? 'Urgent' : 'Due Soon',
      daysLeft: relativeDue(row.deadline),
    });
    existing.count = `${existing.items.length} Assignment${existing.items.length === 1 ? '' : 's'}`;
    groupedAssignments.set(key, existing);
  });

  const assignments = [...groupedAssignments.values()];
  const deadlines: DeadlineEntry[] = (data ?? []).map((row) => {
    const course = (row as { courses?: { code?: string } }).courses;
    const courseCode = course?.code ?? coursesById.get(row.course_id)?.code ?? 'COURSE';
    return {
      id: row.id,
      title: row.title,
      course: `${courseCode}`,
      due: relativeDue(row.deadline),
    };
  });

  return { assignments, deadlines };
}

export async function getTimetableSnapshot(accessToken?: string): Promise<TimetableSnapshotResult> {
  if (!supabaseConfigured()) {
    return {
      timetable: [],
      fullTimetable: [],
      activeSession: null,
      hocStats: [
        { label: 'Ongoing Sessions', value: '00', pulse: false },
        { label: 'Remaining Today', value: '00', pulse: false },
        { label: 'Pending Updates', value: '00', pulse: false },
      ],
      error: null,
    };
  }

  const snapshot = await buildTimetableSnapshot(accessToken);
  if (!snapshot) {
    return {
      timetable: [],
      fullTimetable: [],
      activeSession: null,
      hocStats: [
        { label: 'Ongoing Sessions', value: '00', pulse: false },
        { label: 'Remaining Today', value: '00', pulse: false },
        { label: 'Pending Updates', value: '00', pulse: false },
      ],
      error: null,
    };
  }

  return snapshot;
}

export async function getUpdatesSnapshot(accessToken?: string) {
  if (!supabaseConfigured()) {
    return { updates: [] };
  }

  return (await buildUpdatesSnapshot(accessToken)) ?? { updates: [] };
}

export async function getMaterialsSnapshot(accessToken?: string) {
  if (!supabaseConfigured()) {
    return { materials: [], courseFiles: [] };
  }

  return (await buildMaterialsSnapshot(accessToken)) ?? { materials: [], courseFiles: [] };
}

export async function getAssignmentsSnapshot(accessToken?: string) {
  if (!supabaseConfigured()) {
    return { assignments: [], deadlines: [] };
  }

  return (await buildAssignmentsSnapshot(accessToken)) ?? { assignments: [], deadlines: [] };
}

export async function getDashboardSnapshot(accessToken?: string) {
  if (!supabaseConfigured()) {
    return {
      timetable: [],
      activeSession: null,
      updates: [],
      materials: [],
      deadlines: [],
    };
  }

  const [timetableSnapshot, updatesSnapshot, materialsSnapshot, assignmentsSnapshot] = await Promise.all([
    buildTimetableSnapshot(accessToken),
    buildUpdatesSnapshot(accessToken),
    buildMaterialsSnapshot(accessToken),
    buildAssignmentsSnapshot(accessToken),
  ]);

  if (
    !timetableSnapshot ||
    timetableSnapshot.error ||
    !updatesSnapshot ||
    !materialsSnapshot ||
    !assignmentsSnapshot
  ) {
    return {
      timetable: [],
      activeSession: null,
      updates: [],
      materials: [],
      deadlines: [],
    };
  }

  return {
    timetable: timetableSnapshot.timetable,
    activeSession: timetableSnapshot.activeSession,
    updates: updatesSnapshot.updates,
    materials: materialsSnapshot.materials,
    deadlines: assignmentsSnapshot.deadlines,
  };
}

export async function getCourseDetailSnapshot(accessToken?: string) {
  if (!supabaseConfigured()) {
    return {
      timetable: [],
      activeSession: null,
      deadlines: [],
    };
  }

  const [timetableSnapshot, assignmentsSnapshot] = await Promise.all([
    buildTimetableSnapshot(accessToken),
    buildAssignmentsSnapshot(accessToken),
  ]);

  if (!timetableSnapshot || timetableSnapshot.error || !assignmentsSnapshot) {
    return {
      timetable: [],
      activeSession: null,
      deadlines: [],
    };
  }

  return {
    timetable: timetableSnapshot.timetable,
    activeSession: timetableSnapshot.activeSession,
    deadlines: assignmentsSnapshot.deadlines,
  };
}

export async function getHocSnapshot(accessToken?: string): Promise<HocSnapshot> {
  if (!supabaseConfigured()) {
    return {
      timetable: [],
      fullTimetable: [],
      activeSession: null,
      hocStats: [
        { label: 'Ongoing Sessions', value: '00', pulse: false },
        { label: 'Remaining Today', value: '00', pulse: false },
        { label: 'Pending Updates', value: '00', pulse: false },
      ],
      updates: [],
    };
  }

  const [timetableSnapshot, updatesSnapshot] = await Promise.all([
    buildTimetableSnapshot(accessToken),
    buildUpdatesSnapshot(accessToken),
  ]);

  if (!timetableSnapshot || timetableSnapshot.error || !updatesSnapshot) {
    return {
      timetable: [],
      fullTimetable: [],
      activeSession: null,
      hocStats: [
        { label: 'Ongoing Sessions', value: '00', pulse: false },
        { label: 'Remaining Today', value: '00', pulse: false },
        { label: 'Pending Updates', value: '00', pulse: false },
      ],
      updates: [],
    };
  }

  return {
    timetable: timetableSnapshot.timetable,
    fullTimetable: timetableSnapshot.fullTimetable,
    activeSession: timetableSnapshot.activeSession,
    hocStats: [
      timetableSnapshot.hocStats[0],
      timetableSnapshot.hocStats[1],
      { label: 'Pending Updates', value: String(updatesSnapshot.updates.length).padStart(2, '0'), pulse: false },
    ],
    updates: updatesSnapshot.updates,
  };
}

export async function getDepartmentSnapshot(accessToken?: string): Promise<DepartmentSnapshot> {
  if (!supabaseConfigured()) {
    return emptySnapshot;
  }

  try {
    const [timetableSnapshot, updatesSnapshot, materialsSnapshot, assignmentsSnapshot] = await Promise.all([
      buildTimetableSnapshot(accessToken),
      buildUpdatesSnapshot(accessToken),
      buildMaterialsSnapshot(accessToken),
      buildAssignmentsSnapshot(accessToken),
    ]);

    if (
      !timetableSnapshot ||
      timetableSnapshot.error ||
      !updatesSnapshot ||
      !materialsSnapshot ||
      !assignmentsSnapshot
    ) {
      return emptySnapshot;
    }

    return {
      timetable: timetableSnapshot.timetable,
      fullTimetable: timetableSnapshot.fullTimetable,
      assignments: assignmentsSnapshot.assignments,
      materials: materialsSnapshot.materials,
      updates: updatesSnapshot.updates,
      hocStats: [
        timetableSnapshot.hocStats[0],
        timetableSnapshot.hocStats[1],
        { label: 'Pending Updates', value: String(updatesSnapshot.updates.length).padStart(2, '0'), pulse: false },
      ],
      activeSession: timetableSnapshot.activeSession,
      deadlines: assignmentsSnapshot.deadlines,
      courseFiles: materialsSnapshot.courseFiles,
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
    const { createClient } = await import('@/lib/supabase/server');
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
      created_at: data.created_at,
    };
  } catch {
    return null;
  }
}


 
