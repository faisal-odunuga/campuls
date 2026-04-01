import type { HocSnapshot } from '@/lib/supabase/queries';
import { getSessionStatusLabel, getSessionStatusTone, normalizeSessionStatus } from '@/lib/session-status';

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
  return getSessionStatusLabel(row.status);
}

export function getCardStyles(row: SessionRow) {
  const status = normalizeSessionStatus(row.status);

  if (status === 'ongoing') {
    return 'bg-surface-container-lowest p-6 ring-2 ring-secondary/20 shadow-xl shadow-secondary/5';
  }

  if (status === 'postponed') {
    return 'bg-surface-container p-6 opacity-90 border border-tertiary-fixed/25';
  }

  if (status === 'cancelled') {
    return 'bg-error-container/15 p-6 border border-error-container/20 opacity-70';
  }

  return 'bg-surface-container-lowest p-6 hover:bg-white transition-all duration-300';
}

export function getIconTone(row: SessionRow) {
  const tone = getSessionStatusTone(row.status);

  if (tone === 'success') return 'bg-secondary-fixed text-on-secondary-fixed';
  if (tone === 'warning') return 'bg-tertiary-fixed text-on-tertiary-fixed';
  if (tone === 'error') return 'bg-error-container text-on-error-container';
  return 'bg-primary-fixed text-primary';
}

export function formatNoticeCategory(value: string) {
  return value
    ?.replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
