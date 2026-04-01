import type { Metadata, Viewport } from 'next';
import './globals.css';

import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { Providers } from '@/components/providers';
import { PwaBoot } from '@/components/pwa-boot';

export const metadata: Metadata = {
  title: {
    default: 'Campuls',
    template: '%s | Campuls'
  },
  description: 'Campuls Department Edition, a mobile-first academic control PWA.',
  applicationName: 'Campuls',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg'
  }
};

export const viewport: Viewport = {
  themeColor: '#f9f9fb'
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html className="light" lang="en">
      <body>
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
          href="#main-content"
        >
          Skip to content
        </a>
        <Providers session={session}>
          <PwaBoot />
          <AppShell session={session}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
