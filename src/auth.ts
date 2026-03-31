import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';
import type { User } from 'next-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function hasSupabaseAuthEnv() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

const authConfig: NextAuthConfig = {
  session: {
    strategy: 'jwt'
  },
  providers: [
    Credentials({
      name: 'Campuls',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').trim();
        const password = String(credentials?.password ?? '');
        const requestedRole = String(credentials?.role ?? 'student') === 'hoc' ? 'hoc' : 'student';

        if (!email || !password) {
          return null;
        }

        if (!hasSupabaseAuthEnv()) {
          return null;
        }

        const authClient = createClient(supabaseUrl!, supabaseAnonKey!, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        });

        const { data, error } = await authClient.auth.signInWithPassword({
          email,
          password
        });

        if (error || !data.user || !data.session) {
          return null;
        }

        let role = requestedRole;
        let level: number | null = null;
        let displayName = data.user.user_metadata?.name ?? data.user.email ?? email;

        if (supabaseServiceRoleKey) {
          const adminClient = createClient(supabaseUrl!, supabaseServiceRoleKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
              detectSessionInUrl: false
            }
          });

          const { data: profile } = await adminClient
            .from('users')
            .select('name, role, level')
            .eq('email', email)
            .maybeSingle();

          if (profile) {
            displayName = profile.name ?? displayName;
            role = profile.role === 'hoc' ? 'hoc' : role;
            level = typeof profile.level === 'number' ? profile.level : null;
          }
        }

        const result = {
          id: data.user.id,
          email: data.user.email ?? email,
          name: displayName,
          role: role as 'student' | 'hoc',
          level,
          supabaseAccessToken: data.session.access_token,
          supabaseRefreshToken: data.session.refresh_token,
          supabaseExpiresAt: data.session.expires_at ?? null
        } satisfies User;

        return result;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? 'student';
        token.level = user.level ?? null;
        token.supabaseAccessToken = user.supabaseAccessToken;
        token.supabaseRefreshToken = user.supabaseRefreshToken;
        token.supabaseExpiresAt = user.supabaseExpiresAt;
      }

      if (
        token.supabaseRefreshToken &&
        typeof token.supabaseExpiresAt === 'number' &&
        Date.now() / 1000 > token.supabaseExpiresAt - 60
      ) {
        if (!hasSupabaseAuthEnv()) {
          return token;
        }

        const refreshClient = createClient(supabaseUrl!, supabaseAnonKey!, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        });

        const { data, error } = await refreshClient.auth.refreshSession({
          refresh_token: token.supabaseRefreshToken
        });

        if (!error && data.session && data.user) {
          token.supabaseAccessToken = data.session.access_token;
          token.supabaseRefreshToken = data.session.refresh_token;
          token.supabaseExpiresAt = data.session.expires_at ?? token.supabaseExpiresAt;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as 'student' | 'hoc' | undefined) ?? 'student';
        session.user.level = (token.level as number | null | undefined) ?? null;
        session.user.id = token.sub ?? session.user.id;
      }

      session.supabaseAccessToken = token.supabaseAccessToken as string | undefined;
      session.supabaseExpiresAt = token.supabaseExpiresAt as number | undefined;

      return session;
    }
  },
  pages: {
    signIn: '/login'
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
