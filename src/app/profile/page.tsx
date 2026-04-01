import { auth } from '@/auth';
import { getUserProfile } from '@/lib/supabase/queries';
import { Pencil, Settings2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const profile = await getUserProfile(
    session.user.email ?? undefined,
    session.supabaseAccessToken,
  );
  const displayName = profile?.name ?? session.user.name ?? 'Campuls User';
  const roleLabel = profile?.role === 'hoc' ? 'HOC' : 'Student';
  const userRole = profile?.role === 'hoc' ? 'hoc' : 'student';
  const levelLabel = profile?.level ? `${profile.level}` : 'Not set';

  const fields = [
    { label: 'Name', value: displayName },
    { label: 'Email', value: profile?.email ?? session.user.email ?? 'Not set' },
    { label: 'Role', value: roleLabel },
    { label: 'Level', value: levelLabel },
  ];

  return (
    <>
      <div className='mx-auto max-w-4xl'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-12'>
          <div className='md:col-span-4'>
            <div className='rounded-xl bg-surface-container-lowest p-8 text-center shadow-sm'>
              <div className='relative mb-6 inline-block'>
                <Image
                  alt='User profile'
                  className='h-32 w-32 rounded-full border-4 border-surface-container object-cover'
                  src={session.user.image ?? '/icon.svg'}
                  width={128}
                  height={128}
                />
                <Link
                  aria-label='Edit profile'
                  className='absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white shadow-lg'
                  href='/profile#edit'
                >
                  <Pencil className='h-4 w-4' />
                </Link>
              </div>
              <h2 className='font-headline text-2xl font-bold text-on-surface'>{displayName}</h2>
              <p className='mb-4 text-sm font-medium text-on-surface-variant'>{roleLabel}</p>
              <span className='rounded-full bg-secondary-container px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-secondary-container'>
                Active Profile
              </span>
            </div>
          </div>

          <div className='space-y-6 md:col-span-8'>
            <div className='rounded-xl bg-surface-container-low p-8'>
              <h3 className='mb-6 font-headline text-xl font-bold text-on-surface'>
                Institutional Information
              </h3>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {fields.map((field) => (
                  <div key={field.label} className='space-y-2'>
                    <label className='block pl-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant'>
                      {field.label}
                    </label>
                    <p className='rounded-xl bg-surface-container-highest px-4 py-3 font-medium text-on-surface'>
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className='rounded-xl bg-surface-container-lowest p-8 shadow-sm'>
              <div className='mb-4 flex items-center gap-2 font-headline text-lg font-bold text-primary'>
                <Settings2 className='h-5 w-5' />
                Preferences
              </div>
              <p className='text-sm text-on-surface-variant'>
                Notification and offline preferences are persisted locally, then synced when a
                backend connection is available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
