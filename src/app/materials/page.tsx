import { auth } from '@/auth';
import { MaterialsModules } from '@/components/materials-modules';
import { getMaterialsSnapshot } from '@/lib/supabase/queries';
import { FileText, Layers3, Files } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function MaterialsPage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const snapshot = await getMaterialsSnapshot(session.supabaseAccessToken);
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
    <>
      <main>
        {/* Header Section */}
        <section className='mb-8'>
          <div>
            <h2 className='mb-2 font-headline text-3xl font-extrabold tracking-tight text-primary'>
              Materials Hub
            </h2>
            <p className='text-sm font-medium text-on-surface-variant'>
              Course files and materials pulled from your department records.
            </p>
          </div>
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
              Materials stored in Supabase and linked to each course.
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
                key={material.id}
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

        <MaterialsModules moduleCourses={moduleCourses} materials={snapshot.materials} />
      </main>
    </>
  );
}
