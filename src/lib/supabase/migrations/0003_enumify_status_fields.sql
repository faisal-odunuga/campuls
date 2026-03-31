-- Convert text status-like columns to enums for stronger data integrity.
-- Safe for existing databases: creates enum types if missing and only
-- converts columns that are still stored as text.

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

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'role'
      and udt_name <> 'user_role_type'
  ) then
    alter table public.users
      alter column role type public.user_role_type
      using role::public.user_role_type;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'timetable'
      and column_name = 'day'
      and udt_name <> 'weekday_type'
  ) then
    alter table public.timetable
      alter column day type public.weekday_type
      using day::public.weekday_type;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'timetable'
      and column_name = 'recurrence_pattern'
      and udt_name <> 'recurrence_pattern_type'
  ) then
    alter table public.timetable
      alter column recurrence_pattern type public.recurrence_pattern_type
      using recurrence_pattern::public.recurrence_pattern_type;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'timetable'
      and column_name = 'status'
      and udt_name <> 'session_status_type'
  ) then
    alter table public.timetable
      alter column status type public.session_status_type
      using status::public.session_status_type;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'class_sessions'
      and column_name = 'status'
      and udt_name <> 'session_status_type'
  ) then
    alter table public.class_sessions
      alter column status type public.session_status_type
      using status::public.session_status_type;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'updates_board'
      and column_name = 'category'
      and udt_name <> 'update_category_type'
  ) then
    alter table public.updates_board
      alter column category type public.update_category_type
      using category::public.update_category_type;
  end if;
end
$$;

alter table public.timetable
  alter column recurrence_pattern set default 'weekly'::public.recurrence_pattern_type,
  alter column status set default 'scheduled'::public.session_status_type;

alter table public.class_sessions
  alter column status set default 'scheduled'::public.session_status_type;

alter table public.updates_board
  alter column category set default 'announcement'::public.update_category_type;
