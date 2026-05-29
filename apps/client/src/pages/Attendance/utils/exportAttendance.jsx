import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { apiClient } from '@/lib/apiClient';

export const exportDailyAttendance = async () => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    
    // Fetch today's raw logs via API
    const response = await apiClient.get('/api/attendance/export/today');

    if (response.status !== 'success') throw new Error('Failed to fetch attendance data');
    const data = response.data;

    if (!data || data.length === 0) {
      alert("No attendance records found for today.");
      return false;
    }

    const exportData = data.map(record => ({
      "Employee Name": record.employees?.name || "Unknown",
      "Department": record.employees?.organization_name || "-",
      "Position": record.employees?.job_position || "-",
      "Time": dayjs(record.created_at).format('HH:mm:ss'),
      "Status": record.status,
      "Location/Geotag": record.location || "-",
      "Notes": record.notes || "-"
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns slightly
    const wscols = [
      {wch: 25}, {wch: 20}, {wch: 20}, {wch: 15}, {wch: 12}, {wch: 30}, {wch: 20}
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Daily Log");

    const fileName = `WKN_Daily_Attendance_${dayjs().format('YYYYMMDD')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    return true;
  } catch (err) {
    console.error("Export Error:", err);
    return false;
  }
};
