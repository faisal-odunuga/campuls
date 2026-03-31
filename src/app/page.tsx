// export const dynamic = 'force-dynamic';
// import { auth } from '@/auth';
// import Link from 'next/link';
// import { redirect } from 'next/navigation';
// import { AppChrome } from '@/components/app-chrome';
// import { getDepartmentSnapshot } from '@/lib/supabase/queries';
// import {
//   ArrowRight,
//   CalendarX,
//   MoreVertical,
//   Podcast,
//   Newspaper,
//   Layers3,
//   Paperclip,
// } from 'lucide-react';

// export default async function DashboardPage() {
//   const session = await auth();
//   if (!session) {
//     redirect('/login');
//   }

//   const snapshot = await getDepartmentSnapshot(session.supabaseAccessToken);
//   const activeSession = snapshot.activeSession;
//   // console.log(activeSession)
//   const todayLabel = new Intl.DateTimeFormat('en-US', {
//     weekday: 'long',
//     month: 'short',
//     day: 'numeric',
//     timeZone: 'Africa/Lagos'
//   }).format(new Date());
//   const todayWeekday = new Intl.DateTimeFormat('en-US', {
//     weekday: 'long',
//     timeZone: 'Africa/Lagos'
//   }).format(new Date());
//   // timetable is already filtered to today's day by the DB query
//   const todaysSchedule = snapshot.timetable;

//   return (
//     <AppChrome
//       title="Dashboard"
//       avatarUrl={session.user.image ?? undefined}
//       searchPlaceholder="Search courses, materials..."
//       userName={session.user.name ?? 'Campuls User'}
//       userSubtitle={`${session.user.role ?? 'student'}${session.user.level ? ` • ${session.user.level}` : ''}`}
//     >
//       <div className="mx-auto max-w-[1400px] ">
//         {/* 'Class Started' Signal Banner */}
//         <section className="mb-10">
//           {activeSession ? (
//             <div className="glass-effect pulse-signal flex flex-col justify-between gap-4 rounded-xl border-l-4 border-secondary p-6 md:flex-row md:items-center">
//             <div className="flex items-center gap-5">
//               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
//                 <Podcast className="h-5 w-5" />
//               </div>
//               <div>
//                 <span className="mb-1 inline-block rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-on-secondary-container">
//                   Live Now
//                 </span>
//                 <h2 className="font-headline text-xl font-bold tracking-tight text-primary">
//                   {activeSession ? `${activeSession.code}: ${activeSession.title}` : 'No active session'}
//                 </h2>
//                 <p className="font-medium text-sm text-on-surface-variant">
//                   {activeSession ? `${activeSession.room} • ${activeSession.lecturer}` : 'No classes are scheduled right now.'}
//                 </p>
//               </div>
//             </div>
//               <div className="flex items-center gap-3">
//                 <Link href={`/course-detail?session=${activeSession.timetableId}`} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-on-primary shadow-sm transition-all hover:opacity-90">
//                   Join Stream
//                 </Link>
//                 <Link href="/materials" className="rounded-lg bg-surface-container-highest px-6 py-2.5 text-sm font-bold text-primary transition-all hover:bg-surface-dim">
//                 View Resources
//               </Link>
//             </div>
//           </div>
//           ) : (
//             <div className="rounded-xl border-l-4 border-surface-container-highest bg-surface-container-lowest p-6">
//               <h2 className="font-headline text-xl font-bold tracking-tight text-primary">No active session</h2>
//               <p className="mt-2 font-medium text-sm text-on-surface-variant">
//                 No classes are scheduled right now. Check timetable updates for the next session.
//               </p>
//             </div>
//           )}
//         </section>

//         {/* Grid Layout */}
//         <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
//           {/* Today's Schedule (Left Column) */}
//           <div className="space-y-8 lg:col-span-8">
//             <section>
//               <div className="mb-6 flex items-end justify-between">
//                 <div>
//                   <h3 className="font-headline text-2xl font-extrabold tracking-tight text-primary">Today&apos;s Schedule</h3>
//                   <p className="font-medium text-sm text-outline">{todayLabel}</p>
//                 </div>
//               <Link href="/timetable" className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
//                   Full Calendar <ArrowRight className="h-4 w-4" />
//                 </Link>
//               </div>
//               <div className="space-y-4">
//                 {todaysSchedule.length > 0 ? todaysSchedule.map((row) => {
//                   const isOngoing = row.status === 'ONGOING';
//                   const isCancelled = row.status === 'CANCELLED';
//                   const isScheduled = row.status === 'SCHEDULED' || row.status === 'UP NEXT';

