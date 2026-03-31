import type { Metadata, Viewport } from 'next';
import './globals.css';

import { auth } from '@/auth';
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
        <Providers session={session}>
          <PwaBoot />
          {children}
        </Providers>
      </body>
    </html>
  );
}
