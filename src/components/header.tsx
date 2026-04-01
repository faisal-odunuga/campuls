'use client';

import { Bell, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type HeaderProps = {
  title: string;
  searchPlaceholder?: string;
  userName?: string;
  userSubtitle?: string;
  avatarUrl?: string;
};

export function Header({
  title,
  searchPlaceholder = 'Search resources...',
  userName = 'Campuls User',
  userSubtitle = 'student',
  avatarUrl = '/icon.svg',
}: HeaderProps) {
  return (
    <header className='sticky top-0 z-40 flex w-full items-center justify-between bg-slate-50 px-4 py-4 dark:bg-slate-950 md:px-12'>
      <div className='flex items-center gap-8'>
        <div className='font-headline text-2xl font-extrabold tracking-tight text-primary md:hidden'>
          Campuls
        </div>
        <h2 className='hidden font-headline text-xl font-bold tracking-tight text-primary md:block'>
          {title}
        </h2>
        <div className='hidden w-96 items-center rounded-full bg-surface-container px-4 py-2 lg:flex'>
          <Search className='mr-2 h-4 w-4 text-outline' />
          <input
            aria-label='Search resources'
            className='w-full border-none bg-transparent text-sm font-medium outline-none focus:ring-0'
            placeholder={searchPlaceholder}
            type='search'
          />
        </div>
      </div>

      <div className='flex items-center gap-4 md:gap-6'>
        <button
          aria-describedby='notification-status'
          aria-label='Notifications'
          className='relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-200/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
          type='button'
        >
          <Bell className='h-5 w-5' />
          <span
            className='absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-error'
            aria-hidden='true'
          />
          <span className='sr-only' id='notification-status'>
            You have new notifications
          </span>
        </button>
        <div className='hidden h-10 w-px bg-slate-200 md:block' />
        <div className='flex items-center gap-3'>
          <span className='hidden text-right sm:block'>
            <span className='block text-xs font-bold text-primary'>{userName}</span>
            <span className='block text-[10px] font-medium tracking-tight text-outline'>
              {userSubtitle}
            </span>
          </span>
          <Link className='relative' href='/profile'>
            <Image
              alt='User Avatar'
              className='h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm'
              src={avatarUrl}
              width={40}
              height={40}
            />
            <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-secondary' />
          </Link>
        </div>
      </div>
    </header>
  );
}
