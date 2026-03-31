'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  return (
    <button
      className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 transition-all duration-200 hover:text-error"
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
  );
}
