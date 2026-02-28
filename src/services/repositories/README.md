Repository pattern: implement data access here. Each repository wraps Supabase queries and returns plain objects or throws errors.

Guidelines:
- No direct Supabase usage in hooks/components; use repositories instead.
- Keep methods small and testable.
- Inject `supabaseClient` for testing/mocks.
