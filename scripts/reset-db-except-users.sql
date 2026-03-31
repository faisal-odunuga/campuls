-- Campulse reset script
-- Destroys all app tables except public.users, recreates the schema, and seeds starter data.
-- Run this only when you are sure you want to wipe assignments, notes, timetable, sessions,
-- courses, and updates while keeping the users table intact.

begin;

drop function if exists public.start_class_session(uuid, uuid, text);
drop function if exists public.start_class_session(uuid, uuid);

drop table if exists public.updates_board cascade;
drop table if exists public.notes cascade;
drop table if exists public.assignments cascade;
drop table if exists public.class_sessions cascade;
drop table if exists public.timetable cascade;
drop table if exists public.courses cascade;

do $$
begin
  create type public.weekday_type as enum (
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.session_status_type as enum ('scheduled', 'ongoing', 'cancelled', 'postponed');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.recurrence_pattern_type as enum ('weekly', 'one-off');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.update_category_type as enum ('announcement', 'assignment', 'exam', 'general');
exception
  when duplicate_object then null;
end
$$;

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table public.timetable (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  level integer not null,
  day public.weekday_type not null,
  scheduled_time time not null,
  end_time time,
  lecturer text not null,
  recurrence_pattern public.recurrence_pattern_type not null default 'weekly',
  recurrence_end_date date,
  is_template boolean not null default true,
  status public.session_status_type not null default 'scheduled',
  created_at timestamptz not null default now()
);

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  timetable_id uuid not null references public.timetable(id) on delete cascade,
  date date not null,
  status public.session_status_type not null default 'scheduled',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  started_by uuid not null references public.users(id),
  location text not null default 'Not confirmed',
  created_at timestamptz not null default now(),
  unique (timetable_id, date)
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null,
  deadline timestamptz not null,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  file_url text not null,
  uploaded_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table public.updates_board (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  category public.update_category_type not null default 'announcement',
  content text not null,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create or replace function public.start_class_session(
  p_timetable_id uuid,
  p_started_by uuid,
  p_location text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_date date := (timezone('Africa/Lagos', now()))::date;
begin
  update public.timetable
    set status = 'scheduled'
  where status = 'ongoing'
    and id <> p_timetable_id;

  update public.timetable
    set status = 'ongoing'
  where id = p_timetable_id;

  if not found then
    raise exception 'Timetable row not found';
  end if;

  insert into public.class_sessions (
    timetable_id,
    date,
    status,
    started_at,
    started_by,
    location
  )
  values (
    p_timetable_id,
    v_session_date,
    'ongoing',
    now(),
    p_started_by,
    coalesce(nullif(trim(coalesce(p_location, '')), ''), 'Not confirmed')
  )
  on conflict (timetable_id, date) do update
    set status = excluded.status,
        started_at = excluded.started_at,
        ended_at = null,
        started_by = excluded.started_by,
        location = excluded.location;
end;
$$;

alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.timetable enable row level security;
alter table public.class_sessions enable row level security;
alter table public.assignments enable row level security;
alter table public.notes enable row level security;
alter table public.updates_board enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select to authenticated
  using (id = auth.uid());

drop policy if exists "courses_student_select" on public.courses;
create policy "courses_student_select" on public.courses
  for select to authenticated
  using (auth.uid() is not null);

drop policy if exists "timetable_student_select" on public.timetable;
drop policy if exists "timetable_hoc_write" on public.timetable;
drop policy if exists "timetable_hoc_update" on public.timetable;
drop policy if exists "timetable_hoc_delete" on public.timetable;
create policy "timetable_student_select" on public.timetable
  for select to authenticated
  using (auth.uid() is not null);
create policy "timetable_hoc_write" on public.timetable
  for insert to authenticated
  with check (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'));
create policy "timetable_hoc_update" on public.timetable
  for update to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'))
  with check (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'));
create policy "timetable_hoc_delete" on public.timetable
  for delete to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'));

drop policy if exists "class_sessions_student_select" on public.class_sessions;
drop policy if exists "class_sessions_hoc_insert" on public.class_sessions;
drop policy if exists "class_sessions_hoc_update" on public.class_sessions;
drop policy if exists "class_sessions_hoc_delete" on public.class_sessions;
create policy "class_sessions_student_select" on public.class_sessions
  for select to authenticated
  using (auth.uid() is not null);
create policy "class_sessions_hoc_insert" on public.class_sessions
  for insert to authenticated
  with check (
    started_by = auth.uid()
    and exists (select 1 from public.users where id = auth.uid() and role = 'hoc')
  );
create policy "class_sessions_hoc_update" on public.class_sessions
  for update to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'))
  with check (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'));
create policy "class_sessions_hoc_delete" on public.class_sessions
  for delete to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'));

drop policy if exists "assignments_student_select" on public.assignments;
drop policy if exists "assignments_hoc_insert" on public.assignments;
drop policy if exists "assignments_hoc_update" on public.assignments;
drop policy if exists "assignments_hoc_delete" on public.assignments;
create policy "assignments_student_select" on public.assignments
  for select to authenticated
  using (auth.uid() is not null);
create policy "assignments_hoc_insert" on public.assignments
  for insert to authenticated
  with check (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'));
create policy "assignments_hoc_update" on public.assignments
  for update to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'))
  with check (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'));
create policy "assignments_hoc_delete" on public.assignments
  for delete to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'));

drop policy if exists "notes_student_select" on public.notes;
drop policy if exists "notes_hoc_insert" on public.notes;
drop policy if exists "notes_hoc_update" on public.notes;
drop policy if exists "notes_hoc_delete" on public.notes;
create policy "notes_student_select" on public.notes
  for select to authenticated
  using (auth.uid() is not null);
create policy "notes_hoc_insert" on public.notes
  for insert to authenticated
  with check (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'));
create policy "notes_hoc_update" on public.notes
  for update to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'))
  with check (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'));
create policy "notes_hoc_delete" on public.notes
  for delete to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'));

drop policy if exists "updates_board_student_select" on public.updates_board;
drop policy if exists "updates_board_hoc_insert" on public.updates_board;
drop policy if exists "updates_board_hoc_update" on public.updates_board;
drop policy if exists "updates_board_hoc_delete" on public.updates_board;
create policy "updates_board_student_select" on public.updates_board
  for select to authenticated
  using (auth.uid() is not null);
create policy "updates_board_hoc_insert" on public.updates_board
  for insert to authenticated
  with check (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'));
create policy "updates_board_hoc_update" on public.updates_board
  for update to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'))
  with check (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'));
create policy "updates_board_hoc_delete" on public.updates_board
  for delete to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role = 'hoc'));

-- ============================================================================
-- Seed data
-- ============================================================================

insert into public.courses (code, title) values
  ('CSC301', 'Computer Networks'),
  ('CSC305', 'Database Systems'),
  ('GST201', 'Communication in English')
on conflict (code) do nothing;

insert into public.timetable (
  course_id,
  level,
  day,
  scheduled_time,
  end_time,
  lecturer,
  recurrence_pattern,
  recurrence_end_date,
  is_template,
  status
)
select
  c.id,
  s.level,
  s.day::public.weekday_type,
  s.scheduled_time,
  s.end_time,
  s.lecturer,
  s.recurrence_pattern::public.recurrence_pattern_type,
  s.recurrence_end_date,
  true,
  'scheduled'::public.session_status_type
from (
  values
    ('CSC301', 300, 'Monday', '10:00'::time, '12:00'::time, 'Dr. Sarah Jenkins', 'weekly', null::date),
    ('CSC305', 300, 'Wednesday', '14:00'::time, '16:00'::time, 'Prof. A. Ibrahim', 'weekly', null::date),
    ('GST201', 100, 'Friday', '09:00'::time, '10:00'::time, 'Mr. Chinedu Okafor', 'weekly', null::date)
) as s(code, level, day, scheduled_time, end_time, lecturer, recurrence_pattern, recurrence_end_date)
join public.courses c on c.code = s.code;

with hoc_user as (
  select id
  from public.users
  where role = 'hoc'
  order by created_at
  limit 1
),
seed_session as (
  select t.id as timetable_id
  from public.timetable t
  join public.courses c on c.id = t.course_id
  where c.code = 'CSC301'
  limit 1
)
insert into public.class_sessions (
  timetable_id,
  date,
  status,
  started_at,
  started_by,
  location
)
select
  seed_session.timetable_id,
  timezone('Africa/Lagos', now())::date,
  'ongoing'::public.session_status_type,
  now(),
  hoc_user.id,
  'Not confirmed'
from seed_session
join hoc_user on true
on conflict (timetable_id, date) do nothing;

with hoc_user as (
  select id
  from public.users
  where role = 'hoc'
  order by created_at
  limit 1
),
seed_course as (
  select id, code
  from public.courses
  where code in ('CSC301', 'CSC305', 'GST201')
)
insert into public.assignments (
  course_id,
  title,
  description,
  deadline,
  created_by
)
select
  seed_course.id,
  s.title,
  s.description,
  s.deadline,
  hoc_user.id
from (
  values
    ('CSC301', 'Homework 1', 'Packet switching and routing questions.', now() + interval '3 days'),
    ('CSC305', 'Schema Design Task', 'Normalize the sample campus database.', now() + interval '5 days')
) as s(code, title, description, deadline)
join seed_course on seed_course.code = s.code
left join hoc_user on true;

with hoc_user as (
  select id
  from public.users
  where role = 'hoc'
  order by created_at
  limit 1
),
seed_course as (
  select id, code
  from public.courses
  where code in ('CSC301', 'CSC305', 'GST201')
)
insert into public.notes (
  course_id,
  title,
  description,
  file_url,
  uploaded_by
)
select
  seed_course.id,
  s.title,
  s.description,
  s.file_url,
  hoc_user.id
from (
  values
    ('CSC301', 'Lecture 1 Notes', 'Introduction to networks.', 'https://example.com/files/csc301-lecture-1.pdf'),
    ('CSC305', 'Lecture 2 Notes', 'Relational design overview.', 'https://example.com/files/csc305-lecture-2.pdf')
) as s(code, title, description, file_url)
join seed_course on seed_course.code = s.code
left join hoc_user on true;

with hoc_user as (
  select id
  from public.users
  where role = 'hoc'
  order by created_at
  limit 1
),
seed_course as (
  select id, code
  from public.courses
  where code in ('CSC301', 'CSC305', 'GST201')
)
insert into public.updates_board (
  course_id,
  category,
  content,
  created_by
)
select
  seed_course.id,
  s.category::public.update_category_type,
  s.content,
  hoc_user.id
from (
  values
    ('CSC301', 'announcement', 'Lecture tomorrow starts at 10:00 AM.'),
    ('CSC305', 'general', 'Revision slides have been uploaded.')
) as s(code, category, content)
join seed_course on seed_course.code = s.code
left join hoc_user on true;

commit;
