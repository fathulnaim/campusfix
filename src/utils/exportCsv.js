/**
 * Exports an array of maintenance reports to a CSV file and triggers download.
 * @param {Array<Object>} reports 
 */
export function exportReportsToCSV(reports = []) {
  if (!reports || reports.length === 0) {
    alert("No reports available to export.");
    return;
  }

  const headers = [
    "Date Created",
    "Report ID",
    "Title",
    "Location",
    "Category",
    "Priority",
    "Status",
    "Student Email",
    "Room Access",
    "Assigned Technician",
    "Estimated Time",
    "Photo URL",
    "Admin Notes"
  ];

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = reports.map((r) => [
    r.createdAt ? new Date(r.createdAt).toLocaleString("en-GB") : "",
    r.id || "",
    r.title || "",
    r.location || "",
    r.category || "",
    r.priority || "",
    r.status || "Pending",
    r.userEmail || "",
    r.roomAccess || "",
    r.technician || "Unassigned",
    r.estimatedTime || "Evaluating",
    r.file_url || "",
    r.adminNotes || ""
  ]);

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(","))
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const dateStr = new Date().toISOString().split("T")[0];
  link.setAttribute("download", `CampusFix_Maintenance_Reports_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
