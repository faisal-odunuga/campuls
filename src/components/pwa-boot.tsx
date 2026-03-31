'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { saveSessionToken } from '@/lib/offline/db';

export function PwaBoot() {
  const { data: session } = useSession();

  useEffect(() => {
    void (async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(async (registration) => {
            if (registration.active?.scriptURL.includes('/sw.js')) {
              await registration.unregister();
            }
          })
        );

        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key.startsWith('campusos-')).map((key) => caches.delete(key)));

        try {
          await navigator.serviceWorker.register('/sw.js');
        } catch (error) {
          console.error('Failed to register service worker', error);
        }
      }
    })().catch((error) => {
      console.error('PWA boot effect failed', error);
    });
  }, []);

  useEffect(() => {
    if (session?.supabaseAccessToken && session?.user?.role) {
      void saveSessionToken(session.supabaseAccessToken, session.user.role);
    }
  }, [session?.supabaseAccessToken, session?.user?.role]);

  return null;
}
