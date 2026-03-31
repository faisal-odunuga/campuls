import Link from 'next/link';
import { CloudOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 text-on-surface">
      <div className="max-w-lg rounded-[1.75rem] bg-surface-container-lowest p-8 text-center shadow-soft">
        <CloudOff aria-hidden="true" className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-5 font-headline text-3xl font-bold text-primary">You are offline</h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          The app shell is still available locally. Live timetable, assignment, and notes data will reappear when Supabase connectivity returns.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-bold text-on-primary" href="/">
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Retry app
          </Link>
          <Link className="inline-flex items-center gap-2 rounded-xl bg-surface-container px-5 py-2.5 font-bold text-primary" href="/login">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
