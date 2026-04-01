function SkeletonLine({ className = '' }: { className?: string }) {
  return <div aria-hidden='true' className={`animate-pulse rounded-full bg-surface-container-high ${className}`} />;
}

function SkeletonCard() {
  return (
    <div className='rounded-2xl bg-surface-container-lowest p-5 shadow-sm'>
      <div className='mb-4 flex items-start justify-between gap-4'>
        <SkeletonLine className='h-10 w-10 rounded-xl' />
        <SkeletonLine className='h-6 w-20' />
      </div>
      <SkeletonLine className='h-5 w-3/4' />
      <SkeletonLine className='mt-3 h-4 w-full' />
      <SkeletonLine className='mt-2 h-4 w-2/3' />
    </div>
  );
}

export default function Loading() {
  return (
    <main aria-busy='true' aria-live='polite' className='mx-auto max-w-[1400px] space-y-8 px-3 py-3 md:px-12 md:py-8'>
      <section className='rounded-[1.75rem] border border-surface-container-high bg-surface-container-lowest p-6 shadow-sm md:p-8'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-3'>
            <SkeletonLine className='h-3 w-28' />
            <SkeletonLine className='h-9 w-72 rounded-xl' />
            <SkeletonLine className='h-4 w-96 max-w-full' />
          </div>
          <SkeletonLine className='h-11 w-40 rounded-xl' />
        </div>
      </section>

      <section className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </section>

      <section className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2 space-y-4 rounded-3xl bg-surface-container-lowest p-6 shadow-sm'>
          <SkeletonLine className='h-6 w-44' />
          <SkeletonLine className='h-4 w-72' />
          <div className='space-y-3 pt-3'>
            <SkeletonLine className='h-20 w-full rounded-2xl' />
            <SkeletonLine className='h-20 w-full rounded-2xl' />
            <SkeletonLine className='h-20 w-11/12 rounded-2xl' />
          </div>
        </div>

        <div className='space-y-4 rounded-3xl bg-surface-container-lowest p-6 shadow-sm'>
          <SkeletonLine className='h-6 w-36' />
          <SkeletonLine className='h-4 w-full' />
          <SkeletonLine className='h-4 w-5/6' />
          <SkeletonLine className='h-4 w-2/3' />
        </div>
      </section>
    </main>
  );
}
