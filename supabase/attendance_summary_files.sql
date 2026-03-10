create table if not exists public.attendance_summary_files (
  id uuid primary key default gen_random_uuid(),
  export_key text not null unique,
  lecturer_id uuid not null,
  session_id uuid,
  class_id uuid,
  scope text not null check (scope in ('session', 'class', 'all')),
  source text not null default 'manual' check (source in ('finalize', 'manual')),
  filename text not null,
  mime_type text not null default 'text/csv;charset=utf-8;',
  file_extension text not null default 'csv',
  content_text text not null,
  row_count integer not null default 0 check (row_count >= 0),
  summary_date timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists attendance_summary_files_lecturer_id_idx
  on public.attendance_summary_files (lecturer_id, created_at desc);

create index if not exists attendance_summary_files_session_id_idx
  on public.attendance_summary_files (session_id);

create index if not exists attendance_summary_files_class_id_idx
  on public.attendance_summary_files (class_id);

alter table public.attendance_summary_files enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'attendance_summary_files'
      and policyname = 'Lecturers can read own summary files'
  ) then
    create policy "Lecturers can read own summary files"
      on public.attendance_summary_files
      for select
      to authenticated
      using (auth.uid() = lecturer_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'attendance_summary_files'
      and policyname = 'Lecturers can insert own summary files'
  ) then
    create policy "Lecturers can insert own summary files"
      on public.attendance_summary_files
      for insert
      to authenticated
      with check (auth.uid() = lecturer_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'attendance_summary_files'
      and policyname = 'Lecturers can update own summary files'
  ) then
    create policy "Lecturers can update own summary files"
      on public.attendance_summary_files
      for update
      to authenticated
      using (auth.uid() = lecturer_id)
      with check (auth.uid() = lecturer_id);
  end if;
end
$$;