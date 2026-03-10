import useLecturerAuditController from '../features/audit/hooks/useLecturerAuditController';
import AuditPageHeader from '../features/audit/components/AuditPageHeader';
import AuditFiltersBar from '../features/audit/components/AuditFiltersBar';
import AuditSummaryTable from '../features/audit/components/AuditSummaryTable';
import AuditRecordsTable from '../features/audit/components/AuditRecordsTable';
import SavedSummaryFilesTable from '../features/audit/components/SavedSummaryFilesTable';

const LecturerAuditPage = () => {
  const {
    loading,
    sessionFilter,
    classFilter,
    classOptions,
    groupedSessions,
    filteredAuditLogs,
    filteredSummaryFiles,
    clearFilters,
    setClassFilter,
    exportAllReport,
    exportSessionReport,
    exportSummaryReport,
    downloadSummaryFile,
  } = useLecturerAuditController();

  return (
    <div className="space-y-6">
      {/* Header */}
      <AuditPageHeader />

      {/* Filters and Actions */}
      <AuditFiltersBar
        classOptions={classOptions}
        classFilter={classFilter}
        sessionFilter={sessionFilter}
        filteredSessionCount={groupedSessions.length}
        savedFileCount={filteredSummaryFiles.length}
        onClassFilterChange={setClassFilter}
        onClearFilters={clearFilters}
        onExportAll={exportAllReport}
        onExportSummary={exportSummaryReport}
      />

      {/* Session Summary Table */}
      <AuditSummaryTable
        loading={loading}
        sessions={groupedSessions}
        onExportSession={exportSessionReport}
      />

      {/* Full Attendance Records */}
      <AuditRecordsTable
        loading={loading}
        records={filteredAuditLogs}
      />

      {/* Saved Summary Files */}
      <SavedSummaryFilesTable
        loading={loading}
        files={filteredSummaryFiles}
        onDownload={downloadSummaryFile}
      />
    </div>
  );
};

export default LecturerAuditPage;
