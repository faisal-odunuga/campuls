'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ArrowRight, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'hoc'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleContinue() {
    setPending(true);
    setError(null);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      role,
    });

    setPending(false);

    if (result?.error) {
      setError(
        result.error === 'CredentialsSignin'
          ? 'Invalid credentials. Check your email, password, and role, then try again.'
          : 'Sign-in failed. Check the auth configuration and try again.'
      );
      return;
    }

    router.push(role === 'hoc' ? '/hoc' : '/');
  }

  return (
    <div className='min-h-screen bg-surface px-4 py-10 text-on-surface md:px-12'>
      <div className='mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-2'>
        <section className='flex flex-col justify-between rounded-[1.75rem] bg-primary-container p-8 text-white shadow-soft'>
          <div>
            <div className='mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]'>
              <Sparkles className='h-4 w-4' />
              Department Edition
            </div>
            <h1 className='font-headline text-5xl font-extrabold tracking-tight'>Campuls</h1>
            <p className='mt-4 max-w-md text-sm text-indigo-200'>
              Mobile-first academic control with timetable alerts, offline notes, assignments, and
              HOC oversight.
            </p>
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            <div className='rounded-2xl bg-white/10 p-4 backdrop-blur'>
              <ShieldCheck className='h-5 w-5 text-secondary-fixed' />
              <p className='mt-3 text-sm font-semibold'>Supabase auth</p>
            </div>
            <div className='rounded-2xl bg-white/10 p-4 backdrop-blur'>
              <Mail className='h-5 w-5 text-secondary-fixed' />
              <p className='mt-3 text-sm font-semibold'>JWT session</p>
            </div>
            <div className='rounded-2xl bg-white/10 p-4 backdrop-blur'>
              <UserRound className='h-5 w-5 text-secondary-fixed' />
              <p className='mt-3 text-sm font-semibold'>Student and HOC roles</p>
            </div>
          </div>
        </section>

        <section className='rounded-[1.75rem] bg-surface-container-lowest p-8 shadow-soft'>
          <p className='text-[10px] font-bold uppercase tracking-[0.2em] text-outline-variant'>
            Sign in
          </p>
          <h2 className='mt-2 font-headline text-3xl font-bold text-primary'>
            Continue to Campuls
          </h2>
          <p className='mt-2 text-sm text-on-surface-variant'>
            Auth is handled by NextAuth, backed by Supabase credentials and token refresh.
          </p>

          <div className='mt-8 space-y-4'>
            <label className='block'>
              <span className='mb-2 block text-xs font-bold uppercase tracking-widest text-outline'>
                Email
              </span>
              <input
                className='w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm font-medium outline-none ring-0 transition focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(224,224,255,1)]'
                onChange={(event) => setEmail(event.target.value)}
                placeholder='alex.rivera@campus.edu'
                value={email}
              />
            </label>

            <label className='block'>
              <span className='mb-2 block text-xs font-bold uppercase tracking-widest text-outline'>
                Password
              </span>
              <input
                className='w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm font-medium outline-none ring-0 transition focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(224,224,255,1)]'
                onChange={(event) => setPassword(event.target.value)}
                placeholder='••••••••'
                type='password'
                value={password}
              />
            </label>

            <div>
              <span className='mb-2 block text-xs font-bold uppercase tracking-widest text-outline'>
                Role
              </span>
              <div className='grid grid-cols-2 gap-3'>
                <button
                  className={[
                    'rounded-xl px-4 py-3 text-sm font-bold transition',
                    role === 'student'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-on-surface-variant',
                  ].join(' ')}
                  onClick={() => setRole('student')}
                  type='button'
                >
                  Student
                </button>
                <button
                  className={[
                    'rounded-xl px-4 py-3 text-sm font-bold transition',
                    role === 'hoc'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-on-surface-variant',
                  ].join(' ')}
                  onClick={() => setRole('hoc')}
                  type='button'
                >
                  HOC
                </button>
              </div>
            </div>

            <button
              className='flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-4 py-3 font-bold text-on-primary shadow-sm disabled:opacity-70'
              disabled={pending}
              onClick={handleContinue}
              type='button'
            >
              {pending ? 'Signing in...' : 'Continue'} <ArrowRight className='h-4 w-4' />
            </button>

            {error ? <p className='text-sm font-medium text-error'>{error}</p> : null}
          </div>

          <div className='mt-8 rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant'>
            Sign in with a real Supabase-backed account to access your dashboard, timetable,
            materials, and updates.
          </div>

          <div className='mt-6 flex items-center justify-between text-xs font-medium text-outline'>
            <Link href='/signup'>Create account</Link>
            <Link href='/'>Home</Link>
            <Link href='/offline'>Offline view</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
