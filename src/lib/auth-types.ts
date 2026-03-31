import type { DefaultSession } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    supabaseAccessToken?: string;
    supabaseExpiresAt?: number;
    user: {
      id?: string;
      role?: 'student' | 'hoc';
      level?: number | null;
    } & DefaultSession['user'];
  }

  interface User {
    role?: 'student' | 'hoc';
    level?: number | null;
    supabaseAccessToken?: string;
    supabaseRefreshToken?: string;
    supabaseExpiresAt?: number | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'student' | 'hoc';
    level?: number | null;
    supabaseAccessToken?: string;
    supabaseRefreshToken?: string;
    supabaseExpiresAt?: number | null;
  }
}
