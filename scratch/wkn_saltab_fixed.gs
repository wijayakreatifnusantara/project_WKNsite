// =========================================================================
// WKNsite Google Apps Script Backend (wkn_saltab_fixed.gs)
// Versi Terbaru & Terintegrasi: 2026-04-29
// Mendukung: CRUD Karyawan, Admin, Absensi, OCR KTP, dan Log Sistem
// =========================================================================

/**
 * Konfigurasi Nama Sheet
 * Pastikan nama sheet di Spreadsheet Anda sama persis dengan di bawah ini.
 */
var SHEETS = {
  EMPLOYEE: "Employee_Data",
  ATTENDANCE: "Attendance_Data",
  ADMIN: "admin_accounts",
  MUTATION: "Mutation_History",
  LOGS: "System_Logs",
  ROLES: "system_roles"
};

/**
 * GET Request: Mengambil data untuk dashboard
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action;

  if (action === "login") {
    return handleLogin(ss, e.parameter.username, e.parameter.password);
  }

  var response = {
    salary:     getSheetData(ss, SHEETS.EMPLOYEE),
    attendance: getSheetData(ss, SHEETS.ATTENDANCE),
    admins:     getSheetData(ss, SHEETS.ADMIN),
    mutations:  getSheetData(ss, SHEETS.MUTATION),
    systemLogs: getSheetData(ss, SHEETS.LOGS),
    roles:      getSheetData(ss, SHEETS.ROLES)
  };

  return responseJson(response);
}

/**
 * POST Request: Melakukan perubahan data (Add, Edit, Delete, Bulk)
 */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action  = payload.action;
    var ss      = SpreadsheetApp.getActiveSpreadsheet();

    // --- Aksi Login ---
    if (action === "login") return handleLogin(ss, payload.username, payload.password);

    // --- Aksi Karyawan ---
    if (action === "add") return addRecord(ss, SHEETS.EMPLOYEE, payload, "EMP_ADD", "Menambah karyawan");
    if (action === "edit") return editRecord(ss, SHEETS.EMPLOYEE, payload, "EMP_EDIT", "Mengubah karyawan");
    if (action === "delete") return deleteRecord(ss, SHEETS.EMPLOYEE, payload.rowid, "EMP_DELETE");
    if (action === "resign") return handleResign(ss, payload);
    if (action === "bulkImportEmployees") return bulkImport(ss, SHEETS.EMPLOYEE, payload.data, ["EMPLOYEE ID", "Employee ID *"]);

    // --- Aksi Admin ---
    if (action === "add_admin") return addRecord(ss, SHEETS.ADMIN, payload, "ADM_ADD", "Menambah admin");
    if (action === "edit_admin") return editAdmin(ss, payload);
    if (action === "delete_admin") return deleteRecord(ss, SHEETS.ADMIN, payload.rowid, "ADM_DELETE");

    // --- Aksi Absensi ---
    if (action === "attendance") return handleAttendance(ss, payload);
    if (action === "bulk_attendance") return bulkImport(ss, SHEETS.ATTENDANCE, payload.data);

    // --- Aksi Mutasi ---
    if (action === "add_mutation") return addRecord(ss, SHEETS.MUTATION, payload, "MUT_ADD", "Menambah riwayat mutasi/promosi");

    // --- Aksi Lainnya ---
    if (action === "ocrKTP") return performOCR(payload.image);

    return responseJson({ status: "error", message: "Aksi tidak dikenal" });

  } catch (err) {
    return responseJson({ status: "error", message: "Error: " + err.message });
  }
}

// =========================================================================
// CORE HANDLERS
// =========================================================================

function handleLogin(ss, username, password) {
  var sheet = ss.getSheetByName(SHEETS.ADMIN);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var uIdx = headers.indexOf("Username");
  var pIdx = headers.indexOf("Password");
  var sIdx = headers.indexOf("Status");
  var nIdx = headers.indexOf("Full Name");

  var userClean = (username || "").toLowerCase().trim();
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[uIdx]).toLowerCase().trim() === userClean && String(row[pIdx]) === String(password)) {
      if (row[sIdx] !== "Active") return responseJson({ status: "error", message: "Akun nonaktif" });
      var userObj = {};
      headers.forEach((h, idx) => { userObj[h] = row[idx]; });
      writeLog(ss, row[nIdx] || username, "LOGIN", "Berhasil masuk");
      return responseJson({ status: "success", name: row[nIdx] || username, user: userObj });
    }
  }
  return responseJson({ status: "error", message: "Username/Password salah" });
}

