import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

export const generateExecutiveReport = (employees) => {
  try {
    // 1. Prepare Data
    const activeEmployees = employees.filter(e => !(e.is_resigned === true || String(e.status || "").toUpperCase() === 'RESIGNED' || !!e.resign_date));
    
    const summaryData = [
      { Metric: "Total Workforce", Value: employees.length },
      { Metric: "Active Personnel", Value: activeEmployees.length },
      { Metric: "Resigned Personnel", Value: employees.length - activeEmployees.length },
      { Metric: "Total Departments", Value: new Set(employees.map(e => e.division_name)).size },
      { Metric: "Report Generated At", Value: dayjs().format('DD MMM YYYY HH:mm') }
    ];

    const detailedData = employees.map(emp => ({
      "ID": emp.employee_id || emp.id,
      "Name": emp.name,
      "Email": emp.email,
      "Department": emp.division_name || emp.departments?.name || "-",
      "Position": emp.job_position || "-",
      "Level": emp.job_level || "-",
      "Status": emp.status,
      "Join Date": emp.join_date || "-",
      "Resign Date": emp.resign_date || "-"
    }));

    // 2. Create Workbooks
    const wb = XLSX.utils.book_new();
    
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Executive Summary");

    const wsDetails = XLSX.utils.json_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(wb, wsDetails, "Workforce Details");

    // 3. Export File
    const fileName = `WKN_Executive_Report_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    return true;
  } catch (error) {
    console.error("Export Error:", error);
    return false;
  }
};
