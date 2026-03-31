'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  ArrowRight,
  Bell,
  BookOpenText,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  UserRound,
  Zap
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  mobileLabel: string;
  icon: 'layout-dashboard' | 'calendar-days' | 'clipboard-list' | 'book-open-text' | 'bell-ring';
};

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', mobileLabel: 'Home', icon: 'layout-dashboard' },
  { href: '/timetable', label: 'Timetable', mobileLabel: 'Schedule', icon: 'calendar-days' },
  { href: '/assignments', label: 'Assignments', mobileLabel: 'Tasks', icon: 'clipboard-list' },
  { href: '/materials', label: 'Materials', mobileLabel: 'Study', icon: 'book-open-text' },
  { href: '/updates', label: 'Updates', mobileLabel: 'Inbox', icon: 'bell-ring' }
];

const navIconMap: Record<NavItem['icon'], LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'calendar-days': CalendarDays,
  'clipboard-list': ClipboardList,
  'book-open-text': BookOpenText,
  'bell-ring': Bell
} as const;

type AppChromeProps = {
  title: string;
  searchPlaceholder?: string;
  children: ReactNode;
  userName?: string;
  userSubtitle?: string;
  avatarUrl?: string;
};

export function AppChrome({
  title,
  searchPlaceholder = 'Search resources...',
  children,
  userName = 'Campuls User',
  userSubtitle = 'student',
  avatarUrl = '/icon.svg'
}: AppChromeProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased">
      <aside className="hidden md:flex fixed left-0 top-0 z-50 h-screen w-64 flex-col border-r border-surface-container bg-slate-100 p-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="mb-10">
          <h1 className="font-headline text-lg font-black uppercase tracking-widest text-indigo-900 dark:text-indigo-200">
            Campuls
          </h1>
          <div className="mt-6 flex items-center gap-3">
            <img alt="User Avatar" className="h-10 w-10 rounded-xl object-cover" src={avatarUrl} />
            <div>
              <p className="font-headline text-sm font-bold text-indigo-900 dark:text-indigo-300">{userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{userSubtitle}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = navIconMap[item.icon];
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                className={[
                  'flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200',
                  active
                    ? 'bg-white text-indigo-900 shadow-sm dark:bg-slate-800 dark:text-indigo-100'
                    : 'text-slate-500 hover:bg-slate-200 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-700'
                ].join(' ')}
                href={item.href}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 border-t border-slate-200 pt-6 dark:border-slate-800">
          <button
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-4 py-3 text-sm font-bold text-on-primary shadow-sm"
            onClick={() => router.push('/hoc')}
            type="button"
          >
            <Zap className="h-4 w-4" />
            HOC Console
          </button>
          <Link className="flex items-center gap-3 px-4 py-3 text-slate-500 transition-all duration-200 hover:text-indigo-600 dark:text-slate-400" href="/profile">
            <UserRound className="h-5 w-5" />
            <span className="font-medium">Profile</span>
          </Link>
          <button
            className="flex items-center gap-3 px-4 py-3 text-slate-500 transition-all duration-200 hover:text-error"
            onClick={async () => {
              try {
                await fetch('/api/auth/supabase-signout', { method: 'POST' });
              } finally {
                await signOut({ callbackUrl: '/login' });
              }
            }}
            type="button"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="min-h-screen md:ml-64">
        <header className="sticky top-0 z-40 flex w-full items-center justify-between bg-slate-50 px-4 py-4 dark:bg-slate-950 md:px-12">
          <div className="flex items-center gap-8">
            <div className="font-headline text-2xl font-extrabold tracking-tight text-primary md:hidden">Campuls</div>
            <h2 className="hidden font-headline text-xl font-bold tracking-tight text-primary md:block">{title}</h2>
            <div className="hidden w-96 items-center rounded-full bg-surface-container px-4 py-2 lg:flex">
              <Search className="mr-2 h-4 w-4 text-outline" />
              <input
                aria-label="Search resources"
                className="w-full border-none bg-transparent text-sm font-medium outline-none focus:ring-0"
                placeholder={searchPlaceholder}
                type="search"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-200/50" type="button">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-error" />
            </button>
            <div className="hidden h-10 w-px bg-slate-200 md:block" />
            <div className="flex items-center gap-3">
              <span className="hidden text-right sm:block">
                <span className="block text-xs font-bold text-primary">{userName}</span>
                <span className="block text-[10px] font-medium tracking-tight text-outline">{userSubtitle}</span>
              </span>
              <Link className="relative" href="/profile">
                <img alt="User Avatar" className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm" src={avatarUrl} />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-secondary" />
              </Link>
            </div>
          </div>
        </header>

        <section className="px-3 py-3 pb-20 md:pb-8 md:px-12">{children}</section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-surface-container bg-white px-2 py-3 md:hidden">
        <Link className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-primary' : 'text-slate-400'}`} href="/">
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link className={`flex flex-col items-center gap-1 ${isActive('/timetable') ? 'text-primary' : 'text-slate-400'}`} href="/timetable">
          <CalendarDays className="h-5 w-5" />
          <span className="text-[10px] font-medium">Schedule</span>
        </Link>
        <button
          className="relative -top-6 rounded-full bg-primary p-4 text-white shadow-lg"
          onClick={() => router.push('/hoc')}
          type="button"
        >
          <Zap className="h-5 w-5" />
          <span className="sr-only">Open HOC Console</span>
        </button>
        <Link className={`flex flex-col items-center gap-1 ${isActive('/materials') ? 'text-primary' : 'text-slate-400'}`} href="/materials">
          <BookOpenText className="h-5 w-5" />
          <span className="text-[10px] font-medium">Study</span>
        </Link>
        <Link className={`flex flex-col items-center gap-1 ${isActive('/updates') ? 'text-primary' : 'text-slate-400'}`} href="/updates">
          <Bell className="h-5 w-5" />
          <span className="text-[10px] font-medium">Inbox</span>
        </Link>
      </nav>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        {eyebrow ? <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-outline-variant">{eyebrow}</p> : null}
        <h3 className="font-headline text-2xl font-extrabold tracking-tight text-primary">{title}</h3>
        {subtitle ? <p className="text-sm font-medium text-outline">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function SignalBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-on-secondary-container">
      {children}
    </span>
  );
}

export function StatusPill({
  tone,
  children
}: {
  tone: 'success' | 'neutral' | 'warning' | 'error';
  children: ReactNode;
}) {
  const tones = {
    success: 'bg-secondary-container text-on-secondary-container',
    neutral: 'bg-surface-container-highest text-on-surface-variant',
    warning: 'bg-tertiary-fixed text-on-tertiary-fixed',
    error: 'bg-error-container text-on-error-container'
  } as const;

  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tones[tone]}`}>{children}</span>;
}
