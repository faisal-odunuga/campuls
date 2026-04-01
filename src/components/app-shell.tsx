'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppChrome } from '@/components/app-chrome';
import type { Session } from 'next-auth';

type AppShellProps = {
  children: ReactNode;
  session: Session | null;
};

const PUBLIC_ROUTES = ['/login', '/signup', '/offline'];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function AppShell({ children, session }: AppShellProps) {
  const pathname = usePathname();

  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  const user = session?.user;
  const role = user?.role ?? 'student';
  const subtitle = `${role}${user?.level ? ` • ${user.level}` : ''}`;

  return (
    <AppChrome
      avatarUrl={user?.image ?? undefined}
      title='Campuls'
      searchPlaceholder='Search resources...'
      userName={user?.name ?? 'Campuls User'}
      userSubtitle={subtitle}
      userRole={role}
    >
      {children}
    </AppChrome>
  );
}
