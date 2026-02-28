-- Idempotent script to refresh Supabase realtime permissions, publication, and RLS
-- Run this in Supabase SQL editor as a project owner (or via psql)

-- 1) Grant schema usage and table select to common roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- 2) Ensure tables are included in the realtime publication
-- Use safe checks because ALTER PUBLICATION ... IF EXISTS on the publication name is not valid SQL
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- remove listed tables if present (best-effort)
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS classes, sessions, attendance_logs';
    -- add the required tables (idempotent - will fail if already present, but inside DO block it's fine)
    BEGIN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE classes, sessions, attendance_logs';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not ALTER PUBLICATION ADD TABLE (may already contain tables): %', SQLERRM;
    END;
  ELSE
    -- create publication if it does not exist
    BEGIN
      EXECUTE 'CREATE PUBLICATION supabase_realtime FOR TABLE classes, sessions, attendance_logs';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create publication supabase_realtime: %', SQLERRM;
    END;
  END IF;
END$$;

-- 3) Ensure REPLICA IDENTITY FULL for update/delete events
DO $$
BEGIN
  EXECUTE 'ALTER TABLE IF EXISTS public.classes REPLICA IDENTITY FULL';
  EXECUTE 'ALTER TABLE IF EXISTS public.sessions REPLICA IDENTITY FULL';
  EXECUTE 'ALTER TABLE IF EXISTS public.attendance_logs REPLICA IDENTITY FULL';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Replica identity ALTER may require privileges or table missing';
END$$;

-- 4) Create an audit table if not present (best-effort, permissive column types)
CREATE TABLE IF NOT EXISTS public.attendance_audit (
  id BIGSERIAL PRIMARY KEY,
  attendance_log_id TEXT,
  session_id TEXT,
  student_id TEXT,
  signed_at TIMESTAMPTZ,
  distance_meters NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5) Enable and tighten RLS policies for sessions and classes to support cross-table policies
ALTER TABLE IF EXISTS public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS lecturer_can_select_own_sessions
  ON public.sessions
  FOR SELECT
  TO authenticated
  USING (lecturer_id = auth.uid());
CREATE POLICY IF NOT EXISTS service_role_can_select_sessions
  ON public.sessions
  FOR SELECT
  TO service_role
  USING (true);

ALTER TABLE IF EXISTS public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS lecturer_can_select_own_classes
  ON public.classes
  FOR SELECT
  TO authenticated
  USING (lecturer_id = auth.uid());
CREATE POLICY IF NOT EXISTS service_role_can_select_classes
  ON public.classes
  FOR SELECT
  TO service_role
  USING (true);

-- 6) Grant explicit select on specific tables for realtime user roles (idempotent)
GRANT SELECT ON TABLE public.sessions TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.classes TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.attendance_logs TO anon, authenticated, service_role;

-- 7) Revoke dangerous broad grants if present (safety - uncomment if desired)
-- REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;

-- 8) Final notice
COMMENT ON SCHEMA public IS 'Realtime permissions refreshed by realtime_permissions_fix.sql';

-- End of script
