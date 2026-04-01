'use client';

import { type ReactNode } from 'react';
import { Navigation } from '@/components/navigation';
import { Header } from '@/components/header';

type AppChromeProps = {
  title: string;
  searchPlaceholder?: string;
  children: ReactNode;
  userName?: string;
  userSubtitle?: string;
  avatarUrl?: string;
  userRole?: 'student' | 'hoc';
};

export function AppChrome({
  title,
  searchPlaceholder = 'Search resources...',
  children,
  userName = 'Campuls User',
  userSubtitle = 'student',
  avatarUrl = '/icon.svg',
  userRole = 'student',
}: AppChromeProps) {
  return (
    <div className='min-h-screen bg-surface text-on-surface antialiased'>
      <Navigation avatarUrl={avatarUrl} userName={userName} userRole={userRole} userSubtitle={userSubtitle} />
      <main id='main-content' className='min-h-screen md:ml-64'>
        <Header
          avatarUrl={avatarUrl}
          searchPlaceholder={searchPlaceholder}
          title={title}
          userName={userName}
          userSubtitle={userSubtitle}
        />
        <section className='px-3 py-3 pb-20 md:pb-8 md:px-12'>{children}</section>
      </main>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className='mb-6 flex items-end justify-between'>
      <div>
        {eyebrow ? (
          <p className='mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-outline-variant'>
            {eyebrow}
          </p>
        ) : null}
        <h3 className='font-headline text-2xl font-extrabold tracking-tight text-primary'>
          {title}
        </h3>
        {subtitle ? <p className='text-sm font-medium text-outline'>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function SignalBadge({ children }: { children: ReactNode }) {
  return (
    <span className='inline-flex items-center rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-on-secondary-container'>
      {children}
    </span>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: 'success' | 'neutral' | 'warning' | 'error';
  children: ReactNode;
}) {
  const tones = {
    success: 'bg-secondary-container text-on-secondary-container',
    neutral: 'bg-surface-container-highest text-on-surface-variant',
    warning: 'bg-tertiary-fixed text-on-tertiary-fixed',
    error: 'bg-error-container text-on-error-container',
  } as const;

  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}
