# Attendance Audit Flow

This document traces the full database path from student attendance sign-in to lecturer audit review and saved summary-file access.

## End-to-End Flow

```mermaid
flowchart TD
    A[Student enters OTP and location] --> B[useAttendance.submitAttendance]
    B --> C[authRepository.getSession]
    B --> D[sessionRepository.findActiveByOtp]
    D --> E[(sessions)]
    B --> F{RPC available?}
    F -->|Yes| G[supabase.rpc verify_and_log_attendance]
    F -->|No| H[attendanceRepository.log]
    G --> I[(attendance_logs)]
    H --> I

    I --> J[Lecturer ends session or session expires]
    J --> K[sessionRepository.finalizeSession]
    K --> L[Read attendance_logs for session]
    L --> M[Insert deduped rows into attendance_audit]
    L --> N[Build and upsert session summary file]
    K --> O[Mark sessions.archived_at]

    M --> P[(attendance_audit)]
    N --> Q[(attendance_summary_files)]
    O --> E

    R[Lecturer opens audit page] --> S[useLecturerAuditController]
    S --> T[courseRepository.findByLecturer]
    S --> U[auditRepository.findSessionsByLecturer]
    S --> V[auditRepository.findPersistedLogs]
    S --> W[summaryExportRepository.findByLecturer]
    T --> X[(classes)]
    U --> E
    V --> P
    W --> Q

    S --> Y{attendance_audit rows found?}
    Y -->|Yes| Z[Filter by class/session and paginate]
    Y -->|No| AA[auditRepository.findLiveLogsByLecturer]
    AA --> I
    AA --> Z

    Z --> AB[Audit summary table]
    Z --> AC[Attendance records table]
    W --> AD[Saved summary files table]

    AE[Manual summary export] --> AF[summaryExportService.saveAndDownloadCsvFile]
    AF --> Q
    AF --> AG[Browser file download]
```

## Write Path

1. Student attendance starts in `useAttendance.submitAttendance`.
2. The active session is resolved from `sessions` by OTP.
3. The preferred write path is the `verify_and_log_attendance` RPC.
4. The fallback write path inserts directly into `attendance_logs` through `attendanceRepository.log`.
5. When the lecturer ends the session, or the session expires, `sessionRepository.finalizeSession` reads those `attendance_logs` rows.
6. Finalization writes deduped audit rows into `attendance_audit` and also persists a session summary file into `attendance_summary_files`.
7. The session row is archived by writing `archived_at` on `sessions`.

## Read Path

1. The lecturer audit page loads the lecturer's classes, sessions, audit logs, and saved summary files.
2. If persisted `attendance_audit` rows exist, the page uses them as the source of truth.
3. If they do not exist yet, the page falls back to live `attendance_logs` rows.
4. The UI filters both summaries and records by `classId` and `sessionId`, then paginates the filtered result sets.
5. Saved summary files are read from `attendance_summary_files` and can be reopened directly without rebuilding them.

## Stored Tables Involved

- `sessions`: active and archived lecturer sessions.
- `attendance_logs`: raw sign-in events.
- `attendance_audit`: persisted audit history copied from `attendance_logs`.
- `attendance_summary_files`: persisted summary files that can be reopened later.
- `classes`: lecturer-owned class metadata used for class filtering.
- `profiles`: student profile data used to enrich audit rows.