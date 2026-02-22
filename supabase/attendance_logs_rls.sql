alter table if exists public.attendance_logs enable row level security;

create policy if not exists "authenticated_can_insert_attendance_logs"
on public.attendance_logs
for insert
to authenticated
with check (auth.uid() = student_id);

create policy if not exists "authenticated_can_select_attendance_logs"
on public.attendance_logs
for select
to authenticated
using (auth.uid() = student_id or exists (
  select 1
  from public.sessions s
  where s.id = attendance_logs.session_id
    and s.lecturer_id = auth.uid()
));
