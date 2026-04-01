export type TimetableEntry = {
  id: string;
  courseId: string | null;
  day: string;
  time: string;
  timeRaw: string;
  range: string;
  code: string;
  title: string;
  lecturer: string;
  venue: string;
  status: string;
  endTime: string | null;
};

export type AssignmentItem = {
  id: string;
  title: string;
  detail: string;
  urgency: string;
  daysLeft: string;
};

export type AssignmentGroup = {
  course: string;
  count: string;
  items: AssignmentItem[];
};

export type MaterialEntry = {
  id: string;
  title: string;
  course: string;
  label: string;
  size: string;
  time: string;
};

export type UpdateEntry = {
  id: string;
  date: string;
  title: string;
  body: string;
  category: string;
  courseCode: string | null;
};

export type NoteEntry = {
  id: string;
  course: string;
  file: string;
  size: string;
};

export type HocStat = {
  label: string;
  value: string;
  pulse: boolean;
};

export type ActiveSession = {
  timetableId: string;
  code: string;
  title: string;
  room: string;
  lecturer: string;
  status: string;
  time: string;
} | null;

export type DeadlineEntry = {
  id: string;
  title: string;
  course: string;
  due: string;
};

export type CourseFileEntry = {
  file: string;
  type: string;
  size: string;
  date: string;
};

export type CoursesById = Map<string, { code: string; title: string }>;
export type CourseRelation =
  | { code?: string; title?: string }
  | { code?: string; title?: string }[]
  | null
  | undefined;

export type TimetableSnapshotData = {
  timetable: TimetableEntry[];
  fullTimetable: TimetableEntry[];
  activeSession: ActiveSession;
  hocStats: HocStat[];
};

export type TimetableSnapshotResult = TimetableSnapshotData & {
  error: string | null;
};

export type UpdatesSnapshotData = {
  updates: UpdateEntry[];
};

export type MaterialsSnapshotData = {
  materials: MaterialEntry[];
  courseFiles: CourseFileEntry[];
};

export type AssignmentsSnapshotData = {
  assignments: AssignmentGroup[];
  deadlines: DeadlineEntry[];
};

export type HocSnapshot = Pick<
  DepartmentSnapshot,
  'timetable' | 'fullTimetable' | 'activeSession' | 'hocStats' | 'updates'
>;

export type DepartmentSnapshot = {
  timetable: TimetableEntry[];
  fullTimetable: TimetableEntry[];
  assignments: AssignmentGroup[];
  materials: MaterialEntry[];
  updates: UpdateEntry[];
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
