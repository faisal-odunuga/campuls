create extension if not exists "pgcrypto";

do $$
begin
  create type public.user_role_type as enum ('student', 'hoc');
exception
  when duplicate_object then null;
end
$$;

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

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role public.user_role_type not null,
  level integer,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.timetable (
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

create table if not exists public.class_sessions (
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

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null,
  deadline timestamptz not null,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  file_url text not null,
  uploaded_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.updates_board (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  category public.update_category_type not null default 'announcement',
  content text not null,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create or replace function public.start_class_session(p_timetable_id uuid, p_started_by uuid, p_location text default null)
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

create policy "users_select_own" on public.users
  for select to authenticated
  using (id = auth.uid());

create policy "courses_student_select" on public.courses
  for select to authenticated
  using (auth.uid() is not null);

create policy "timetable_student_select" on public.timetable
  for select to authenticated
  using (auth.uid() is not null);

create policy "timetable_hoc_write" on public.timetable
  for insert to authenticated
  with check (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));

create policy "timetable_hoc_update" on public.timetable
  for update to authenticated
  using (exists (select 1 from public.users where email = auth.email() and role = 'hoc'))
  with check (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));

create policy "timetable_hoc_delete" on public.timetable
  for delete to authenticated
  using (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));

create policy "class_sessions_student_select" on public.class_sessions
  for select to authenticated
  using (auth.uid() is not null);

create policy "class_sessions_hoc_insert" on public.class_sessions
  for insert to authenticated
  with check (
    started_by = auth.uid()
    and exists (select 1 from public.users where email = auth.email() and role = 'hoc')
  );

create policy "assignments_student_select" on public.assignments
  for select to authenticated
  using (auth.uid() is not null);

create policy "assignments_hoc_insert" on public.assignments
  for insert to authenticated
  with check (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));

create policy "assignments_hoc_update" on public.assignments
  for update to authenticated
  using (exists (select 1 from public.users where email = auth.email() and role = 'hoc'))
  with check (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));

create policy "assignments_hoc_delete" on public.assignments
  for delete to authenticated
  using (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));

create policy "notes_student_select" on public.notes
  for select to authenticated
  using (auth.uid() is not null);

create policy "notes_hoc_insert" on public.notes
  for insert to authenticated
  with check (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));

create policy "notes_hoc_update" on public.notes
  for update to authenticated
  using (exists (select 1 from public.users where email = auth.email() and role = 'hoc'))
  with check (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));

create policy "notes_hoc_delete" on public.notes
  for delete to authenticated
  using (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));

create policy "updates_board_student_select" on public.updates_board
  for select to authenticated
  using (auth.uid() is not null);

create policy "updates_board_hoc_insert" on public.updates_board
  for insert to authenticated
  with check (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));

create policy "updates_board_hoc_update" on public.updates_board
  for update to authenticated
  using (exists (select 1 from public.users where email = auth.email() and role = 'hoc'))
  with check (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));

create policy "updates_board_hoc_delete" on public.updates_board
  for delete to authenticated
  using (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));
