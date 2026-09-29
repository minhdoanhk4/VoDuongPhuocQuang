/**
 * GOOGLE APPS SCRIPT CHO HỆ THỐNG QUẢN LÝ VÕ SINH & THĂNG ĐAI PHẬT QUANG QUYỀN (PQQ)
 * 
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Mở một Google Spreadsheet mới hoặc có sẵn trên Google Drive.
 * 2. Chọn Menu: Tiện ích mở rộng (Extensions) > Apps Script.
 * 3. Xóa hết mã cũ trong file Code.gs và dán toàn bộ nội dung file này vào.
 * 4. Bấm nút "Lưu" (biểu tượng đĩa mềm hoặc Ctrl+S).
 * 5. Chọn hàm "initAllSheets" từ danh sách hàm ở thanh công cụ và bấm "Chạy" (Run) để tự động tạo các Sheet và tiêu đề cột.
 * 6. Bấm "Triển khai" (Deploy) > "Tùy chọn triển khai mới" (New deployment).
 * 7. Chọn loại: "Ứng dụng web" (Web app).
 *    - Mô tả: PQQ API Backend
 *    - Thực thi dưới dạng: Tôi (email của bạn)
 *    - Người có quyền truy cập: "Bất kỳ ai" (Anyone) - điều này cần thiết để Web App kết nối được qua CORS.
 * 8. Bấm "Triển khai" và sao chép "URL ứng dụng web" (Web App URL) dán vào phần Cài đặt của Web App PQQ.
 */

// Khóa bảo mật nội bộ mặc định (Bạn có thể đổi khóa này hoặc đổi trong Cài đặt)
var DEFAULT_SECRET_TOKEN = "PQQ_SECRET_2026";

var SHEET_NAMES = {
  VOSINH: "VOSINH",
  KYTHI: "KYTHI",
  PHIEUTHI: "PHIEUTHI",
  VANBANG: "VANBANG",
  CLB: "CLB",
  CAUHINH: "CAUHINH"
};

/**
 * Xử lý yêu cầu GET từ Web App
 */
function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params.action || "ping";
    var token = params.token || "";

    // Kiểm tra token nếu có cấu hình
    if (token && !validateToken(token)) {
      return createJsonResponse({ success: false, error: "Khóa bảo mật (Secret Token) không chính xác!" }, 403);
    }

    var result = {};

    switch (action) {
      case "ping":
        result = {
          success: true,
          message: "Kết nối Google Apps Script PQQ thành công!",
          timestamp: new Date().toISOString()
        };
        break;

      case "init":
        initAllSheets();
        result = {
          success: true,
          message: "Đã khởi tạo các bảng dữ liệu thành công!"
        };
        break;

      case "getAllData":
        var cache = CacheService.getScriptCache();
        var cachedData = cache.get("PQQ_ALL_DATA");
        if (cachedData) {
          result = {
            success: true,
            data: JSON.parse(cachedData),
            timestamp: new Date().toISOString(),
            fromServerCache: true
          };
        } else {
          var allData = {
            students: getSheetDataAsObjects(SHEET_NAMES.VOSINH),
            exams: getSheetDataAsObjects(SHEET_NAMES.KYTHI),
            examSheets: getSheetDataAsObjects(SHEET_NAMES.PHIEUTHI),
            certificates: getSheetDataAsObjects(SHEET_NAMES.VANBANG),
            clubs: getSheetDataAsObjects(SHEET_NAMES.CLB)
          };
          try {
            // Lưu cache tối đa 60 giây để chống nghẽn server khi nhiều người xem cùng lúc
            cache.put("PQQ_ALL_DATA", JSON.stringify(allData), 60);
          } catch (e) {}
          result = {
            success: true,
            data: allData,
            timestamp: new Date().toISOString()
          };
        }
        break;

      case "getStudents":
        result = { success: true, data: getSheetDataAsObjects(SHEET_NAMES.VOSINH) };
        break;

      case "getExams":
        result = { success: true, data: getSheetDataAsObjects(SHEET_NAMES.KYTHI) };
        break;

      case "getCertificates":
        result = { success: true, data: getSheetDataAsObjects(SHEET_NAMES.VANBANG) };
        break;

      default:
        result = { success: false, error: "Hành động không hợp lệ: " + action };
    }

    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() }, 500);
  }
}

/**
 * Xử lý yêu cầu POST từ Web App (Kèm cơ chế Khóa Tuần Tự LockService chống quá tải & xung đột)
 */
