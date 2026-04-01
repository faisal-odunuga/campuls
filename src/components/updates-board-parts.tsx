'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock3,
  Megaphone,
  PanelLeft,
  Share2,
} from 'lucide-react';
import type { CategoryCount, CategorySpec, UpdateEntry } from '@/components/updates-board.utils';
import { categoryBadgeStyles, categoryPillStyles, getCategoryLabel } from '@/components/updates-board.utils';

export function SectionShell({ children }: { children: ReactNode }) {
  return <div className='rounded-xl bg-surface-container-lowest shadow-sm'>{children}</div>;
}

export function MobileTopStrip() {
  return (
    <section className='mb-8 space-y-4 lg:hidden'>
      <div className='flex items-center gap-2 rounded-full border border-outline-variant/10 bg-surface-container px-4 py-2'>
        <span className='h-2 w-2 rounded-full bg-secondary pulse-active' />
        <span className='text-sm font-bold text-secondary'>Realtime Enabled</span>
      </div>
    </section>
  );
}

export function MobileCategoryBar({
  counts,
  selectedCategory,
  onSelectCategory,
}: {
  counts: CategoryCount[];
  selectedCategory: string;
  onSelectCategory: (value: CategorySpec['key']) => void;
}) {
  return (
    <div className='flex gap-2 overflow-x-auto pb-1'>
      {counts.map((category) => (
        <button
          key={category.key}
          className={[
            'shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all',
            selectedCategory === category.key
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest',
          ].join(' ')}
          onClick={() => onSelectCategory(category.key)}
          type='button'
        >
          {category.label}
          <span className='ml-2 rounded-full bg-white/15 px-2 py-0.5 text-[10px]'>{category.count}</span>
        </button>
      ))}
    </div>
  );
}

export function MobileContactCard() {
  return (
    <div className='rounded-xl bg-primary-container p-6 text-on-primary shadow-sm'>
      <div className='space-y-1'>
        <p className='text-xs font-bold uppercase tracking-widest opacity-80'>HOC Contact</p>
        <p className='font-headline text-xl font-bold'>Campuls HOC</p>
        <p className='text-xs opacity-70'>Department updates and notices</p>
      </div>
      <button
        aria-label='Direct message HOC'
        className='mt-4 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60'
        disabled
        title='Direct message action coming soon'
        type='button'
      >
        Direct Message
        <ArrowRight className='h-4 w-4' />
      </button>
    </div>
  );
}

