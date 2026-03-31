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
      }

      if (session?.supabaseAccessToken && session?.user?.role) {
        await saveSessionToken(session.supabaseAccessToken, session.user.role);
      }
    })()
      .then(() => {
        if ('serviceWorker' in navigator) {
          return navigator.serviceWorker.register('/sw.js').catch(() => undefined);
        }
        return undefined;
      })
      .catch(() => undefined);
  }, [session?.supabaseAccessToken, session?.user?.role]);

  return null;
}
