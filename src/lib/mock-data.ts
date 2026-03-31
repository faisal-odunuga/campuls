export type Role = 'student' | 'hoc';

export type NavItem = {
  href: string;
  label: string;
  mobileLabel: string;
  icon: string;
};

export const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', mobileLabel: 'Home', icon: 'layout-dashboard' },
  { href: '/timetable', label: 'Timetable', mobileLabel: 'Schedule', icon: 'calendar-days' },
  { href: '/assignments', label: 'Assignments', mobileLabel: 'Tasks', icon: 'clipboard-list' },
  { href: '/materials', label: 'Materials', mobileLabel: 'Study', icon: 'book-open-text' },
  { href: '/updates', label: 'Updates', mobileLabel: 'Inbox', icon: 'bell-ring' }
];

export const user = {
  name: 'Alex Rivera',
  subtitle: 'B.S. CS Senior',
  role: 'student' as Role,
  avatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAMiQAoU_6AhaZKMUwRHCHs8q1rcn-jhzYGQigYaryY7ivbEf_aZFAnRevqnsWGCp4Zgzq2UK2RGoWeG9B5GFqvttT9nEzIr860TxEkzJ7863Gdb5zgSL7WN5lMHiABJRWkyBrXcsGM_3PfoAE28wmSZzAC2q-TG6I383RbgoW1dZF1OWYiy4fBnHSBKULvw0DDKBhVz2XukGbAvKtibNR7ueFXr9SGxGlzj3zvhfGo_3gBsQNm7BM8Kdnf9zUCu2Sx9EjzJdaulF4'
};

export const timetableRows = [
  {
    time: '09:00',
    range: '10:30 AM',
    code: 'CSC301',
    title: 'Advanced Algorithms',
    lecturer: 'Prof. Sarah Jenkins',
    venue: 'Lecture Theatre 4 • Main Wing',
    status: 'ONGOING'
  },
  {
    time: '11:00',
    range: '12:30 PM',
    code: 'CSC302',
    title: 'Database Systems',
    lecturer: 'Dr. Emeka Okafor',
    venue: 'Room 302 • Tech Hub',
    status: 'SCHEDULED'
  },
  {
    time: '14:00',
    range: '03:30 PM',
    code: 'CSC304',
    title: 'Software Engineering',
    lecturer: 'Prof. Laila Hassan',
    venue: 'Innovation Lab',
    status: 'CANCELLED'
  }
];

export const updates = [
  {
    date: 'Oct 22',
    title: 'Final Exam Schedule: Winter Semester 2024',
    body: 'The official exam timetable has been released, with all venues and invigilation groups confirmed.'
  },
  {
    date: 'Oct 20',
    title: 'Career Fair: Tech Giants on Campus',
    body: 'Join us this Friday in the Main Hall for direct conversations with recruiters and alumni.'
  }
];

export const deadlines = [
  {
    title: 'Algorithm Analysis',
    course: 'CSC301 • Prof. Jenkins',
    due: 'Today'
  },
  {
    title: 'Database Normalization Report',
    course: 'CSC302 • Dr. Okafor',
    due: '2 days'
  }
];

export const assignmentGroups = [
  {
    course: 'CSC301: Advanced Algorithms',
    count: '3 Assignments',
    items: [
      {
        title: 'Heuristic Search Optimization',
        detail: 'Practical Lab Report • 15% Grade',
        urgency: 'Urgent',
        daysLeft: '02'
      }
    ]
  },
  {
    course: 'CSC302: Database Systems',
    count: '2 Assignments',
    items: [
      {
        title: 'Normalization Case Study',
        detail: 'Group Paper • 10% Grade',
        urgency: 'Due Soon',
        daysLeft: '04'
      }
    ]
  }
];

export const materials = [
  {
    title: 'Lecture 12: Neural Nets',
    course: 'CSC301 • Prof. Sarah Jenkins',
    label: 'New',
    size: '4.2 MB',
    time: 'Added 2h ago'
  },
  {
    title: 'Database Indexing Guide',
    course: 'CSC302 • Dr. Emeka Okafor',
    label: 'Updated',
    size: '2.8 MB',
    time: 'Added yesterday'
  },
  {
    title: 'UX Critique Notes',
    course: 'DES310 • Prof. Ada Bello',
    label: 'Pinned',
    size: '1.4 MB',
    time: 'Added 3 days ago'
  }
];

export const notes = [
  {
    id: 'note-1',
    course: 'CSC301',
    file: 'Week_04_Graph_Theory.pdf',
    size: '4.2 MB'
  },
  {
    id: 'note-2',
    course: 'CSC302',
    file: 'Lecture_08_Normalization.pdf',
    size: '2.8 MB'
  }
];

export const courseFiles = [
  {
    file: 'Lecture_04_Graph_Theory.pdf',
    type: 'PDF Document',
    size: '4.2 MB',
    date: 'Oct 12, 2023'
  },
  {
    file: 'Lecture_05_Dynamic_Programming.pdf',
    type: 'PDF Document',
    size: '5.1 MB',
    date: 'Oct 15, 2023'
  },
  {
    file: 'Assignment_Brief.docx',
    type: 'DOCX Document',
    size: '824 KB',
    date: 'Oct 18, 2023'
  }
];

export const hocStats = [
  { label: 'Ongoing Sessions', value: '01', pulse: true },
  { label: 'Remaining Today', value: '03', pulse: false },
  { label: 'Pending Updates', value: '08', pulse: false }
];

export const hocActiveSession = {
  code: 'CSC301',
  title: 'Advanced Algorithms',
  room: 'Hall 4B',
  lecturer: 'Prof. Sarah Jenkins',
  status: 'Live Now'
};

export const profileFields = [
  { label: 'ID Number', value: 'CS-2024-9981' },
  { label: 'Institutional Email', value: 'alex.rivera@campus.edu' },
  { label: 'Department', value: 'Computer Science' },
  { label: 'Level', value: '400' }
];
