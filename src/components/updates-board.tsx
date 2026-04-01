'use client';

import { useState } from 'react';
import type { CategoryKey, CategorySpec, UpdateEntry } from '@/components/updates-board.utils';
import {
  categories,
  getCategoryCount,
  getCategoryLabel,
  inferCategory,
} from '@/components/updates-board.utils';
import {
  EmptyUpdatesCard,
  FeaturedUpdateCard,
  MobileCategoryBar,
  MobileContactCard,
  MobileTopStrip,
  SectionShell,
  UpdateListCard,
  UpdatesFeedHeader,
  UpdatesSidebar,
} from '@/components/updates-board-parts';

type UpdatesBoardProps = {
  updates: UpdateEntry[];
};

export function UpdatesBoard({ updates }: UpdatesBoardProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');

  const counts = categories.map((category) => ({
    ...category,
    count: getCategoryCount(updates, category.key),
  }));
  const filteredUpdates =
    selectedCategory === 'all'
      ? updates
      : updates.filter((update) => inferCategory(update) === selectedCategory);
  const featuredUpdate = filteredUpdates[0];
  const remainingUpdates = filteredUpdates.slice(1);

  return (
    <div className='mx-auto max-w-5xl pb-24'>
      <header className='mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end'>
        <div className='space-y-2'>
          <span className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
            Official Channel
          </span>
          <h1 className='font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl'>
            Updates Board
          </h1>
          <p className='max-w-lg font-body text-on-surface-variant'>
            Verified announcements from the Head of Class. No noise, just essentials.
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2 rounded-full border border-outline-variant/10 bg-surface-container px-4 py-2'>
            <span className='h-2 w-2 rounded-full bg-secondary pulse-active' />
            <span className='text-sm font-bold text-secondary'>Realtime Enabled</span>
          </div>
        </div>
      </header>

      <MobileTopStrip />
      <MobileCategoryBar counts={counts} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      <div className='lg:hidden'>
        <MobileContactCard />
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
        <UpdatesSidebar counts={counts} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

        <section className='space-y-6 lg:col-span-9'>
          <UpdatesFeedHeader />

          {featuredUpdate ? <FeaturedUpdateCard update={featuredUpdate} /> : <EmptyUpdatesCard />}

          {remainingUpdates.length > 0 ? (
            <div className='grid grid-cols-1 gap-6'>
              {remainingUpdates.map((update) => {
                const category = inferCategory(update);
                const tone: CategorySpec['tone'] = category === 'assignments' ? 'primary' : category === 'tests' ? 'warning' : 'neutral';

                return <UpdateListCard key={update.id} tone={tone} update={update} />;
              })}
            </div>
          ) : null}
        </section>
      </div>

      <section className='mt-12 rounded-2xl bg-primary-container p-6 text-white shadow-sm'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h4 className='font-headline text-xl font-bold'>Live Board Status</h4>
            <p className='mt-1 text-sm text-indigo-200'>Latest posts refresh automatically.</p>
          </div>
          <div className='rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm'>
            {updates.length} Active Posts
          </div>
        </div>
        <div className='mt-6 h-2 overflow-hidden rounded-full bg-indigo-900/40'>
          <div className='h-full w-full rounded-full bg-secondary-fixed' />
        </div>
      </section>
    </div>
  );
}
