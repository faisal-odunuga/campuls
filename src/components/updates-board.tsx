'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock3,
  Megaphone,
  PanelLeft,
  Share2,
} from 'lucide-react';
import type { DepartmentSnapshot } from '@/lib/supabase/queries';

type UpdateEntry = DepartmentSnapshot['updates'][number];

type UpdatesBoardProps = {
  updates: UpdateEntry[];
};

type CategoryKey = 'all' | 'assignments' | 'tests' | 'general';

type CategorySpec = {
  key: CategoryKey;
  label: string;
  tone: 'primary' | 'warning' | 'neutral';
};

const categories: CategorySpec[] = [
  { key: 'all', label: 'All Posts', tone: 'primary' },
  { key: 'assignments', label: 'Assignments', tone: 'primary' },
  { key: 'tests', label: 'Tests & Exams', tone: 'warning' },
  { key: 'general', label: 'General', tone: 'neutral' }
];

function inferCategory(update: UpdateEntry): Exclude<CategoryKey, 'all'> {
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

function getCategoryCount(updates: UpdateEntry[], key: CategoryKey) {
  if (key === 'all') {
    return updates.length;
  }

  return updates.filter((update) => inferCategory(update) === key).length;
}

function getCategoryLabel(update: UpdateEntry) {
  const category = inferCategory(update);
  if (category === 'assignments') return 'Assignment';
  if (category === 'tests') return 'Test';
  return 'General';
}

function categoryBadgeStyles(tone: CategorySpec['tone']) {
  if (tone === 'warning') {
    return 'bg-tertiary-fixed text-on-tertiary-fixed';
  }

  if (tone === 'neutral') {
    return 'bg-surface-container-highest text-on-surface-variant';
  }

  return 'bg-primary-fixed text-on-primary-fixed-variant';
}

function categoryPillStyles(tone: CategorySpec['tone']) {
  if (tone === 'warning') {
    return 'bg-tertiary-fixed text-on-tertiary-fixed';
  }

  if (tone === 'neutral') {
    return 'bg-surface-container-highest text-on-surface-variant';
  }

  return 'bg-primary-fixed text-on-primary-fixed-variant';
}

function SectionShell({ children }: { children: ReactNode }) {
  return <div className="rounded-xl bg-surface-container-lowest shadow-sm">{children}</div>;
}

export function UpdatesBoard({ updates }: UpdatesBoardProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');

  const counts = categories.map((category) => ({
    ...category,
    count: getCategoryCount(updates, category.key)
  }));
  const filteredUpdates =
    selectedCategory === 'all'
      ? updates
      : updates.filter((update) => inferCategory(update) === selectedCategory);
  const featuredUpdate = filteredUpdates[0];
  const remainingUpdates = filteredUpdates.slice(1);

  return (
    <div className="mx-auto max-w-5xl pb-24">
      <header className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Official Channel
          </span>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
            Updates Board
          </h1>
          <p className="max-w-lg font-body text-on-surface-variant">
            Verified announcements from the Head of Class. No noise, just essentials.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-outline-variant/10 bg-surface-container px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-secondary pulse-active" />
            <span className="text-sm font-bold text-secondary">Live Sync Active</span>
          </div>
        </div>
      </header>

      <section className="mb-8 space-y-4 lg:hidden">
        <div className="flex items-center gap-2 rounded-full border border-outline-variant/10 bg-surface-container px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-secondary pulse-active" />
          <span className="text-sm font-bold text-secondary">Live Sync Active</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {counts.map((category) => (
            <button
              key={category.key}
              className={[
                'shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all',
                selectedCategory === category.key
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest'
              ].join(' ')}
              onClick={() => setSelectedCategory(category.key)}
              type="button"
            >
              {category.label}
              <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-[10px]">{category.count}</span>
            </button>
          ))}
        </div>

        <div className="rounded-xl bg-primary-container p-6 text-on-primary shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">HOC Contact</p>
            <p className="font-headline text-xl font-bold">Campuls HOC</p>
            <p className="text-xs opacity-70">Department updates and notices</p>
          </div>
          <button
            aria-label="Direct message HOC"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold transition-all hover:bg-white/20"
            type="button"
          >
            Direct Message
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="hidden space-y-6 lg:col-span-3 lg:block">
          <SectionShell>
            <div className="space-y-4 bg-surface-container-low p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Categories</h3>
              <ul className="space-y-2">
                {counts.map((category, index) => {
                  const active = index === 0;
                  return (
                    <li key={category.key}>
                      <button
                        className={[
                          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-all',
                          active
                            ? 'bg-surface-container-lowest text-primary shadow-sm'
                            : 'hover:bg-surface-container-highest text-on-surface-variant'
                        ].join(' ')}
                        type="button"
                      >
                        <span className="font-medium">{category.label}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${categoryBadgeStyles(category.tone)}`}>
                          {category.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </SectionShell>

          <SectionShell>
            <div className="relative space-y-4 overflow-hidden bg-primary-container p-6 text-on-primary">
              <div className="relative z-10">
                <h3 className="mb-1 text-sm font-bold uppercase tracking-widest opacity-80">HOC Contact</h3>
                <p className="font-headline text-lg font-bold">Campuls HOC</p>
                <p className="text-xs opacity-70">Department updates and notices</p>
                <button
                  aria-label="Direct message HOC"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 py-2 text-sm font-bold transition-all hover:bg-white/20"
                  type="button"
                >
                  Direct Message
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <Megaphone className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10" />
            </div>
          </SectionShell>
        </aside>

        <section className="space-y-6 lg:col-span-9">
          <div className="mb-2 flex items-center gap-2 lg:hidden">
            <PanelLeft className="h-4 w-4 text-outline" />
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Updates Feed</span>
          </div>

          {featuredUpdate ? (
            <article className="rounded-xl border-l-4 border-tertiary-fixed-dim bg-surface-container-lowest p-8 shadow-sm transition-all hover:-translate-y-[2px]">
              <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-tertiary-fixed px-4 py-1 text-xs font-black uppercase tracking-tighter text-on-tertiary-fixed">
                    {getCategoryLabel(featuredUpdate)}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-on-surface-variant">
                    <Clock3 className="h-4 w-4" />
                    {featuredUpdate.date}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button aria-label="Bookmark update" className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container" type="button">
                    <Bookmark className="h-4 w-4" />
                  </button>
                  <button aria-label="Share update" className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container" type="button">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h2 className="mb-4 font-headline text-2xl font-bold leading-tight text-on-surface">
                {featuredUpdate.title}
              </h2>
              <div className="space-y-3 font-body leading-relaxed text-on-surface-variant">
                <p>{featuredUpdate.body}</p>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-outline-variant/10 pt-6">
                <span className="text-xs font-bold uppercase text-on-surface-variant">Department Notice</span>
                <button
                  aria-label="Acknowledge notice"
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary"
                  type="button"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Acknowledged
                </button>
              </div>
            </article>
          ) : (
            <article className="rounded-xl border border-surface-container-highest bg-surface-container-lowest p-8 shadow-sm">
              <p className="text-sm text-on-surface-variant">No updates from your department yet. Check back soon.</p>
            </article>
          )}

          {remainingUpdates.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {remainingUpdates.map((update) => {
                const category = inferCategory(update);
                const label = getCategoryLabel(update);
                const tone: CategorySpec['tone'] = category === 'assignments' ? 'primary' : category === 'tests' ? 'warning' : 'neutral';

                return (
                  <article
                    key={update.id}
                    className="rounded-xl border border-surface-container-low bg-surface-container-lowest p-8 shadow-sm transition-all hover:-translate-y-[2px]"
                  >
                    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-4 py-1 text-xs font-black uppercase tracking-tighter ${categoryPillStyles(tone)}`}>
                          {label}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-on-surface-variant">
                          <Clock3 className="h-4 w-4" />
                          {update.date}
                        </span>
                      </div>
                      <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container" type="button">
                        <Bookmark className="h-4 w-4" />
                      </button>
                    </div>

                    <h3 className="mb-4 font-headline text-2xl font-bold leading-tight text-on-surface">
                      {update.title}
                    </h3>
                    <p className="font-body leading-relaxed text-on-surface-variant">{update.body}</p>

                    <div className="mt-8 border-t border-outline-variant/10 pt-6">
                      <Link
                        className="inline-flex items-center gap-2 rounded-lg bg-surface-container-high px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-surface-variant"
                        href={`/hoc/updates/${update.id}`}
                      >
                        Open Details
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>

      <section className="mt-12 rounded-2xl bg-primary-container p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="font-headline text-xl font-bold">Live Board Status</h4>
            <p className="mt-1 text-sm text-indigo-200">Latest posts refresh automatically.</p>
          </div>
          <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
            {updates.length} Active Posts
          </div>
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-indigo-900/40">
          <div className="h-full w-full rounded-full bg-secondary-fixed" />
        </div>
      </section>
    </div>
  );
}