function doPost(e) {
  // Cơ chế Khóa chống xung đột đa luồng của Google Apps Script
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(15000); // Đợi tối đa 15 giây nếu có tiến trình khác đang ghi
  if (!hasLock) {
    return createJsonResponse({
      success: false,
      error: "Hệ thống Google Sheets đang xử lý tác vụ khác để chống quá tải. Vui lòng chờ vài giây.",
      isBusy: true
    }, 429);
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ success: false, error: "Dữ liệu gửi lên rỗng!" }, 400);
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var token = payload.token || "";

    if (token && !validateToken(token)) {
      return createJsonResponse({ success: false, error: "Khóa bảo mật không chính xác!" }, 403);
    }

    var responseData = {};

    switch (action) {
      case "initSheets":
        initAllSheets();
        responseData = { success: true, message: "Đã khởi tạo bảng thành công!" };
        break;

      case "syncAll":
        // Đồng bộ toàn bộ dữ liệu từ Client lên Google Sheet
        if (payload.data) {
          if (payload.data.clubs) syncSheetData(SHEET_NAMES.CLB, payload.data.clubs, "id");
          if (payload.data.students) syncSheetData(SHEET_NAMES.VOSINH, payload.data.students, "id");
          if (payload.data.exams) syncSheetData(SHEET_NAMES.KYTHI, payload.data.exams, "id");
          if (payload.data.examSheets) syncSheetData(SHEET_NAMES.PHIEUTHI, payload.data.examSheets, "id");
          if (payload.data.certificates) syncSheetData(SHEET_NAMES.VANBANG, payload.data.certificates, "id");
        }
        responseData = {
          success: true,
          message: "Đã đồng bộ toàn bộ dữ liệu lên Google Sheets!",
          timestamp: new Date().toISOString()
        };
        break;

      case "saveStudent":
        saveRecord(SHEET_NAMES.VOSINH, payload.data, "id");
        responseData = { success: true, message: "Đã lưu thông tin võ sinh!" };
        break;

      case "deleteStudent":
        deleteRecord(SHEET_NAMES.VOSINH, payload.id, "id");
        responseData = { success: true, message: "Đã xóa võ sinh!" };
        break;

      case "saveExam":
        saveRecord(SHEET_NAMES.KYTHI, payload.data, "id");
        responseData = { success: true, message: "Đã lưu đợt thi!" };
        break;

      case "saveExamSheet":
        saveRecord(SHEET_NAMES.PHIEUTHI, payload.data, "id");
        responseData = { success: true, message: "Đã lưu phiếu dự thi!" };
        break;

      case "saveCertificate":
        saveRecord(SHEET_NAMES.VANBANG, payload.data, "id");
        responseData = { success: true, message: "Đã lưu văn bằng thăng đai!" };
        break;

      case "saveClub":
        saveRecord(SHEET_NAMES.CLB, payload.data, "id");
        responseData = { success: true, message: "Đã lưu câu lạc bộ!" };
        break;

      default:
        responseData = { success: false, error: "Hành động POST không hợp lệ: " + action };
    }

    // Xóa cache máy chủ để lần đọc kế tiếp lấy dữ liệu mới nhất
    try {
      CacheService.getScriptCache().remove("PQQ_ALL_DATA");
    } catch (e) {}

    return createJsonResponse(responseData);
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Trả về phản hồi dạng JSON với Header CORS đầy đủ
 */
function createJsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Kiểm tra Token
 */
function validateToken(token) {
  var scriptProperties = PropertiesService.getScriptProperties();
  var savedToken = scriptProperties.getProperty("SECRET_TOKEN") || DEFAULT_SECRET_TOKEN;
  return token === savedToken;
}

/**
 * Tự động tạo và định dạng tất cả các Sheet dữ liệu
 */
function initAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var definitions = [
    {
      name: SHEET_NAMES.CLB,
      headers: ["id", "code", "name", "coach", "phone", "email", "address", "establishedDate", "notes", "createdAt", "updatedAt"],
      color: "#1e3a8a"
    },
    {
      name: SHEET_NAMES.VOSINH,
      headers: ["id", "code", "fullName", "dharmaName", "birthYear", "gender", "address", "unitName", "diplomaName", "diplomaIssueDate", "diplomaIssuePlace", "diplomaIssuingAuthority", "educationLevel", "phone", "coachName", "avatarUrl", "currentBelt", "currentBeltLevel", "clubId", "status", "notes", "createdAt", "updatedAt"],
      color: "#047857"
    },
    {
      name: SHEET_NAMES.KYTHI,
      headers: ["id", "sessionCode", "name", "examDate", "location", "examinerCouncil", "status", "notes", "totalCandidates", "passedCandidates", "createdAt", "updatedAt"],
      color: "#b45309"
    },
    {
      name: SHEET_NAMES.PHIEUTHI,
      headers: ["id", "examId", "studentId", "targetBelt", "targetBeltLevel", "scoreCanBan", "scoreBaiQuyen", "scoreBinhKhi", "scoreTheLuc", "scoreDoiKhang", "scoreLyThuyet", "totalScore", "averageScore", "result", "examiners", "notes", "createdAt", "updatedAt"],
      color: "#b91c1c"
    },
    {
      name: SHEET_NAMES.VANBANG,
      headers: ["id", "certNumber", "studentId", "examId", "beltConferred", "beltLevel", "issueDate", "signerTitle", "signerName", "decisionNumber", "qrCode", "status", "notes", "createdAt", "updatedAt"],
      color: "#7e22ce"
    }
  ];

  for (var i = 0; i < definitions.length; i++) {
    var def = definitions[i];
    var sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
    }
    // Ghi tiêu đề nếu sheet trống hoặc cập nhật
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(def.headers);
      var headerRange = sheet.getRange(1, 1, 1, def.headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground(def.color);
      headerRange.setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }
  }

  // Xóa Sheet1 mặc định nếu đã có các sheet khác
  var defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Trang tính 1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }
}

/**
 * Đọc dữ liệu từ Sheet ra mảng các Object
 */
function getSheetDataAsObjects(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var result = [];

  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    // Bỏ qua dòng trống không có id
    if (!row[0]) continue;

    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var header = headers[c];
      var val = row[c];
      // Xử lý đối tượng Date thành chuỗi ISO yyyy-mm-dd
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      obj[header] = val;
    }
    result.push(obj);
  }

  return result;
}

/**
 * Lưu hoặc cập nhật một bản ghi (dựa trên primaryKey)
 */
function saveRecord(sheetName, recordData, primaryKey) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    initAllSheets();
    sheet = ss.getSheetByName(sheetName);
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var keyIndex = headers.indexOf(primaryKey);
  if (keyIndex === -1) throw new Error("Không tìm thấy cột khóa: " + primaryKey);

  var rowIndex = -1;
  var targetId = String(recordData[primaryKey]);

  for (var r = 1; r < data.length; r++) {
    if (String(data[r][keyIndex]) === targetId) {
      rowIndex = r + 1; // 1-based index
      break;
    }
  }

  var rowValues = [];
  var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  if (rowIndex === -1) {
    // Thêm mới
    recordData.createdAt = recordData.createdAt || nowStr;
    recordData.updatedAt = nowStr;
    for (var h = 0; h < headers.length; h++) {
      var hName = headers[h];
      rowValues.push(recordData[hName] !== undefined ? recordData[hName] : "");
    }
    sheet.appendRow(rowValues);
  } else {
    // Cập nhật
    recordData.updatedAt = nowStr;
    for (var h2 = 0; h2 < headers.length; h2++) {
      var hName2 = headers[h2];
      rowValues.push(recordData[hName2] !== undefined ? recordData[hName2] : (data[rowIndex - 1][h2] || ""));
    }
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowValues]);
  }
}

/**
 * Xóa một bản ghi
 */
function deleteRecord(sheetName, idValue, primaryKey) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var keyIndex = headers.indexOf(primaryKey);
  if (keyIndex === -1) return;

  for (var r = 1; r < data.length; r++) {
    if (String(data[r][keyIndex]) === String(idValue)) {
      sheet.deleteRow(r + 1);
      return;
    }
  }
}

/**
 * Đồng bộ toàn bộ bảng (xóa sạch và ghi lại danh sách mới nhất)
 */
function syncSheetData(sheetName, items, primaryKey) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    initAllSheets();
    sheet = ss.getSheetByName(sheetName);
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (!headers || headers.length === 0) return;

  // Xóa các hàng dữ liệu cũ (giữ lại hàng tiêu đề)
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }

  if (!items || items.length === 0) return;

  var rowsToAppend = [];
  var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var row = [];
    item.updatedAt = item.updatedAt || nowStr;
    for (var h = 0; h < headers.length; h++) {
      var header = headers[h];
      var val = item[header];
      if (val === undefined || val === null) val = "";
      if (typeof val === "object") val = JSON.stringify(val);
      row.push(val);
    }
    rowsToAppend.push(row);
  }

  if (rowsToAppend.length > 0) {
    sheet.getRange(2, 1, rowsToAppend.length, headers.length).setValues(rowsToAppend);
  }
}
