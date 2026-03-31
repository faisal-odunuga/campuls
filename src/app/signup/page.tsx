'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, GraduationCap, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react';

type Role = 'student' | 'hoc';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [level, setLevel] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSignup() {
    setPending(true);
    setError(null);
    setSuccess(null);

    const parsedLevel = Number(level);

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        level: Number.isFinite(parsedLevel) ? parsedLevel : null
      })
    });

    const payload = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null;

    setPending(false);

    if (!response.ok) {
      setError(payload?.error ?? 'Signup failed. Check the backend configuration and try again.');
      return;
    }

    setSuccess('Account created. You can now sign in.');
    router.push('/login');
  }

  return (
    <div className='min-h-screen bg-surface px-4 py-10 text-on-surface md:px-12'>
      <div className='mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-2'>
        <section className='flex flex-col justify-between rounded-[1.75rem] bg-primary-container p-8 text-white shadow-soft'>
          <div>
            <div className='mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]'>
              <Sparkles className='h-4 w-4' />
              Create account
            </div>
            <h1 className='font-headline text-5xl font-extrabold tracking-tight'>Campuls</h1>
            <p className='mt-4 max-w-md text-sm text-indigo-200'>
              Register a student or HOC account for the department dashboard, timetable, notes, and assignments.
            </p>
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            <div className='rounded-2xl bg-white/10 p-4 backdrop-blur'>
              <ShieldCheck className='h-5 w-5 text-secondary-fixed' />
              <p className='mt-3 text-sm font-semibold'>Supabase auth</p>
            </div>
            <div className='rounded-2xl bg-white/10 p-4 backdrop-blur'>
              <UserRound className='h-5 w-5 text-secondary-fixed' />
              <p className='mt-3 text-sm font-semibold'>Student and HOC roles</p>
            </div>
            <div className='rounded-2xl bg-white/10 p-4 backdrop-blur'>
              <CheckCircle2 className='h-5 w-5 text-secondary-fixed' />
              <p className='mt-3 text-sm font-semibold'>Profile row created</p>
            </div>
          </div>
        </section>

        <section className='rounded-[1.75rem] bg-surface-container-lowest p-8 shadow-soft'>
          <p className='text-[10px] font-bold uppercase tracking-[0.2em] text-outline-variant'>
            Sign up
          </p>
          <h2 className='mt-2 font-headline text-3xl font-bold text-primary'>
            Create your Campuls account
          </h2>
          <p className='mt-2 text-sm text-on-surface-variant'>
            This creates a Supabase auth user and inserts a matching profile row in `public.users`.
          </p>

          <div className='mt-8 space-y-4'>
            <label className='block'>
              <span className='mb-2 block text-xs font-bold uppercase tracking-widest text-outline'>
                Full name
              </span>
              <input
                className='w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm font-medium outline-none ring-0 transition focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(224,224,255,1)]'
                onChange={(event) => setName(event.target.value)}
                placeholder='Alex Rivera'
                value={name}
              />
            </label>

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
                placeholder='Create a password'
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

            <label className='block'>
              <span className='mb-2 block text-xs font-bold uppercase tracking-widest text-outline'>
                Level
              </span>
              <input
                className='w-full rounded-xl bg-surface-container-highest px-4 py-3 text-sm font-medium outline-none ring-0 transition focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(224,224,255,1)]'
                disabled={role === 'hoc'}
                onChange={(event) => setLevel(event.target.value)}
                placeholder='400'
                value={role === 'hoc' ? '' : level}
              />
            </label>

            <button
              className='flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-4 py-3 font-bold text-on-primary shadow-sm disabled:opacity-70'
              disabled={pending}
              onClick={handleSignup}
              type='button'
            >
              {pending ? 'Creating account...' : 'Create account'} <ArrowRight className='h-4 w-4' />
            </button>

            {error ? <p className='text-sm font-medium text-error'>{error}</p> : null}
            {success ? <p className='text-sm font-medium text-secondary'>{success}</p> : null}
          </div>

          <div className='mt-8 rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant'>
            Sign up with a real account so your profile can be stored in Supabase and used
            across the app.
          </div>

          <div className='mt-6 flex items-center justify-between text-xs font-medium text-outline'>
            <Link href='/login'>Back to login</Link>
            <Link href='/'>Home</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
