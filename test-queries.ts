import { getDepartmentSnapshot } from './src/lib/supabase/queries';
(async () => {
  const data = await getDepartmentSnapshot();
  console.log("Active Session:", data?.activeSession);
  console.log("Timetable Top 2:", data?.timetable?.slice(0, 2));
})();
