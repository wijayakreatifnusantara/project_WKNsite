// =========================================================================
// WKNsite Google Apps Script Backend (wkn_saltab.gs) - UPDATED VERSION
// Added: bulkImportEmployees action for Employee Management
// =========================================================================

function doGet(e) {
  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "login") {
    var sheet  = ss.getSheetByName("admin_accounts");
    var data   = sheet.getDataRange().getValues();
    var headers = data[0];
    var uIdx   = headers.indexOf("Username");
    var pIdx   = headers.indexOf("Password");
    var sIdx   = headers.indexOf("Status");
    var nIdx   = headers.indexOf("Full Name");

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowUser = (row[uIdx] || "").toString().toLowerCase().trim();
      var inputUser = (e.parameter.username || "").toString().toLowerCase().trim();
      var inputPass = e.parameter.password;
      
      if (rowUser === inputUser && row[pIdx] === inputPass) {
        if (row[sIdx] !== "Active") {
          return responseJson({ status: "error", message: "Akun telah dinonaktifkan" });
        }
        var userObj = {};
        for (var j = 0; j < headers.length; j++) {
          userObj[headers[j]] = row[j];
        }
        writeLog(ss, row[nIdx] || e.parameter.username, "LOGIN", "Berhasil masuk ke dashboard");
        return responseJson({ status: "success", name: row[nIdx] || e.parameter.username, user: userObj });
      }
    }
    return responseJson({ status: "error", message: "Username atau Password salah." });
  }

  function getSheetData(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    var headers = data[0];
    var result = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      result.push(obj);
    }
    return result;
  }

  var response = {
    salary:     getSheetData("Employee_Data"),
    attendance: getSheetData("Attendance_Data"),
    admins:     getSheetData("admin_accounts"),
    systemLogs: getSheetData("System_Logs"),
    roles:      getSheetData("system_roles")
  };

  return responseJson(response);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action  = payload.action;
    var ss      = SpreadsheetApp.getActiveSpreadsheet();

    // ---------------------------------------------------------
    // 1. LOGIN
    // ---------------------------------------------------------
    if (action === "login") {
      var sheet  = ss.getSheetByName("admin_accounts");
      var data   = sheet.getDataRange().getValues();
      var headers = data[0];
      var uIdx   = headers.indexOf("Username");
      var pIdx   = headers.indexOf("Password");
      var sIdx   = headers.indexOf("Status");
      var nIdx   = headers.indexOf("Full Name");

      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (row[uIdx] === payload.username && row[pIdx] === payload.password) {
          if (row[sIdx] !== "Active") {
            return responseJson({ status: "error", message: "Akun telah dinonaktifkan" });
          }
          
          var userObj = {};
          for (var j = 0; j < headers.length; j++) {
            userObj[headers[j]] = row[j];
          }
          
          writeLog(ss, row[nIdx] || payload.username, "LOGIN", "Berhasil masuk ke dashboard");
          return responseJson({ status: "success", name: row[nIdx] || payload.username, user: userObj });
        }
      }
      return responseJson({ status: "error", message: "Username atau Password salah." });
    }

    // ---------------------------------------------------------
    // 2. ADD EMPLOYEE
    // ---------------------------------------------------------
    if (action === "add") {
      var sheet   = ss.getSheetByName("Employee_Data");
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

      var newRow = [];
      for (var j = 0; j < headers.length; j++) {
        var h = headers[j];
        newRow.push(payload[h] !== undefined ? payload[h] : "");
      }
      sheet.appendRow(newRow);

      var empName = payload["Full Name *"] || payload["nama"] || "Unknown";
      writeLog(ss, "Admin System", "EMP_ADD", "Menambah karyawan: " + empName);
      return responseJson({ status: "success", message: "Karyawan berhasil ditambahkan" });
    }

    // ---------------------------------------------------------
    // 3. EDIT EMPLOYEE
    // ---------------------------------------------------------
    if (action === "edit") {
      var sheet   = ss.getSheetByName("Employee_Data");
      var row     = parseInt(payload.rowid) + 2;
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

      for (var j = 0; j < headers.length; j++) {
        var h = headers[j];
        if (payload[h] !== undefined) {
          sheet.getRange(row, j + 1).setValue(payload[h]);
        }
      }

      var empName = payload["Full Name *"] || payload["nama"] || "Unknown";
      writeLog(ss, "Admin System", "EMP_EDIT", "Mengubah data karyawan: " + empName);
      return responseJson({ status: "success", message: "Data karyawan berhasil diupdate" });
    }

    // ---------------------------------------------------------
    // 4. BULK IMPORT EMPLOYEES (NEW)
    // ---------------------------------------------------------
    if (action === "bulkImportEmployees") {
      var sheet   = ss.getSheetByName("Employee_Data");
      var data    = payload.data;
      if (!data || data.length === 0) return responseJson({ status: "error", message: "Data kosong" });

      var headers      = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var currentData  = sheet.getDataRange().getValues();
      var idIdx        = headers.indexOf("Employee ID *");
      var existingIds  = currentData.map(function(r) { return String(r[idIdx]).trim(); });
      
      var rowsToInsert = [];
      var successCount = 0;

      for (var i = 0; i < data.length; i++) {
        var empData = data[i];
        var empId   = String(empData["Employee ID *"]).trim();
        
        // Skip if NIK already exists (Security Gate)
        if (existingIds.indexOf(empId) > -1) continue;

        var newRowArray = [];
        for (var j = 0; j < headers.length; j++) {
          var h = headers[j];
          newRowArray.push(empData[h] !== undefined ? empData[h] : "");
        }
        rowsToInsert.push(newRowArray);
        successCount++;
      }

      if (rowsToInsert.length > 0) {
        var startRow = sheet.getLastRow() + 1;
        sheet.getRange(startRow, 1, rowsToInsert.length, headers.length).setValues(rowsToInsert);
      }
      
      writeLog(ss, "Admin System", "EMP_IMPORT", "Impor massal: " + successCount + " karyawan");
      return responseJson({ status: "success", message: successCount + " karyawan berhasil diimpor!" });
    }

    // ---------------------------------------------------------
    // 5. RESIGN EMPLOYEE
    // ---------------------------------------------------------
    if (action === "resign") {
      var sheet   = ss.getSheetByName("Employee_Data");
      var row     = parseInt(payload.rowid) + 2;
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

      var statusIdx = headers.indexOf("Employment Status *");
      if (statusIdx > -1) sheet.getRange(row, statusIdx + 1).setValue("Resigned");

      var resignDateIdx = headers.indexOf("Resign Date");
      if (resignDateIdx > -1) sheet.getRange(row, resignDateIdx + 1).setValue(payload["Resign Date"] || new Date());

      var resignReasonIdx = headers.indexOf("Resign Reason");
      if (resignReasonIdx > -1) sheet.getRange(row, resignReasonIdx + 1).setValue(payload["Resign Reason"] || "");

      var empName = payload["Full Name *"] || "Unknown";
      writeLog(ss, "Admin System", "EMP_RESIGN", "Proses resign: " + empName);
      return responseJson({ status: "success", message: "Proses resign berhasil" });
    }

    // ---------------------------------------------------------
    // 6. DELETE EMPLOYEE
    // ---------------------------------------------------------
    if (action === "delete") {
      var sheet = ss.getSheetByName("Employee_Data");
      var row   = parseInt(payload.rowid) + 2;
      sheet.deleteRow(row);
      writeLog(ss, "Admin System", "EMP_DELETE", "Menghapus karyawan (row " + payload.rowid + ")");
      return responseJson({ status: "success", message: "Karyawan dihapus" });
    }

    // ---------------------------------------------------------
    // (Other handlers: edit_admin, add_admin, delete_admin, attendance, bulk_attendance, ocrKTP remains the same)
    // ---------------------------------------------------------
    
    // ... rest of the original script remains unchanged ...
    // Note: I'm omitting the rest for brevity in this scratch file, 
    // but the actual script should contain all handlers.

    return responseJson({ status: "error", message: "Unknown action: " + action });

  } catch (err) {
    return responseJson({ status: "error", message: err.message });
  }
}

function writeLog(ss, admin, action, detail) {
  try {
    var sheet = ss.getSheetByName("System_Logs");
    if (!sheet) return;
    sheet.appendRow([new Date().toISOString(), admin, action, detail]);
  } catch(e) {}
}

function responseJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
