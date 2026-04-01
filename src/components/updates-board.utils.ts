import type { DepartmentSnapshot } from '@/lib/supabase/queries';

export type UpdateEntry = DepartmentSnapshot['updates'][number];

export type CategoryKey = 'all' | 'assignments' | 'tests' | 'general';

export type CategorySpec = {
  key: CategoryKey;
  label: string;
  tone: 'primary' | 'warning' | 'neutral';
};

export type CategoryCount = CategorySpec & { count: number };

export const categories: CategorySpec[] = [
  { key: 'all', label: 'All Posts', tone: 'primary' },
  { key: 'assignments', label: 'Assignments', tone: 'primary' },
  { key: 'tests', label: 'Tests & Exams', tone: 'warning' },
  { key: 'general', label: 'General', tone: 'neutral' },
];

export function inferCategory(update: UpdateEntry): Exclude<CategoryKey, 'all'> {
  const explicit = update.category?.toLowerCase?.();
  if (explicit === 'assignment' || explicit === 'assignments') {
    return 'assignments';
  }
  if (explicit === 'exam' || explicit === 'test' || explicit === 'tests') {
    return 'tests';
  }
  if (explicit === 'general' || explicit === 'announcement') {
    return 'general';
  }

  const text = `${update.title} ${update.body}`.toLowerCase();

  if (/(assignment|project|submission|lab|report|deadline)/.test(text)) {
    return 'assignments';
  }

  if (/(exam|test|quiz|mid[- ]?term|postpon|revision|assessment)/.test(text)) {
    return 'tests';
  }

  return 'general';
}

export function getCategoryCount(updates: UpdateEntry[], key: CategoryKey) {
  if (key === 'all') {
    return updates.length;
  }

  return updates.filter((update) => inferCategory(update) === key).length;
}

export function getCategoryLabel(update: UpdateEntry) {
  const category = inferCategory(update);
  if (category === 'assignments') return 'Assignment';
  if (category === 'tests') return 'Test';
  return 'General';
}

export function categoryBadgeStyles(tone: CategorySpec['tone']) {
  if (tone === 'warning') {
    return 'bg-tertiary-fixed text-on-tertiary-fixed';
  }

  if (tone === 'neutral') {
    return 'bg-surface-container-highest text-on-surface-variant';
  }

  return 'bg-primary-fixed text-on-primary-fixed-variant';
}

export function categoryPillStyles(tone: CategorySpec['tone']) {
  if (tone === 'warning') {
    return 'bg-tertiary-fixed text-on-tertiary-fixed';
  }

  if (tone === 'neutral') {
    return 'bg-surface-container-highest text-on-surface-variant';
  }

  return 'bg-primary-fixed text-on-primary-fixed-variant';
}
