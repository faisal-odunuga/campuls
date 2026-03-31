-- Safe upgrade migration for an existing database with live data.
-- Apply this after auditing any rows that still contain NULL foreign keys.

-- New timetable columns for recurring templates and per-level filtering.
alter table public.timetable
  add column if not exists level integer,
  add column if not exists recurrence_pattern text default 'weekly',
  add column if not exists recurrence_end_date date,
  add column if not exists is_template boolean default true,
  add column if not exists end_time time;

update public.timetable
set recurrence_pattern = coalesce(recurrence_pattern, 'weekly'),
    is_template = coalesce(is_template, true)
where recurrence_pattern is null
   or is_template is null;

-- Location now lives on class sessions, not the timetable template.
alter table public.class_sessions
  add column if not exists location text default 'Not confirmed';

update public.class_sessions
set location = coalesce(nullif(location, ''), 'Not confirmed');

update public.class_sessions cs
set location = coalesce(nullif(cs.location, ''), nullif(t.venue, ''), 'Not confirmed')
from public.timetable t
where cs.timetable_id = t.id
  and (cs.location is null or cs.location = 'Not confirmed');

alter table public.timetable
  drop column if exists venue;

-- Notes metadata used by the UI.
alter table public.notes
  add column if not exists title text,
  add column if not exists description text;

update public.notes
set title = coalesce(nullif(regexp_replace(coalesce(file_url, ''), '^.*/', ''), ''), 'Untitled note')
where title is null;

-- Updates category stays backwards compatible with the current enum/text setup.
alter table public.updates_board
  alter column category set default 'announcement';

-- Class session fields needed by the transactional start_session RPC.
alter table public.class_sessions
  add column if not exists date date,
  add column if not exists status text default 'scheduled',
  add column if not exists ended_at timestamptz;

update public.class_sessions
set date = coalesce(
  date,
  (started_at at time zone 'Africa/Lagos')::date,
  timezone('Africa/Lagos', now())::date
)
where date is null;

update public.class_sessions
set status = coalesce(status, 'scheduled'),
    location = coalesce(location, t.venue)
from public.timetable t
where class_sessions.timetable_id = t.id
  and class_sessions.location is null;

-- Tighten constraints only when existing data already satisfies them.
do $$
begin
  if not exists (select 1 from public.timetable where course_id is null) then
    alter table public.timetable alter column course_id set not null;
  end if;

  if not exists (select 1 from public.assignments where course_id is null) then
    alter table public.assignments alter column course_id set not null;
  end if;

  if not exists (select 1 from public.notes where course_id is null) then
    alter table public.notes alter column course_id set not null;
  end if;

  if not exists (select 1 from public.updates_board where course_id is null) then
    alter table public.updates_board alter column course_id set not null;
  end if;

  if not exists (select 1 from public.class_sessions where timetable_id is null) then
    alter table public.class_sessions alter column timetable_id set not null;
  end if;

  if not exists (select 1 from public.class_sessions where started_by is null) then
    alter table public.class_sessions alter column started_by set not null;
  end if;
end
$$;

-- RLS policies aligned to the current app rules.
alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.timetable enable row level security;
alter table public.class_sessions enable row level security;
alter table public.assignments enable row level security;
alter table public.notes enable row level security;
alter table public.updates_board enable row level security;

drop policy if exists "read own user row" on public.users;
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select to authenticated
  using (id = auth.uid());

drop policy if exists "read courses" on public.courses;
create policy "courses_student_select" on public.courses
  for select to authenticated
  using (auth.uid() is not null);

drop policy if exists "read timetable" on public.timetable;
drop policy if exists "timetable_student_select" on public.timetable;
drop policy if exists "hoc insert timetable" on public.timetable;
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

drop policy if exists "read class sessions" on public.class_sessions;
drop policy if exists "class_sessions_student_select" on public.class_sessions;
drop policy if exists "class_sessions_hoc_insert" on public.class_sessions;
create policy "class_sessions_student_select" on public.class_sessions
  for select to authenticated
  using (auth.uid() is not null);
create policy "class_sessions_hoc_insert" on public.class_sessions
  for insert to authenticated
  with check (
    started_by = auth.uid()
    and exists (select 1 from public.users where id = auth.uid() and role = 'hoc')
  );

drop policy if exists "read assignments" on public.assignments;
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

drop policy if exists "read notes" on public.notes;
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

drop policy if exists "read updates" on public.updates_board;
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

-- Transactional class start helper.
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
