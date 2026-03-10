import { summaryExportRepository } from '../repositories/index.js';
import { buildCsvContent, downloadTextFile } from '../../lib/utils/fileExports.js';

const DEFAULT_MIME_TYPE = 'text/csv;charset=utf-8;';

const summaryExportService = {
  async saveRawFile({
    exportKey,
    lecturerId,
    sessionId = null,
    classId = null,
    scope,
    source = 'manual',
    filename,
    contentText,
    rowCount = 0,
    summaryDate = new Date().toISOString(),
    metadata = {},
    mimeType = DEFAULT_MIME_TYPE,
    fileExtension = 'csv',
  }) {
    try {
      return await summaryExportRepository.save({
        export_key: exportKey,
        lecturer_id: lecturerId,
        session_id: sessionId,
        class_id: classId,
        scope,
        source,
        filename,
        mime_type: mimeType,
        file_extension: fileExtension,
        content_text: contentText,
        row_count: rowCount,
        summary_date: summaryDate,
        metadata,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('summaryExportService.saveRawFile failed', error?.message || error);
      return null;
    }
  },

  async saveCsvFile({
    headers,
    rows,
    mimeType = DEFAULT_MIME_TYPE,
    fileExtension = 'csv',
    ...rest
  }) {
    const contentText = buildCsvContent(headers, rows);
    await this.saveRawFile({
      ...rest,
      contentText,
      rowCount: rows.length,
      mimeType,
      fileExtension,
    });
    return contentText;
  },

  async saveAndDownloadCsvFile(options) {
    const contentText = await this.saveCsvFile(options);
    downloadTextFile({
      content: contentText,
      filename: options.filename,
      mimeType: options.mimeType || DEFAULT_MIME_TYPE,
    });
    return contentText;
  },

  downloadStoredFile(file) {
    if (!file) return;

    downloadTextFile({
      content: file.content_text || '',
      filename: file.filename || 'attendance_summary.csv',
      mimeType: file.mime_type || DEFAULT_MIME_TYPE,
    });
  },
};

export default summaryExportService;