export function UpdatesSidebar({
  counts,
  selectedCategory,
  onSelectCategory,
}: {
  counts: CategoryCount[];
  selectedCategory: string;
  onSelectCategory: (value: CategorySpec['key']) => void;
}) {
  return (
    <aside className='hidden space-y-6 lg:col-span-3 lg:block'>
      <SectionShell>
        <div className='space-y-4 bg-surface-container-low p-6'>
          <h3 className='text-xs font-black uppercase tracking-widest text-on-surface-variant'>Categories</h3>
          <ul className='space-y-2'>
            {counts.map((category) => {
              const active = selectedCategory === category.key;
              return (
                <li key={category.key}>
                  <button
                    className={[
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-all',
                      active
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'hover:bg-surface-container-highest text-on-surface-variant',
                    ].join(' ')}
                    onClick={() => onSelectCategory(category.key)}
                    type='button'
                  >
                    <span className='font-medium'>{category.label}</span>
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
        <div className='relative space-y-4 overflow-hidden bg-primary-container p-6 text-on-primary'>
          <div className='relative z-10'>
            <h3 className='mb-1 text-sm font-bold uppercase tracking-widest opacity-80'>HOC Contact</h3>
            <p className='font-headline text-lg font-bold'>Campuls HOC</p>
            <p className='text-xs opacity-70'>Department updates and notices</p>
            <button
              aria-label='Direct message HOC'
              className='mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 py-2 text-sm font-bold transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60'
              disabled
              title='Direct message action coming soon'
              type='button'
            >
              Direct Message
              <ArrowRight className='h-4 w-4' />
            </button>
          </div>
          <Megaphone className='absolute -bottom-4 -right-4 h-24 w-24 opacity-10' />
        </div>
      </SectionShell>
    </aside>
  );
}

export function FeaturedUpdateCard({ update }: { update: UpdateEntry }) {
  return (
    <article className='rounded-xl border-l-4 border-tertiary-fixed-dim bg-surface-container-lowest p-8 shadow-sm transition-all hover:-translate-y-[2px]'>
      <div className='mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div className='flex flex-wrap items-center gap-3'>
          <span className='rounded-full bg-tertiary-fixed px-4 py-1 text-xs font-black uppercase tracking-tighter text-on-tertiary-fixed'>
            {getCategoryLabel(update)}
          </span>
          <span className='flex items-center gap-1 text-sm text-on-surface-variant'>
            <Clock3 className='h-4 w-4' />
            {update.date}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <button aria-label='Bookmark update' className='rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60' disabled title='Bookmark action coming soon' type='button'>
            <Bookmark className='h-4 w-4' />
          </button>
          <button aria-label='Share update' className='rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60' disabled title='Share action coming soon' type='button'>
            <Share2 className='h-4 w-4' />
          </button>
        </div>
      </div>

      <h2 className='mb-4 font-headline text-2xl font-bold leading-tight text-on-surface'>
        {update.title}
      </h2>
      <div className='space-y-3 font-body leading-relaxed text-on-surface-variant'>
        <p>{update.body}</p>
      </div>

      <div className='mt-8 flex items-center justify-between border-t border-outline-variant/10 pt-6'>
        <span className='text-xs font-bold uppercase text-on-surface-variant'>Department Notice</span>
        <button
          aria-label='Acknowledge notice'
          className='flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary disabled:cursor-not-allowed disabled:opacity-60'
          disabled
          title='Acknowledgement action coming soon'
          type='button'
        >
          <CheckCircle2 className='h-4 w-4' />
          Acknowledged
        </button>
      </div>
    </article>
  );
}

export function EmptyUpdatesCard() {
  return (
    <article className='rounded-xl border border-surface-container-highest bg-surface-container-lowest p-8 shadow-sm'>
      <p className='text-sm text-on-surface-variant'>No updates from your department yet. Check back soon.</p>
    </article>
  );
}

export function UpdateListCard({ update, tone }: { update: UpdateEntry; tone: CategorySpec['tone'] }) {
  return (
    <article className='rounded-xl border border-surface-container-low bg-surface-container-lowest p-8 shadow-sm transition-all hover:-translate-y-[2px]'>
      <div className='mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div className='flex flex-wrap items-center gap-3'>
          <span className={`rounded-full px-4 py-1 text-xs font-black uppercase tracking-tighter ${categoryPillStyles(tone)}`}>
            {getCategoryLabel(update)}
          </span>
          <span className='flex items-center gap-1 text-sm text-on-surface-variant'>
            <Clock3 className='h-4 w-4' />
            {update.date}
          </span>
        </div>
        <button className='rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container' type='button'>
          <Bookmark className='h-4 w-4' />
        </button>
      </div>

      <h3 className='mb-4 font-headline text-2xl font-bold leading-tight text-on-surface'>
        {update.title}
      </h3>
      <p className='font-body leading-relaxed text-on-surface-variant'>{update.body}</p>

      <div className='mt-8 border-t border-outline-variant/10 pt-6'>
        <Link
          className='inline-flex items-center gap-2 rounded-lg bg-surface-container-high px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-surface-variant'
          href={`/hoc/updates/${update.id}`}
        >
          Open Details
          <ArrowRight className='h-4 w-4' />
        </Link>
      </div>
    </article>
  );
}

export function UpdatesFeedHeader() {
  return (
    <div className='mb-2 flex items-center gap-2 lg:hidden'>
      <PanelLeft className='h-4 w-4 text-outline' />
      <span className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>Updates Feed</span>
    </div>
  );
}