//                   return (
//                     <div key={`${row.code}-${row.time}`} className={`flex items-center gap-6 rounded-xl p-6 transition-all ${isCancelled ? 'opacity-60 bg-surface-container-lowest' : 'bg-surface-container-lowest hover:bg-slate-50 border border-transparent hover:border-outline-variant/20'}`}>
//                       <div className="w-20 text-center">
//                         <p className="font-headline text-lg font-black text-primary">{row.time.split(' ')[0]}</p>
//                         <p className="font-bold text-[10px] uppercase text-outline">{row.time}</p>
//                       </div>
//                       <div className="flex-1">
//                         <div className="mb-1 flex items-center gap-2">
//                           <h4 className={`font-bold text-primary ${isCancelled ? 'line-through' : ''}`}>
//                             {row.code}: {row.title}
//                           </h4>
//                           {isOngoing && (
//                             <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-on-secondary-container">ONGOING</span>
//                           )}
//                           {isScheduled && (
//                             <span className="rounded-full bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">SCHEDULED</span>
//                           )}
//                           {isCancelled && (
//                             <span className="rounded-full bg-error-container px-2 py-0.5 text-[10px] font-bold uppercase text-on-error-container">Cancelled</span>
//                           )}
//                         </div>
//                         <p className="text-xs text-on-surface-variant">{row.venue}</p>
//                       </div>
//                       <div className="hidden sm:block">
//                         {isCancelled ? <CalendarX className="h-4 w-4 text-outline" /> : <MoreVertical className="h-4 w-4 text-outline" />}
//                       </div>
//                     </div>
//                   );
//                 }) : (
//                   <div className="rounded-xl border border-transparent bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
//                     No classes scheduled for {todayWeekday}.
//                   </div>
//                 )}
//               </div>
//             </section>

//             {/* Bento Section for Updates and Extras */}
//             <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
//               <div className="rounded-2xl bg-surface-container-low p-6">
//                 <h4 className="mb-4 flex items-center gap-2 font-headline font-bold text-primary">
//                   <Newspaper className="h-5 w-5 text-primary" />
//                   Department Updates
//                 </h4>
//                 <div className="space-y-4">
//                   {snapshot.updates.slice(0, 2).map((update, idx) => (
//                     <div key={update.id} className="group cursor-pointer">
//                       {idx > 0 && <div className="mb-4 h-[1px] bg-slate-200"></div>}
//                       <p className="mb-1 text-[10px] font-bold uppercase text-outline">{update.date}</p>
//                       <h5 className="text-sm font-bold transition-colors group-hover:text-primary">{update.title}</h5>
//                       <p className="line-clamp-2 text-xs text-on-surface-variant">{update.body}</p>
//                     </div>
//                   ))}
//                   {snapshot.updates.length === 0 && (
//                      <p className="text-xs text-on-surface-variant">No recent updates.</p>
//                   )}
//                 </div>
//               </div>
//               <div className="rounded-2xl bg-primary-container p-6 text-white">
//                 <div className="flex items-center justify-between gap-3">
//                   <div>
//                     <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm">Recent Materials</span>
//                     <h4 className="mt-4 font-headline text-xl font-bold leading-tight">Latest files from your courses</h4>
//                   </div>
//                   <Layers3 className="h-12 w-12 text-white/15" />
//                 </div>

//                 <div className="mt-6 space-y-3">
//                   {snapshot.materials.slice(0, 2).map((material) => (
//                     <div key={material.title} className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
//                       <p className="text-sm font-bold">{material.title}</p>
//                       <p className="mt-1 text-xs text-indigo-200">{material.course}</p>
//                     </div>
//                   ))}
//                   {snapshot.materials.length === 0 && (
//                     <p className="text-sm text-indigo-200">No materials uploaded yet.</p>
//                   )}
//                 </div>

//                 <Link href="/materials" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-xs font-bold text-primary-container transition-transform hover:scale-105">
//                   Open Materials
//                   <ArrowRight className="h-4 w-4" />
//                 </Link>
//               </div>
//             </section>
//           </div>

//           {/* Right Column (Widgets) */}
//           <div className="space-y-8 lg:col-span-4">
//             {/* Assignments Widget */}
//             <section className="rounded-2xl bg-surface-container p-6">
//               <div className="mb-6 flex items-center justify-between">
//                 <h3 className="font-headline text-lg font-extrabold tracking-tight text-primary">Deadlines</h3>
//                 <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 text-[10px] font-bold text-on-tertiary-fixed">
//                   {snapshot.deadlines.length} UPCOMING
//                 </span>
//               </div>
//               <div className="space-y-4">
//                 {snapshot.deadlines.slice(0, 3).map((deadline, idx) => (
//                   <div key={deadline.id} className={`rounded-xl border-l-4 p-4 shadow-sm bg-surface-container-lowest ${idx === 0 ? 'border-error' : idx === 1 ? 'border-tertiary-fixed-dim' : 'border-outline-variant'}`}>
//                     <div className="mb-1 flex items-start justify-between">
//                       <h5 className="text-sm font-bold text-primary">{deadline.title}</h5>
//                       <span className={`text-[10px] font-bold uppercase ${idx === 0 ? 'text-error' : idx === 1 ? 'text-on-tertiary-container' : 'text-outline'}`}>
//                         {deadline.due}
//                       </span>
//                     </div>
//                     <p className="mb-3 font-medium text-xs text-outline">{deadline.course}</p>
//                     <div className="flex items-center justify-between">
//                       <span className="flex items-center gap-1 text-[10px] font-medium text-on-surface-variant">
//                         <Paperclip className="h-3 w-3" /> Pending
//                       </span>
//                       <button className="rounded-md bg-surface-container-high px-3 py-1 text-xs font-bold text-primary transition-colors hover:bg-surface-dim disabled:cursor-not-allowed disabled:opacity-60" disabled title="Submission workflow coming soon" type="button">Submit</button>
//                     </div>
//                   </div>
//                 ))}
//                 {snapshot.deadlines.length === 0 && (
//                   <p className="text-xs text-on-surface-variant">No pending deadlines.</p>
//                 )}
//               </div>
//             </section>
//           </div>
//         </div>
//       </div>
//     </AppChrome>
//   );
// }

export default function Home() {
  return <h1>Campulse is live oo 🚀</h1>;
}
