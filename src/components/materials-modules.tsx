'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Download, FileText, FolderOpen } from 'lucide-react';
import type { DepartmentSnapshot } from '@/lib/supabase/queries';

type MaterialEntry = DepartmentSnapshot['materials'][number];

type MaterialsModulesProps = {
  moduleCourses: string[];
  materials: MaterialEntry[];
};

export function MaterialsModules({ moduleCourses, materials }: MaterialsModulesProps) {
  const [openCourse, setOpenCourse] = useState<string | null>(moduleCourses[0] ?? null);

  const materialsByCourse = useMemo(() => {
    return new Map(
      moduleCourses.map((course) => {
        const courseCode = course.includes(' • ') ? course.split(' • ')[0] : course;
        const courseMaterials = materials.filter((material) => material.course.startsWith(courseCode));
        return [course, courseMaterials] as const;
      }),
    );
  }, [materials, moduleCourses]);

  if (!moduleCourses.length) {
    return (
      <div className='rounded-xl border border-surface-container-highest bg-surface-container-lowest p-6 text-sm text-on-surface-variant shadow-sm'>
        No course modules uploaded yet.
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <h3 className='mb-4 font-headline text-xl font-bold text-on-surface'>Course Modules</h3>
      {moduleCourses.map((course) => {
        const courseCode = course.includes(' • ') ? course.split(' • ')[0] : course;
        const courseName = course.includes(' • ') ? course.split(' • ')[1] : course;
        const courseMaterials = materialsByCourse.get(course) ?? [];
        const isOpen = openCourse === course;

        return (
          <div key={course} className='overflow-hidden rounded-xl bg-surface-container-low transition-all duration-300'>
            <button
              className='flex w-full items-center justify-between p-5 text-left'
              onClick={() => setOpenCourse((current) => (current === course ? null : course))}
              type='button'
            >
              <div className='flex items-center gap-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-lowest text-primary shadow-sm'>
                  <FolderOpen className='h-6 w-6' />
                </div>
                <div>
                  <h3 className='font-headline text-lg font-bold leading-tight text-primary'>{courseCode}</h3>
                  <p className='text-xs font-medium text-on-surface-variant'>
                    {courseName} • {courseMaterials.length} Files
                  </p>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-outline transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen ? (
              <div className='space-y-3 px-5 pb-5 pt-1'>
                {courseMaterials.map((file) => (
                  <div
                    key={file.id}
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
                    <button
                      className='flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-primary transition-all hover:bg-primary hover:text-white'
                      type='button'
                    >
                      <Download className='h-4 w-4' />
                    </button>
                  </div>
                ))}
                <button
                  className='mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-label text-xs font-bold uppercase tracking-widest text-white'
                  type='button'
                >
                  <Download className='h-4 w-4' />
                  Download All
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
