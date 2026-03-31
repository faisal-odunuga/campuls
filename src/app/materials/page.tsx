import { auth } from '@/auth';
import { AppChrome } from '@/components/app-chrome';
import { getDepartmentSnapshot } from '@/lib/supabase/queries';
import { ChevronDown, Download, FolderOpen, FileText, Layers3, Files } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function MaterialsPage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const snapshot = await getDepartmentSnapshot(session.supabaseAccessToken);
  const moduleCourses = Array.from(
    new Map(
      snapshot.materials.map((material) => {
        const [courseCode] = material.course.split(' • ');
        return [courseCode, material.course];
      }),
    ).values(),
  );
  const latestUpload = snapshot.materials[0];
  const totalFiles = snapshot.materials.length;
  const totalCourses = moduleCourses.length;

  return (
    <AppChrome
      avatarUrl={session.user.image ?? undefined}
      title='Materials Hub'
      searchPlaceholder='Search notes and files...'
      userName={session.user.name ?? 'Campuls User'}
      userSubtitle={`${session.user.role ?? 'student'}${session.user.level ? ` • ${session.user.level}` : ''}`}
    >
      <main>
        {/* Header Section */}
        <section className='mb-8'>
          <h2 className='mb-2 font-headline text-3xl font-extrabold tracking-tight text-primary'>
            Materials Hub
          </h2>
          <p className='text-sm font-medium text-on-surface-variant'>
            Course files and notes pulled from your department records.
          </p>
        </section>

        <section className='mb-10 grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
            <div className='mb-3 flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed text-primary'>
                <Files className='h-5 w-5' />
              </div>
              <div>
                <p className='text-[10px] font-bold uppercase tracking-widest text-outline'>
                  Files available
                </p>
                <p className='font-headline text-2xl font-bold text-primary'>
                  {String(totalFiles).padStart(2, '0')}
                </p>
              </div>
            </div>
            <p className='text-xs text-on-surface-variant'>
              Notes stored in Supabase and linked to each course.
            </p>
          </div>

          <div className='rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
            <div className='mb-3 flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container'>
                <Layers3 className='h-5 w-5' />
              </div>
              <div>
                <p className='text-[10px] font-bold uppercase tracking-widest text-outline'>
                  Active courses
                </p>
                <p className='font-headline text-2xl font-bold text-primary'>
                  {String(totalCourses).padStart(2, '0')}
                </p>
              </div>
            </div>
            <p className='text-xs text-on-surface-variant'>
              Grouped from your current materials feed.
            </p>
          </div>

          <div className='rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
            <div className='mb-3 flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary-fixed text-on-tertiary-fixed'>
                <FileText className='h-5 w-5' />
              </div>
              <div>
                <p className='text-[10px] font-bold uppercase tracking-widest text-outline'>
                  Latest upload
                </p>
                <p className='font-headline text-2xl font-bold text-primary'>
                  {latestUpload?.time ?? 'Recently'}
                </p>
              </div>
            </div>
            <p className='text-xs text-on-surface-variant'>
              {latestUpload?.title ?? 'No files uploaded yet.'}
            </p>
          </div>
        </section>

        <section className='mb-12'>
          <div className='mb-6 flex items-end justify-between'>
            <div>
              <h3 className='font-headline text-xl font-bold text-on-surface'>Recently Added</h3>
              <p className='text-sm text-on-surface-variant'>
                Latest files from your department feed.
              </p>
            </div>
            <span className='text-sm font-bold text-primary'>
              {snapshot.materials.length} files
            </span>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {snapshot.materials.slice(0, 3).map((material) => (
              <div
                key={material.title}
                className='group rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:bg-surface-container'
              >
                <div className='mb-4 flex items-start justify-between'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-primary-fixed text-primary'>
                    <FileText className='h-5 w-5' />
                  </div>
                  <span className='rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-secondary-container'>
                    {material.label}
                  </span>
                </div>
                <h4 className='mb-1 truncate font-headline font-bold text-on-surface'>
                  {material.title}
                </h4>
                <p className='mb-4 text-xs text-on-surface-variant'>{material.course}</p>
                <div className='flex items-center justify-between text-[11px] font-medium text-outline'>
                  <span>{material.time}</span>
                  <span>{material.size}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Course Modules List */}
        <div className='space-y-4'>
          <h3 className='mb-4 font-headline text-xl font-bold text-on-surface'>Course Modules</h3>
          {moduleCourses.length ? (
            moduleCourses.map((course) => {
              const courseMaterials = snapshot.materials.filter((material) =>
                material.course.startsWith(course),
              );

              return (
                <div
                  key={course}
                  className='overflow-hidden rounded-xl bg-surface-container-low transition-all duration-300'
                >
                  <div className='flex items-center justify-between p-5'>
                    <div className='flex items-center gap-4'>
                      <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-lowest text-primary shadow-sm'>
                        <FolderOpen className='h-6 w-6' />
                      </div>
                      <div>
                        <h3 className='font-headline text-lg font-bold leading-tight text-primary'>
                          {course.split(' • ')[0]}
                        </h3>
                        <p className='text-xs font-medium text-on-surface-variant'>
                          {course.split(' • ')[1]} • {courseMaterials.length} Files
                        </p>
                      </div>
                    </div>
                    <ChevronDown className='h-4 w-4 text-outline' />
                  </div>

                  <div className='space-y-3 px-5 pb-5 pt-1'>
                    {courseMaterials.map((file) => (
                      <div
                        key={file.title}
                        className='group flex items-center justify-between rounded-lg bg-surface-container-lowest p-4'
                      >
                        <div className='flex items-center gap-3'>
                          <FileText className='h-5 w-5 text-primary' />
                          <div>
                            <p className='text-sm font-semibold text-primary'>{file.title}</p>
                            <p className='text-[11px] font-medium text-outline'>
                              {file.time} • {file.size}
                            </p>
                          </div>
                        </div>
                        <button className='flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-primary transition-all hover:bg-primary hover:text-white'>
                          <Download className='h-4 w-4' />
                        </button>
                      </div>
                    ))}
                    <button className='mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-label text-xs font-bold uppercase tracking-widest text-white'>
                      <Download className='h-4 w-4' />
                      Download All
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className='rounded-xl border border-surface-container-highest bg-surface-container-lowest p-6 text-sm text-on-surface-variant shadow-sm'>
              No course modules uploaded yet.
            </div>
          )}
        </div>
      </main>
    </AppChrome>
  );
}
