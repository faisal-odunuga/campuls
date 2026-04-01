import type { HocSnapshot } from '@/lib/supabase/queries';

export type SessionRow = HocSnapshot['timetable'][number];

export type NoticeCategory = 'announcement' | 'assignment' | 'exam' | 'general';

export type NoticeCategoryOption = {
  value: NoticeCategory;
  label: string;
  tone: 'neutral' | 'primary' | 'warning';
};

export const noticeCategories: NoticeCategoryOption[] = [
  { value: 'announcement', label: 'Announcement', tone: 'neutral' },
  { value: 'assignment', label: 'Assignment', tone: 'primary' },
  { value: 'exam', label: 'Exam', tone: 'warning' },
  { value: 'general', label: 'General', tone: 'neutral' },
];

export function getStatusLabel(row: SessionRow) {
  if (row.status === 'ONGOING') return 'Live Now';
  if (row.status === 'UP NEXT' || row.status === 'SCHEDULED') return 'Upcoming';
  if (row.status === 'POSTPONED') return 'Postponed';
  if (row.status === 'CANCELLED') return 'Cancelled';
  return 'Completed';
}

export function getCardStyles(row: SessionRow) {
  if (row.status === 'ONGOING') {
    return 'bg-surface-container-lowest p-6 ring-2 ring-secondary/20 shadow-xl shadow-secondary/5';
  }

  if (row.status === 'POSTPONED') {
    return 'bg-surface-container p-6 opacity-90 border border-tertiary-fixed/25';
  }

  if (row.status === 'CANCELLED') {
    return 'bg-error-container/15 p-6 border border-error-container/20 opacity-70';
  }

  return 'bg-surface-container-lowest p-6 hover:bg-white transition-all duration-300';
}

export function getIconTone(row: SessionRow) {
  if (row.status === 'ONGOING') return 'bg-secondary-fixed text-on-secondary-fixed';
  if (row.status === 'POSTPONED') return 'bg-tertiary-fixed text-on-tertiary-fixed';
  if (row.status === 'CANCELLED') return 'bg-error-container text-on-error-container';
  return 'bg-primary-fixed text-primary';
}

export function formatNoticeCategory(value: string) {
  return value
    ?.replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
