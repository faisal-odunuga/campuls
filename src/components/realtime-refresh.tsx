'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type RealtimeRefreshProps = {
  accessToken?: string;
  debounceMs?: number;
  events?: ('INSERT' | 'UPDATE' | 'DELETE')[];
  tables: string[];
};

export function RealtimeRefresh({
  accessToken,
  debounceMs = 250,
  events = ['INSERT', 'UPDATE', 'DELETE'],
  tables,
}: RealtimeRefreshProps) {
  const router = useRouter();
  const timeoutRef = useRef<number | null>(null);
  const tablesKey = tables.join('|');
  const eventsKey = events.join('|');

  useEffect(() => {
    if (!accessToken || tables.length === 0) {
      return;
    }

    const supabase = createClient(accessToken);
    const channel = supabase.channel(`campuls-live-${tables.join('-')}`);

    const scheduleRefresh = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        router.refresh();
      }, debounceMs);
    };

    for (const table of tables) {
      for (const event of events) {
        channel.on(
          'postgres_changes',
          {
            event,
            schema: 'public',
            table,
          },
          scheduleRefresh,
        );
      }
    }

    channel.subscribe();

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      void supabase.removeChannel(channel);
    };
  }, [accessToken, debounceMs, events, eventsKey, router, tables, tablesKey]);

  return null;
}
