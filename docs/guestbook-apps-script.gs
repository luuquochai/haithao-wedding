/**
 * Sổ lưu bút có kiểm duyệt - Google Apps Script (miễn phí).
 *
 * CÀI ĐẶT (làm một lần, ~3 phút):
 * 1. Vào https://script.google.com -> Dự án mới. Xoá code mẫu, dán toàn bộ file này vào.
 * 2. Đặt ADMIN_KEY bên dưới thành một mã bí mật của anh/chị (vd: mat-khau-duyet-123). Đừng dùng mật khẩu quan trọng.
 * 3. Bấm Triển khai (Deploy) -> Tuỳ chọn triển khai mới -> loại "Ứng dụng web":
 *      - Thực thi dưới dạng: Tôi
 *      - Ai có quyền truy cập: Bất kỳ ai
 *    Bấm Triển khai, cấp quyền khi Google hỏi (Advanced -> Go to ... -> Allow).
 * 4. Sao chép "URL ứng dụng web" (dạng https://script.google.com/macros/s/.../exec),
 *    dán vào Admin -> tab "Sổ lưu bút" -> ô "Link Apps Script", cùng ADMIN_KEY ở ô bên dưới, rồi Lưu.
 *
 * Lời chúc được lưu trong Google Sheet (tự tạo, tên "Guestbook"). Khách gửi -> trạng thái "pending";
 * chỉ lời chúc đã Duyệt (approved) mới hiện ra trên thiệp.
 * Sau khi sửa code, phải Triển khai lại (Quản lý triển khai -> Sửa -> Phiên bản mới) thì mới có hiệu lực.
 */
var ADMIN_KEY = 'doi-ma-nay';          // <-- ĐỔI MÃ NÀY
var SHEET_NAME = 'Guestbook';
var MAX_NAME = 100, MAX_MSG = 1000, MAX_PENDING = 300;

function sheet_() {
  // a standalone script has no spreadsheet: create one once and remember its id
  var props = PropertiesService.getScriptProperties(), id = props.getProperty('SS_ID'), ss;
  if (id) ss = SpreadsheetApp.openById(id);
  else { ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('Sổ lưu bút'); props.setProperty('SS_ID', ss.getId()); }
  var s = ss.getSheetByName(SHEET_NAME);
  if (!s) { s = ss.insertSheet(SHEET_NAME); s.appendRow(['id', 'time', 'name', 'message', 'status']); }
  return s;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function rows_() {
  var v = sheet_().getDataRange().getValues().slice(1);
  return v.map(function (r) { return { id: String(r[0]), time: Number(r[1]), name: String(r[2]), message: String(r[3]), status: String(r[4]) }; });
}

// GET: public -> approved wishes only.  ?action=list&key=ADMIN_KEY -> everything (for the admin page)
function doGet(e) {
  var p = (e && e.parameter) || {}, all = rows_();
  if (p.action === 'list') {
    if (p.key !== ADMIN_KEY) return out_({ error: 'unauthorized' });
    return out_({ items: all });
  }
  return out_({ items: all.filter(function (r) { return r.status === 'approved'; }).map(function (r) { return { id: r.id, time: r.time, name: r.name, message: r.message }; }) });
}

// POST (text/plain JSON): {action:'submit',name,message}  |  admin: {action:'approve'|'unapprove'|'delete', id, key}
function doPost(e) {
  var d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return out_({ error: 'bad request' }); }
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var s = sheet_();
    if (d.action === 'submit') {
      var name = String(d.name || '').trim().slice(0, MAX_NAME), msg = String(d.message || '').trim().slice(0, MAX_MSG);
      if (!name || !msg) return out_({ error: 'empty' });
      var pending = rows_().filter(function (r) { return r.status === 'pending'; }).length;
      if (pending >= MAX_PENDING) return out_({ error: 'too many pending' });
      s.appendRow([Utilities.getUuid(), Date.now(), name, msg, 'pending']);
      return out_({ ok: true });
    }
    if (d.key !== ADMIN_KEY) return out_({ error: 'unauthorized' });
    var data = s.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) !== String(d.id)) continue;
      if (d.action === 'approve') s.getRange(i + 1, 5).setValue('approved');
      else if (d.action === 'unapprove') s.getRange(i + 1, 5).setValue('pending');
      else if (d.action === 'delete') s.deleteRow(i + 1);
      else return out_({ error: 'unknown action' });
      return out_({ ok: true });
    }
    return out_({ error: 'not found' });
  } finally { lock.releaseLock(); }
}
