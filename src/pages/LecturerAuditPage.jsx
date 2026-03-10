import AuditFiltersBar from '../features/audit/components/AuditFiltersBar';
import AuditPageHeader from '../features/audit/components/AuditPageHeader';
import AuditRecordsTable from '../features/audit/components/AuditRecordsTable';
import AuditSummaryTable from '../features/audit/components/AuditSummaryTable';
import SavedSummaryFilesTable from '../features/audit/components/SavedSummaryFilesTable';
import useLecturerAuditController from '../features/audit/hooks/useLecturerAuditController';

const LecturerAuditPage = () => {
  const audit = useLecturerAuditController();

  return (
    <div className="space-y-6">
      <AuditPageHeader
        sessionCount={audit.groupedSessions.length}
        recordCount={audit.filteredAuditLogs.length}
        fileCount={audit.filteredSummaryFiles.length}
      />

      <AuditFiltersBar
        classOptions={audit.classOptions}
        classFilter={audit.classFilter}
        sessionFilter={audit.sessionFilter}
        filteredSessionCount={audit.groupedSessions.length}
        savedFileCount={audit.filteredSummaryFiles.length}
        onClassFilterChange={audit.setClassFilter}
        onClearFilters={audit.clearFilters}
        onExportAll={audit.exportAllReport}
        onExportSummary={audit.exportSummaryReport}
      />

      <AuditSummaryTable
        sessions={audit.groupedSessions}
        loading={audit.loading}
        onExportSessionReport={audit.exportSessionReport}
      />

      <AuditRecordsTable
        records={audit.filteredAuditLogs}
        loading={audit.loading}
        title={audit.sessionFilter ? 'Session Records' : 'Attendance Records'}
      />

      <SavedSummaryFilesTable
        files={audit.filteredSummaryFiles}
        loading={audit.loading}
        onDownloadFile={audit.downloadSummaryFile}
      />
    </div>
  );
};

export default LecturerAuditPage;
