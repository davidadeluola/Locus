export function buildCsvContent(headers = [], rows = []) {
  const csvRows = [headers, ...rows].filter((row) => Array.isArray(row) && row.length > 0);

  return csvRows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export function downloadTextFile({ content, filename, mimeType = "text/csv;charset=utf-8;" }) {
  if (typeof document === "undefined") return;

  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}