function addRecord(ss, sheetName, payload, logAction, logDetail) {
  var sheet = ss.getSheetByName(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newRow = headers.map(h => payload[h] !== undefined ? payload[h] : "");
  sheet.appendRow(newRow);
  var name = payload["EMPLOYEE NAME"] || payload["Full Name *"] || payload["Full Name"] || "Unknown";
  writeLog(ss, "Admin", logAction, logDetail + ": " + name);
  return responseJson({ status: "success", message: "Data berhasil ditambah" });
}

function editRecord(ss, sheetName, payload, logAction, logDetail) {
  var sheet = ss.getSheetByName(sheetName);
  var row = parseInt(payload.rowid) + 2;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  headers.forEach((h, idx) => {
    if (payload[h] !== undefined) sheet.getRange(row, idx + 1).setValue(payload[h]);
  });
  var name = payload["EMPLOYEE NAME"] || payload["Full Name *"] || "Unknown";
  writeLog(ss, "Admin", logAction, logDetail + ": " + name);
  return responseJson({ status: "success", message: "Data berhasil diupdate" });
}

function deleteRecord(ss, sheetName, rowid, logAction) {
  var sheet = ss.getSheetByName(sheetName);
  sheet.deleteRow(parseInt(rowid) + 2);
  writeLog(ss, "Admin", logAction, "Hapus data row: " + rowid);
  return responseJson({ status: "success", message: "Data berhasil dihapus" });
}

function handleResign(ss, payload) {
  var sheet = ss.getSheetByName(SHEETS.EMPLOYEE);
  var row = parseInt(payload.rowid) + 2;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var sIdx = headers.indexOf("Status *") > -1 ? headers.indexOf("Status *") : headers.indexOf("Employment Status *");
  if (sIdx > -1) sheet.getRange(row, sIdx + 1).setValue("Resigned");

  var dIdx = headers.indexOf("Resign Date");
  if (dIdx > -1) sheet.getRange(row, dIdx + 1).setValue(payload["Resign Date"] || new Date());

  var rIdx = headers.indexOf("Resign Reason");
  if (rIdx > -1) sheet.getRange(row, rIdx + 1).setValue(payload["Resign Reason"] || "");

  writeLog(ss, "Admin", "EMP_RESIGN", "Resign row: " + payload.rowid);
  return responseJson({ status: "success", message: "Status Resign tersimpan" });
}

function editAdmin(ss, payload) {
  var sheet = ss.getSheetByName(SHEETS.ADMIN);
  var row = parseInt(payload.rowid) + 2;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var keyMap = { "fullname": "Full Name", "username": "Username", "password": "Password", "role": "Role", "Status": "Status" };
  
  for (var key in keyMap) {
    if (payload[key] !== undefined) {
      var col = headers.indexOf(keyMap[key]);
      if (col > -1) {
        if (key === "password" && payload[key].trim() === "") continue;
        sheet.getRange(row, col + 1).setValue(payload[key]);
      }
    }
  }
  return responseJson({ status: "success", message: "Admin diupdate" });
}

function handleAttendance(ss, payload) {
  var sheet = ss.getSheetByName(SHEETS.ATTENDANCE);
  sheet.appendRow([
    payload.timestamp || new Date(),
    payload.employeeId,
    (payload.latitude || "") + ", " + (payload.longitude || ""),
    payload.locationString || "",
    payload.notes || "",
    payload.photoBase64 || ""
  ]);
  return responseJson({ status: "success", message: "Absen berhasil" });
}

function bulkImport(ss, sheetName, data, idHeaders) {
  if (!data || data.length === 0) return responseJson({ status: "error", message: "Data kosong" });
  var sheet = ss.getSheetByName(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  var existingIds = [];
  if (idHeaders) {
    var currentData = sheet.getDataRange().getValues();
    var idCol = -1;
    idHeaders.forEach(h => { if (headers.indexOf(h) > -1) idCol = headers.indexOf(h); });
    if (idCol > -1) existingIds = currentData.map(r => String(r[idCol]).trim());
  }

  var rows = [];
  data.forEach(item => {
    if (idHeaders) {
      var itemId = "";
      idHeaders.forEach(h => { if (item[h]) itemId = String(item[h]).trim(); });
      if (existingIds.indexOf(itemId) > -1) return;
    }
    rows.push(headers.map(h => item[h] !== undefined ? item[h] : ""));
  });

  if (rows.length > 0) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
  writeLog(ss, "Admin", "BULK_IMPORT", "Impor " + rows.length + " baris ke " + sheetName);
  return responseJson({ status: "success", message: rows.length + " data diimpor" });
}

function performOCR(base64) {
  try {
    var raw = base64.indexOf(",") > -1 ? base64.split(",")[1] : base64;
    var blob = Utilities.newBlob(Utilities.base64Decode(raw), "image/jpeg", "ocr.jpg");
    var file = Drive.Files.insert({ title: "ocr_temp", mimeType: "image/jpeg" }, blob, { ocr: true, ocrLanguage: "id" });
    var text = DocumentApp.openById(file.id).getBody().getText();
    DriveApp.getFileById(file.id).setTrashed(true);
    return responseJson({ status: "success", text: text });
  } catch (e) { return responseJson({ status: "error", message: "OCR Gagal" }); }
}

// =========================================================================
// HELPERS
// =========================================================================

function getSheetData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).map(row => {
    var obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function writeLog(ss, admin, action, detail) {
  try {
    var sheet = ss.getSheetByName(SHEETS.LOGS);
    if (sheet) sheet.appendRow([new Date().toISOString(), admin, action, detail]);
  } catch(e) {}
}

function responseJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
