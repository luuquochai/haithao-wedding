(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var D = {}; // working copy of content
  // ---------- schema ----------
  // t: text | area | date | time | img | url | num | color
  var SCHEMA = [
    ['Phong bì & SEO', [
      ['seoTitle', 'Tiêu đề trang (tab trình duyệt)', 't', 'wide'],
      ['envelopeGreeting', 'Lời mời trên phong bì', 't'], ['openButton', 'Nút mở thiệp', 't'],
      ['groomShort', 'Tên ngắn chú rể', 't'], ['brideShort', 'Tên ngắn cô dâu', 't']]],
    ['Đầu trang', [
      ['saveTheDate', 'Dòng "Save The Date"', 't'], ['heroPhoto', 'Ảnh polaroid đầu trang', 'img', 'wide']]],
    ['Thông tin lễ cưới', [
      ['ceremonyTitle', 'Tiêu đề khối', 't'],
      ['groomParentTitle', 'Danh xưng nhà trai', 't'], ['groomFather', 'Bố nhà trai', 't'], ['groomMother', 'Mẹ nhà trai', 't'], ['groomAddress', 'Địa chỉ nhà trai', 'area'],
      ['brideParentTitle', 'Danh xưng nhà gái', 't'], ['brideFather', 'Bố nhà gái', 't'], ['brideMother', 'Mẹ nhà gái', 't'], ['brideAddress', 'Địa chỉ nhà gái', 'area'],
      ['announcement', 'Lời báo tin', 'area', 'wide'],
      ['groomFull', 'Họ tên đầy đủ chú rể', 't'], ['groomOrder', 'Thứ bậc chú rể', 't'],
      ['brideFull', 'Họ tên đầy đủ cô dâu', 't'], ['brideOrder', 'Thứ bậc cô dâu', 't'],
      ['ceremonyPlace', 'Địa điểm làm lễ', 'area', 'wide'],
      ['ceremonyAtPrefix', 'Chữ trước giờ lễ', 't'], ['ceremonyTime', 'Giờ lễ', 'time'], ['ceremonyDate', 'Ngày lễ', 'date'],
      ['ceremonyLunar', 'Ngày âm lịch (lễ)', 't', 'wide'], ['monthPrefix', 'Tiền tố tháng (VD: "THÁNG ")', 't']]],
    ['Album ảnh', [['albumTitle', 'Tiêu đề album', 't']], 'gallery'],
    ['Tiệc cưới', [
      ['partyTitle', 'Tiêu đề khối', 't'], ['partyIntro', 'Câu dẫn', 't', 'wide'],
      ['partyDate', 'Ngày tiệc', 'date'], ['partyTime', 'Giờ khai tiệc', 'time'], ['receptionTime', 'Giờ đón khách', 'time'],
      ['receptionLabel', 'Nhãn đón khách', 't'], ['partyStartLabel', 'Nhãn khai tiệc', 't'],
      ['partyLunar', 'Ngày âm lịch (tiệc)', 't', 'wide'], ['countdownTitle', 'Tiêu đề đếm ngược', 't'], ['countdownPast', 'Chữ khi đã qua ngày', 't'],
      ['addToCalendar', 'Nút thêm vào lịch', 't'], ['calendarEventTitle', 'Tiêu đề sự kiện lịch ({groomFull}, {brideFull})', 't', 'wide'],
      ['calendarEventDetails', 'Chi tiết sự kiện lịch', 'area', 'wide'], ['rsvpButton', 'Nút xác nhận tham dự', 't']]],
    ['Bản đồ & Dress code', [
      ['venueTitle', 'Tiêu đề địa điểm', 't'], ['venueAddress', 'Địa chỉ tổ chức', 'area', 'wide'],
      ['mapImage', 'Ảnh bản đồ (nếu có, hiển thị thay cho bản đồ nhúng; bấm vào ảnh sẽ mở chỉ đường)', 'img', 'wide'],
      ['mapEmbedUrl', 'Mã nhúng bản đồ: dán cả thẻ <iframe> từ Google Maps → Chia sẻ → Nhúng bản đồ (link rút gọn maps.app.goo.gl không nhúng được; để trống = tự tạo từ địa chỉ)', 'area', 'wide'],
      ['mapDirectionsUrl', 'URL chỉ đường (để trống = tự tạo)', 'url', 'wide'], ['directionsLabel', 'Nhãn nút chỉ đường', 't'],
      ['dressTitle', 'Tiêu đề dress code', 't'], ['dressDesc', 'Mô tả dress code', 't']], 'dress'],
    ['Lịch trình', [['timelineTitle', 'Tiêu đề', 't']], 'timeline'],
    ['Sổ lưu bút', [['guestbookTitle', 'Tiêu đề', 't'], ['guestbookSubmit', 'Nút gửi', 't'], ['guestbookNamePlaceholder', 'Placeholder tên', 't'], ['guestbookMessagePlaceholder', 'Placeholder lời chúc', 't']], 'guestbook'],
    ['Hộp quà', [['giftTitle', 'Tiêu đề', 't'], ['giftHint', 'Dòng gợi ý', 't'], ['saveQrLabel', 'Nhãn nút lưu QR', 't']], 'gifts'],
    ['Khách mời', [['guestPrefix', 'Chữ trước tên khách (VD: TRÂN TRỌNG KÍNH MỜI:)', 't', 'wide'], ['partyTitle', 'Chữ khi KHÔNG có tên khách (link thường)', 't', 'wide']], 'guests'],
    ['Chân trang & Nhạc', [['thankYou', 'Lời cảm ơn', 'area', 'wide']], 'music']
  ];

  // ---------- helpers ----------
  function slugify(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  var toastT;
  function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2200); }
  function api(path, method, data) {
    return fetch('../' + path.replace(/^\//, ''), { method: method || 'GET', headers: data ? { 'Content-Type': 'application/json' } : {}, body: data ? JSON.stringify(data) : undefined, credentials: 'same-origin' })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || r.status); return j; }); });
  }
  function el(tag, attrs, kids) { var e = document.createElement(tag); Object.keys(attrs || {}).forEach(function (k) { if (k === 'class') e.className = attrs[k]; else if (k === 'text') e.textContent = attrs[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); }); (kids || []).forEach(function (c) { e.appendChild(c); }); return e; }
  function upload(file) {
    return new Promise(function (ok, no) {
      var r = new FileReader(); r.onload = function () { BE.upload(file, r.result).then(ok, no); }; r.onerror = no; r.readAsDataURL(file);
    });
  }
  // generic field: returns element; get/set via obj[key]
  function field(obj, key, label, type, wide) {
    var lab = el('label', { class: 'f' + (wide ? ' wide' : '') }); lab.appendChild(el('span', { text: label }));
    var v = obj[key] == null ? '' : obj[key], inp;
    if (type === 'img') {
      var im = el('img', { src: prev(v), alt: '' }); inp = el('input', { type: 'text', value: v, placeholder: 'images/... hoặc URL' });
      var file = el('input', { type: 'file', accept: 'image/*', class: 'hidden' });
      var up = el('button', { type: 'button', class: 'sm', text: 'Tải ảnh lên', onclick: function () { file.click(); } });
      file.addEventListener('change', function () { if (!file.files[0]) return; up.textContent = 'Đang tải…'; upload(file.files[0]).then(function (u) { inp.value = u.url; obj[key] = u.url; im.src = u.preview; PREV[u.url] = u.preview; toast(BE.mode === 'github' ? 'Đã đưa ảnh lên GitHub' : 'Đã tải ảnh lên'); }, function (e) { toast('Lỗi: ' + e.message); }).then(function () { up.textContent = 'Tải ảnh lên'; }); });
      inp.addEventListener('input', function () { obj[key] = inp.value; im.src = prev(inp.value); });
      var box = el('div', { class: 'img' }, [im, el('div', { class: 'c' }, [inp, el('div', {}, [up, file])])]);
      lab.appendChild(box); return lab;
    }
    if (type === 'area') inp = el('textarea'), inp.value = v;
    else inp = el('input', { type: type === 't' ? 'text' : type === 'num' ? 'number' : type }), inp.value = v;
    inp.addEventListener('input', function () { obj[key] = type === 'num' ? +inp.value : inp.value; });
    lab.appendChild(inp); return lab;
  }
  function listEditor(arr, mk, fields, addLabel, hint) {
    var wrap = el('div'); if (hint) wrap.appendChild(el('p', { class: 'hint', text: hint }));
    var list = el('div'); wrap.appendChild(list);
    function draw() {
      list.innerHTML = '';
      arr.forEach(function (it, i) {
        var row = el('div', { class: 'row' });
        fields(it).forEach(function (f) { row.appendChild(f); });
        row.appendChild(el('div', { class: 'tools' }, [
          el('button', { type: 'button', class: 'sm', text: '↑', onclick: function () { if (i > 0) { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); draw(); } } }),
          el('button', { type: 'button', class: 'sm', text: '↓', onclick: function () { if (i < arr.length - 1) { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); draw(); } } }),
          el('button', { type: 'button', class: 'sm del', text: 'Xoá', onclick: function () { arr.splice(i, 1); draw(); } })]));
        list.appendChild(row);
      });
    }
    draw();
    wrap.appendChild(el('button', { type: 'button', class: 'sm', text: '+ ' + addLabel, onclick: function () { arr.push(mk()); draw(); } }));
    return wrap;
  }
  var EXTRA = {
    gallery: function () {
      D.gallery = D.gallery || [];
      var wrap = el('div', {}, [el('p', { class: 'hint', text: 'Danh sách ảnh album (hiển thị dạng cover-flow 3D). Kéo thứ tự bằng nút ↑ ↓.' })]);
      var arr = D.gallery.map(function (s) { return { src: s }; }); D.gallery = null;
      wrap.appendChild(listEditor(arr, function () { return { src: '' }; }, function (it) { return [field(it, 'src', 'Ảnh', 'img', true)]; }, 'Thêm ảnh'));
      wrap._collect = function () { D.gallery = arr.map(function (a) { return a.src; }).filter(Boolean); };
      return wrap;
    },
    dress: function () {
      var arr = (D.dressColors || []).map(function (c) { return { c: c }; });
      var wrap = el('div', {}, [el('h3', { text: 'Màu dress code' })]);
      wrap.appendChild(listEditor(arr, function () { return { c: '#511419' }; }, function (it) { return [field(it, 'c', 'Màu', 'color')]; }, 'Thêm màu'));
      wrap._collect = function () { D.dressColors = arr.map(function (a) { return a.c; }); };
      return wrap;
    },
    timeline: function () {
      D.timeline = D.timeline || [];
      return listEditor(D.timeline, function () { return { time: '', label: '', icon: '' }; }, function (it) { return [field(it, 'time', 'Giờ', 't'), field(it, 'label', 'Nội dung', 't'), field(it, 'icon', 'Icon (để trống = không có)', 'img', true)]; }, 'Thêm mốc', 'Các mốc lịch trình ngày cưới.');
    },
    guestbook: function () {
      D.guestbook = D.guestbook || [];
      return el('div', {}, [el('h3', { text: 'Lời chúc mẫu' }), listEditor(D.guestbook, function () { return { name: '', message: '', time: '' }; }, function (it) { return [field(it, 'name', 'Tên', 't'), field(it, 'time', 'Thời gian (ISO, VD 2026-07-26T05:30:49Z; hiển thị theo giờ máy khách)', 't'), field(it, 'message', 'Lời chúc', 'area', true)]; }, 'Thêm lời chúc')]);
    },
    gifts: function () {
      D.gifts = D.gifts || [];
      return el('div', {}, [el('h3', { text: 'Tài khoản mừng cưới' }), listEditor(D.gifts, function () { return { label: '', bank: '', number: '', holder: '', qr: '' }; }, function (it) { return [field(it, 'label', 'Tiêu đề (VD: Chú Rể - TÊN)', 't'), field(it, 'bank', 'Ngân hàng', 't'), field(it, 'number', 'Số tài khoản', 't'), field(it, 'holder', 'Chủ tài khoản', 't'), field(it, 'qr', 'Ảnh QR', 'img', true)]; }, 'Thêm tài khoản')]);
    },
    guests: function () {
      D.guests = D.guests || [];
      var base = location.href.replace(/[?#].*$/, '').replace(/admin\/(index\.html)?$/, '');
      var wrap = el('div', {}, [el('h3', { text: 'Danh sách khách / tập thể' }), el('p', { class: 'hint', text: 'Mỗi dòng là một link riêng: ' + base + '?k=<mã>. Tên hiển thị trong thiệp sau chữ "TRÂN TRỌNG KÍNH MỜI:". Link thường (không có ?k=) hiện chữ mặc định (QUÝ KHÁCH). Mẹo: ' + base + '?to=Tên bất kỳ cũng hiển thị tên đó mà không cần thêm vào danh sách.' })]);
      wrap.appendChild(listEditor(D.guests, function () { return { name: '', slug: '' }; }, function (it) {
        var link = el('input', { type: 'text', readonly: 'readonly' }), copy = el('button', { type: 'button', class: 'sm', text: 'Sao chép link' });
        function refresh() { link.value = it.slug ? base + '?k=' + encodeURIComponent(it.slug) : '(chưa có mã)'; }
        var slugField = field(it, 'slug', 'Mã trong link (chữ không dấu, không khoảng trắng)', 't'), slugInp = slugField.querySelector('input');
        var nameField = field(it, 'name', 'Tên hiển thị', 't', true), nameInp = nameField.querySelector('input');
        var auto = !it.slug || it.slug === slugify(it.name);
        nameInp.addEventListener('input', function () { if (auto) { it.slug = slugify(it.name); slugInp.value = it.slug; } refresh(); });
        slugInp.addEventListener('input', function () { auto = false; it.slug = slugify(slugInp.value); refresh(); });
        copy.addEventListener('click', function () { refresh(); (navigator.clipboard ? navigator.clipboard.writeText(link.value) : Promise.reject()).then(function () { toast('Đã sao chép link'); }, function () { link.select(); toast('Hãy nhấn Ctrl+C để sao chép'); }); });
        refresh();
        return [nameField, slugField, el('label', { class: 'f wide' }, [el('span', { text: 'Link gửi cho khách' }), el('div', { class: 'img' }, [link, copy])])];
      }, 'Thêm khách / tập thể'));
      wrap._collect = function () { D.guests = D.guests.filter(function (g) { return g.name; }).map(function (g) { g.slug = slugify(g.slug || g.name); return g; }); };
      return wrap;
    },
    music: function () {
      D.music = D.music || { enabled: true, url: '', volume: .5 };
      var m = D.music, g = el('div', { class: 'grid' });
      var cb = el('input', { type: 'checkbox' }); cb.checked = !!m.enabled; cb.addEventListener('change', function () { m.enabled = cb.checked; });
      g.appendChild(el('label', { class: 'f' }, [el('span', { text: 'Bật nhạc nền' }), cb]));
      g.appendChild(field(m, 'url', 'URL file nhạc (mp3)', 'url', true)); g.appendChild(field(m, 'volume', 'Âm lượng (0–1)', 'num'));
      return el('div', {}, [el('h3', { text: 'Nhạc nền' }), g]);
    }
  };

  var collectors = [];
  function build() {
    var tabs = $('#tabs'), secs = $('#sections'); tabs.innerHTML = secs.innerHTML = ''; collectors = [];
    SCHEMA.forEach(function (s, i) {
      var b = el('button', { type: 'button', text: s[0], onclick: function () { show(i); } }); tabs.appendChild(b);
      var sec = el('section'), g = el('div', { class: 'grid' });
      s[1].forEach(function (f) { g.appendChild(field(D, f[0], f[1], f[2], f[3] === 'wide')); });
      sec.appendChild(g);
      if (s[2]) { var x = EXTRA[s[2]](); x.style.marginTop = '16px'; sec.appendChild(x); if (x._collect) collectors.push(x._collect); }
      secs.appendChild(sec);
    });
    function show(i) { Array.prototype.forEach.call(tabs.children, function (b, k) { b.classList.toggle('on', k === i); }); Array.prototype.forEach.call(secs.children, function (c, k) { c.classList.toggle('on', k === i); }); }
    show(0);
  }
  // ---------- preview path helper (admin lives in /admin/, assets are one level up) ----------
  function prev(v) { return !v ? '' : /^(https?:|data:|\/\/)/.test(v) ? v : '../' + String(v).replace(/^\//, ''); }

  // ---------- backends ----------
  // "server": node server.js (cookie login, data/content.json)   "github": static hosting, commits to the repo via GitHub API
  var BE = { mode: 'server' };
  var PREV = {}; // path -> data URL of images uploaded in this session (not yet published by Pages)
  var GH_DEFAULT = { repo: 'luuquochai/haithao-wedding', branch: 'main', token: '' };
  function ghGuess() {
    var m = /^([^.]+)\.github\.io$/.exec(location.hostname), seg = location.pathname.split('/')[1];
    return m && seg && seg !== 'admin' ? m[1] + '/' + seg : GH_DEFAULT.repo;
  }
  function ghCfg() { try { return Object.assign({}, GH_DEFAULT, { repo: ghGuess() }, JSON.parse(localStorage.getItem('ghcfg') || '{}')); } catch (e) { return Object.assign({}, GH_DEFAULT, { repo: ghGuess() }); } }
  function b64utf8(str) { var b = new TextEncoder().encode(str), s = ''; for (var i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }
  function unb64utf8(b64) { var s = atob(b64.replace(/\s/g, '')), b = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return new TextDecoder().decode(b); }
  function gh(path, method, body) {
    var c = ghCfg();
    return fetch('https://api.github.com/repos/' + c.repo + path, { method: method || 'GET', headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + c.token, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) {
          var msg = j.message || String(r.status);
          if (/not accessible|Bad credentials|Not Found/i.test(msg) && r.status !== 422) msg += ' — kiểm tra token: (1) Resource owner phải là tài khoản chủ repo; (2) Repository access gồm repo này; (3) Permissions → Contents: Read and write. Hoặc dùng classic token có quyền "repo".';
          var e = new Error(msg); e.status = r.status; throw e;
        } return j; }); });
  }
  var ghSha = null;
  var SERVER = {
    mode: 'server',
    check: function () { return api('/api/me').then(function (j) { return !!j.ok; }); },
    login: function () { return api('/api/login', 'POST', { password: $('#pw').value }); },
    logout: function () { return api('/api/logout', 'POST', {}); },
    load: function () { return api('/api/content'); },
    save: function (d) { return api('/api/content', 'POST', d); },
    upload: function (file, dataUrl) { return api('/api/upload', 'POST', { data: dataUrl }).then(function (j) { return { url: j.url.replace(/^\//, ''), preview: dataUrl }; }); },
    reset: function () { return api('/api/content/reset', 'POST', {}); }
  };
  var GITHUB = {
    mode: 'github',
    check: function () { return Promise.resolve(!!ghCfg().token); },
    login: function () {
      var verify = function () { return gh('').then(function (r) { if (!r.permissions || !r.permissions.push) { localStorage.removeItem('ghcfg'); throw new Error('Token không có quyền ghi (Contents: Read and write) vào repo này'); } }); };
      if (AUTH && !SETUP) { // normal login: password decrypts the token stored in admin/auth.json
        var pw = $('#pw').value;
        return decryptToken(AUTH, pw).then(function (token) {
          localStorage.setItem('ghcfg', JSON.stringify({ repo: AUTH.repo, branch: AUTH.branch, token: token }));
          return verify();
        }, function () { throw new Error('Sai mật khẩu'); });
      }
      // one-time setup: token + chosen password -> commit encrypted admin/auth.json
      var c = { repo: $('#ghRepo').value.trim(), branch: $('#ghBranch').value.trim() || 'main', token: $('#ghToken').value.trim() }, np = $('#ghNewPw').value;
      if (!np) return Promise.reject(new Error('Hãy đặt mật khẩu admin (VD: admin123)'));
      localStorage.setItem('ghcfg', JSON.stringify(c));
      return verify().then(function () { return encryptToken(c, np); }).then(function (blob) {
        return gh('/contents/admin/auth.json?ref=' + encodeURIComponent(c.branch)).then(function (r) { return r.sha; }, function () { return undefined; }).then(function (sha) {
          return gh('/contents/admin/auth.json', 'PUT', { message: 'Set admin password', content: b64utf8(JSON.stringify(blob)), sha: sha, branch: c.branch });
        });
      });
    },
    logout: function () { localStorage.removeItem('ghcfg'); return Promise.resolve(); },
    load: function () {
      var c = ghCfg();
      return gh('/contents/content.json?ref=' + encodeURIComponent(c.branch)).then(function (r) { ghSha = r.sha; return JSON.parse(unb64utf8(r.content)); });
    },
    save: function (d) {
      var c = ghCfg();
      GITHUB.warn = '';
      return ensureOg(d).then(function () {
        return gh('/contents/content.json', 'PUT', { message: 'Update content via admin', content: b64utf8(JSON.stringify(d, null, 2)), sha: ghSha, branch: c.branch });
      }).then(function (r) { ghSha = r.content.sha; return patchIndex(d, c).catch(function (e) { GITHUB.warn = 'Ảnh/tiêu đề khi chia sẻ link chưa cập nhật: ' + e.message; }); });
    },
    upload: function (file, dataUrl) {
      var c = ghCfg(), m = /^data:image\/([a-z+]+);base64,(.+)$/.exec(dataUrl);
      if (!m) return Promise.reject(new Error('Chỉ hỗ trợ ảnh'));
      var ext = { jpeg: 'jpg', 'svg+xml': 'svg' }[m[1]] || m[1], bytes = Uint8Array.from(atob(m[2]), function (ch) { return ch.charCodeAt(0); });
      return crypto.subtle.digest('SHA-1', bytes).then(function (h) {
        var name = Array.prototype.map.call(new Uint8Array(h), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('').slice(0, 12) + '.' + ext, p = 'uploads/' + name;
        return gh('/contents/' + p, 'PUT', { message: 'Upload ' + name, content: m[2], branch: c.branch })
          .catch(function (e) { if (e.status === 422) return null; throw e; }) // same hash => already uploaded
          .then(function () { return { url: p, preview: dataUrl }; });
      });
    },
    reset: null
  };

  // ---------- link preview (Open Graph): image 1200x630 from the first photo + tags in index.html ----------
  function siteBase() { return new URL('../', location.href).href; }
  function makeOgImage(src) {
    return new Promise(function (ok, no) {
      var im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = function () {
        var W = 1200, H = 630, r = Math.max(W / im.naturalWidth, H / im.naturalHeight), sw = W / r, sh = H / r;
        var sx = (im.naturalWidth - sw) / 2, sy = (im.naturalHeight - sh) * 0.1; // keep the top (faces) of tall photos
        var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, W, H); cx.drawImage(im, sx, sy, sw, sh, 0, 0, W, H);
        try { ok(cv.toDataURL('image/jpeg', 0.85)); } catch (e) { no(e); }
      };
      im.onerror = function () { no(new Error('không đọc được ảnh đầu trang')); };
      im.src = src;
    });
  }
  function ensureOg(d) {
    if (!d.heroPhoto || d.ogFrom === d.heroPhoto) return Promise.resolve();
    var src = PREV[d.heroPhoto] || prev(d.heroPhoto);
    return makeOgImage(src).then(function (data) { return GITHUB.upload(null, data); }).then(function (u) { d.ogImage = u.url; d.ogFrom = d.heroPhoto; })
      .catch(function (e) { GITHUB.warn = 'Chưa tạo được ảnh chia sẻ: ' + e.message; });
  }
  function patchIndex(d, c) {
    return gh('/contents/index.html?ref=' + encodeURIComponent(c.branch)).then(function (r) {
      var html = unb64utf8(r.content), out = OG.patch(html, d, siteBase());
      if (out === html) return;
      return gh('/contents/index.html', 'PUT', { message: 'Update link preview tags', content: b64utf8(out), sha: r.sha, branch: c.branch });
    });
  }

  function load() { return BE.load().then(function (j) { D = j; build(); }); }
  function save() {
    collectors.forEach(function (f) { f(); });
    var b = $('#saveBtn'); b.disabled = true;
    return BE.save(D).then(function () { toast(BE.mode === 'github' ? 'Đã commit lên GitHub ✔ (Pages cập nhật sau ~1 phút)' + (GITHUB.warn ? ' — ' + GITHUB.warn : '') : 'Đã lưu ✔'); }, function (e) { toast('Lỗi lưu: ' + e.message); }).then(function () { b.disabled = false; });
  }
  function enter() { $('#login').classList.add('hidden'); $('#app').classList.remove('hidden'); load().catch(function (e) { toast('Lỗi tải: ' + e.message); }); }
  // ---------- password-protected token (static hosting): PBKDF2 -> AES-GCM, blob lives in admin/auth.json ----------
  var AUTH = null, SETUP = false;
  var b2a = function (u8) { var s = ''; for (var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); };
  var a2b = function (s) { return Uint8Array.from(atob(s), function (ch) { return ch.charCodeAt(0); }); };
  function deriveKey(pw, salt) {
    return crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']).then(function (k) {
      return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: 200000, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    });
  }
  function encryptToken(c, pw) {
    var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    return deriveKey(pw, salt).then(function (k) { return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, new TextEncoder().encode(c.token)); })
      .then(function (ct) { return { repo: c.repo, branch: c.branch, salt: b2a(salt), iv: b2a(iv), ct: b2a(new Uint8Array(ct)) }; });
  }
  function decryptToken(a, pw) {
    return deriveKey(pw, a2b(a.salt)).then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: a2b(a.iv) }, k, a2b(a.ct)); })
      .then(function (pt) { return new TextDecoder().decode(pt); });
  }
  function showLogin() {
    $('#login').classList.remove('hidden');
    if (BE.mode === 'github') {
      var c = ghCfg();
      $('#ghRepo').value = c.repo; $('#ghBranch').value = c.branch; $('#ghToken').value = c.token || '';
      var setup = !AUTH || SETUP;
      $('#pwBox').classList.toggle('hidden', setup); $('#ghBox').classList.toggle('hidden', !setup);
      $('#resetAuth').classList.toggle('hidden', setup || !AUTH);
    }
  }
  function boot() {
    // static hosting has no /api -> GitHub mode
    api('/api/me').then(function (j) { return typeof j.ok === 'boolean' ? SERVER : GITHUB; }, function () { return GITHUB; }).then(function (b) {
      BE = b; if (!BE.reset) $('#resetBtn').classList.add('hidden');
      if (BE.mode !== 'github') return BE.check();
      return fetch('auth.json?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
        .then(function (a) { AUTH = a && a.ct ? a : null; return BE.check(); });
    }).then(function (ok) { if (ok) enter(); else showLogin(); });
    $('#resetAuth').addEventListener('click', function (e) { e.preventDefault(); SETUP = true; showLogin(); });
    $('#loginBtn').addEventListener('click', doLogin); $('#pw').addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });
    function doLogin() { $('#loginErr').textContent = ''; BE.login().then(enter, function (e) { $('#loginErr').textContent = e.message; }); }
    $('#saveBtn').addEventListener('click', save);
    $('#logoutBtn').addEventListener('click', function () { BE.logout().then(function () { location.reload(); }); });
    $('#resetBtn').addEventListener('click', function () { if (BE.reset && confirm('Khôi phục toàn bộ nội dung về mặc định? Hành động này không thể hoàn tác.')) BE.reset().then(load).then(function () { toast('Đã khôi phục mặc định'); }); });
    window.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } });
  }
  boot();
})();
