/* Wedding invitation - Minimalism Đỏ Đậm (clone). Content comes from /api/content (or content.json). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var C = {};

  // ---------- helpers ----------
  function parseDate(s) { var p = String(s || '').split('-'); return p.length === 3 ? { y: +p[0], m: +p[1], d: +p[2] } : null; }
  var WEEKDAY = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
  function weekday(dt) { return WEEKDAY[new Date(dt.y, dt.m - 1, dt.d).getDay()]; }
  function tpl(s) { return String(s || '').replace(/\{(\w+)\}/g, function (_, k) { return C[k] == null ? '' : C[k]; }); }

  // ---------- text / image binding ----------
  function setDerived(map) { Object.keys(map).forEach(function (k) { C['_' + k] = map[k]; }); }
  function derive() {
    var cd = parseDate(C.ceremonyDate), pd = parseDate(C.partyDate), o = {};
    if (cd) { o.ceremonyWeekday = weekday(cd); o.ceremonyDay = pad(cd.d); o.ceremonyMonth = (C.monthPrefix || '') + pad(cd.m); o.ceremonyYear = String(cd.y); o.envelopeDate = cd.d + ' tháng ' + cd.m + ', ' + cd.y; }
    if (pd) { o.partyWeekday = weekday(pd); o.partyDay = pad(pd.d); o.partyMonth = (C.monthPrefix || '') + pad(pd.m); o.partyYear = String(pd.y); }
    o.ceremonyAtTime = (C.ceremonyAtPrefix || '') + ' ' + (C.ceremonyTime || '');
    setDerived(o);
  }
  function val(k) { return C['_' + k] != null ? C['_' + k] : C[k]; }
  function applyText() {
    $$('[data-t]').forEach(function (el) {
      var v = val(el.getAttribute('data-t'));
      if (v == null) return;
      var f = el.getAttribute('data-fmt');
      el.textContent = f ? f.replace('{v}', v) : v;
    });
    $$('[data-img]').forEach(function (el) { var v = C[el.getAttribute('data-img')]; if (v) el.src = v; });
    if (C.seoTitle) document.title = C.seoTitle;
    // no reception time -> drop that item; the party start time stays centred
    // empty RSVP label -> no RSVP button
    var rb = $('#rsvpBtn'); if (rb) rb.parentNode.style.display = C.rsvpButton ? '' : 'none';
    var rt = $('[data-t="receptionTime"]'); if (rt) rt.parentNode.style.display = C.receptionTime ? '' : 'none';
  }

  // ---------- dynamic regions ----------
  var HEART = 'M12 21C12 21 1.5 13.5 1.5 7.5C1.5 4.46 3.96 2 7 2C8.76 2 10.35 2.81 11.4 4.09L12 4.8L12.6 4.09C13.65 2.81 15.24 2 17 2C20.04 2 22.5 4.46 22.5 7.5C22.5 13.5 12 21 12 21Z';
  var CAL_DAY = 'flex items-center justify-center h-[30px] md:h-[34px]';
  function renderCalendar() {
    var pd = parseDate(C.partyDate); if (!pd) return;
    $('[data-render="cal-title"]').textContent = 'Tháng ' + pd.m + ' / ' + pd.y;
    var first = (new Date(pd.y, pd.m - 1, 1).getDay() + 6) % 7, n = new Date(pd.y, pd.m, 0).getDate(), h = '';
    for (var i = 0; i < first; i++) h += '<div class="' + CAL_DAY + '"></div>';
    for (var d = 1; d <= n; d++) {
      h += '<div class="' + CAL_DAY + '">' + (d === pd.d
        ? '<div class="relative w-[26px] h-[24px] md:w-[30px] md:h-[28px] flex items-center justify-center"><svg viewBox="0 0 24 22" class="absolute inset-0 w-full h-full drop-shadow-sm" fill="#511419"><path d="' + HEART + '"></path></svg><span class="relative z-10 text-[11px] md:text-[12px] font-bold" style="color:#fff">' + d + '</span></div>'
        : '<span class="text-[12px] md:text-[13px]">' + d + '</span>') + '</div>';
    }
    $('[data-render="cal-grid"]').innerHTML = h;
  }
  function partyStartUTC() {
    var pd = parseDate(C.partyDate), t = String(C.partyTime || '00:00').split(':');
    if (!pd) return null;
    return new Date(Date.UTC(pd.y, pd.m - 1, pd.d, (+t[0] || 0) - 7, +t[1] || 0, 0)); // Asia/Ho_Chi_Minh = UTC+7
  }
  function renderLinks() {
    var st = partyStartUTC(), a = $('[data-render="cal-link"]');
    if (st) {
      var f = function (d) { return d.toISOString().replace(/[-:]|\.\d{3}/g, ''); };
      var en = new Date(st.getTime() + 2 * 3600 * 1000);
      a.href = 'https://www.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(tpl(C.calendarEventTitle)) + '&dates=' + f(st) + '/' + f(en) + '&ctz=Asia/Ho_Chi_Minh&details=' + encodeURIComponent(tpl(C.calendarEventDetails)) + '&location=' + encodeURIComponent(C.venueAddress || '');
    }
    var q = encodeURIComponent(String(C.venueAddress || '').replace(/\s*\n\s*/g, ', '));
    var dir = C.mapDirectionsUrl || ('https://www.google.com/maps/dir/?api=1&destination=' + q);
    // embed source: accepts a plain URL or a pasted <iframe ... src="..."> snippet. Share links (maps.app.goo.gl)
    // cannot be framed by Google, so they are ignored and the map is built from the address instead.
    var emb = String(C.mapEmbedUrl || '').trim(), im = /src\s*=\s*["']([^"']+)["']/i.exec(emb);
    if (im) emb = im[1].replace(/&amp;/g, '&');
    var ft = /[?&]ftid=0x[0-9a-f]+:0x([0-9a-f]+)/i.exec(emb); // long Google Maps link with a place id -> exact place embed
    if (ft && window.BigInt) emb = 'https://www.google.com/maps?cid=' + BigInt('0x' + ft[1]).toString() + '&output=embed';
    // use the URL as entered when it is an embeddable Google Maps URL (/maps/embed... or ...output=embed)
    if (!/^https:\/\/((www|maps)\.)?google\.[a-z.]+\/maps(\/embed|[/?].*[?&]output=embed)/i.test(emb)) emb = '';
    var frame = $('[data-render="map"]');
    if (C.mapImage) { // a static map picture replaces the iframe; clicking it opens directions
      var a = document.createElement('a'); a.href = dir; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.className = frame.className.replace('overflow-hidden', 'overflow-hidden block'); a.style.cssText = 'display:block';
      var img = document.createElement('img'); img.src = C.mapImage; img.alt = 'Bản đồ'; img.className = 'h-full w-full object-cover';
      a.appendChild(img); frame.parentNode.replaceChild(a, frame);
    } else frame.src = emb || ('https://www.google.com/maps?q=' + q + '&output=embed');
    $('[data-render="dir-link"]').href = dir;
  }
  function renderTimeline() {
    var items = C.timeline || [], h = '', n = items.length;
    var FONT = 'font-family:&quot;Times New Roman&quot;, ChungDoiIndic, serif';
    items.forEach(function (it, i) {
      var first = i === 0, last = i === n - 1;
      var line = last ? 'absolute left-1/2 -translate-x-1/2 w-px -top-8 md:-top-10 bottom-1/2'
        : first ? 'absolute left-1/2 -translate-x-1/2 w-px top-1/2 -bottom-8 md:-bottom-10'
          : 'absolute left-1/2 -translate-x-1/2 w-px -top-8 md:-top-10 -bottom-8 md:-bottom-10';
      var icon = it.icon ? '<span class="relative inline-block"><span aria-hidden="true" class="absolute top-1/2 flex w-max items-center justify-center -translate-y-1/2 right-full" style="margin-right:30px"><img src="' + esc(it.icon) + '" alt="" aria-hidden="true" class="block h-10 w-10 shrink-0 object-contain"/></span>' + esc(it.time) + '</span>' : esc(it.time);
      h += '<li class="contents"><span class="pt-0.5 text-right text-[16px] md:text-[17px] tabular-nums tracking-wide leading-snug" style="color:#ece4d8;' + FONT + '">' + icon + '</span>' +
        '<span aria-hidden="true" class="relative flex items-center justify-center self-stretch"><span class="' + line + '" style="background-color:color-mix(in srgb, #ece4d8 40%, transparent)"></span><span class="relative block h-2.5 w-2.5 rounded-full" style="background-color:#ece4d8;box-shadow:0 0 0 2px color-mix(in srgb, #ece4d8 13%, transparent)"></span></span>' +
        '<span class="text-[13px] md:text-[15px]" style="color:rgba(236,228,216,0.7);' + FONT + '"><span dir="auto">' + esc(it.label) + '</span></span></li>';
    });
    var ol = $('[data-render="timeline"]'); ol.innerHTML = h;
    // empty timeline -> hide the whole section (card + flower)
    var tsec = ol.closest('section'); if (tsec) tsec.style.display = n ? '' : 'none';
  }
  function renderDress() {
    var dwrap = $('[data-render="dress"]').parentNode;
    // nothing to show -> hide the dress code block
    dwrap.style.display = (C.dressTitle || C.dressDesc || (C.dressColors || []).length) ? '' : 'none';
    $('[data-render="dress"]').innerHTML = (C.dressColors || []).map(function (c) {
      var light = /^#?e[c-f]e4d8$/i.test(c);
      return '<div class="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-md" style="background-color:' + esc(c) + ';border:' + (light ? '1.5px solid #51141930' : 'none') + '"></div>';
    }).join('');
  }
  // timestamps are stored as ISO strings and shown in the viewer's local time, e.g. "12:30:49 26/7/2026"
  function fmtTime(v) { var d = new Date(v); if (isNaN(d.getTime())) return String(v == null ? '' : v); return d.getHours() + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + ' ' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear(); }
  function fmtNow() { return new Date().toISOString(); }
  var LS = 'wedding-guestbook-v1';
  function localComments() { try { return JSON.parse(localStorage.getItem(LS) || '[]'); } catch (e) { return []; } }
  function renderGuestbook() {
    var list = localComments().slice().reverse().concat(C.guestbook || []);
    $('[data-render="guestbook"]').innerHTML = list.map(function (g) {
      return '<div class="rounded-[8px] border p-4 text-sm" style="border-color:#51141955;background-color:rgba(255,255,255,0.55)"><div class="flex items-start justify-between"><span class="font-semibold" style="color:#511419">' + esc(g.name) + '</span><span class="text-xs opacity-70">' + esc(fmtTime(g.time)) + '</span></div><p class="mt-2 leading-relaxed">' + esc(g.message) + '</p></div>';
    }).join('');
  }
  function renderGifts() {
    // no gift accounts -> hide the whole 'Hộp Quà Mừng' block (title, envelope button, dialog)
    var gblk = $('#giftBtn').closest('div.flex.flex-col.items-center.justify-center.py-8'); if (gblk) gblk.style.display = (C.gifts || []).length ? '' : 'none';
    var SAVE = '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>';
    $('[data-render="gifts"]').innerHTML = (C.gifts || []).map(function (g, i) {
      return '<div class="flex flex-col items-center flex-1 max-w-[180px] sm:max-w-none"><h3 class="mb-2 text-xs min-h-[2rem] flex items-start justify-center font-medium text-center line-clamp-2" style="color:#511419">' + esc(g.label) + '</h3>' +
        '<div class="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-xl p-2 shadow-lg flex items-center justify-center" style="border:2px solid #51141920"><img src="' + esc(g.qr) + '" alt="QR - ' + esc(g.label) + '" class="w-full h-full object-contain"/></div>' +
        '<div class="mt-2 text-center space-y-0.5"><p class="text-[10px]" style="color:#511419">' + esc(g.bank) + '</p><p class="text-[10px] font-mono" style="color:#511419">' + esc(g.number) + '</p><p class="text-[10px] font-semibold" style="color:#511419">' + esc(g.holder) + '</p></div>' +
        '<button type="button" data-saveqr="' + i + '" class="mt-1.5 text-[10px] px-2 py-1 inline-flex items-center gap-1 font-medium rounded-full transition-colors" style="color:#511419;background-color:#51141915">' + SAVE + esc(C.saveQrLabel || 'Lưu QR') + '</button></div>';
    }).join('');
    $$('[data-saveqr]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var g = C.gifts[+b.getAttribute('data-saveqr')], a = document.createElement('a');
        a.href = g.qr; a.download = 'qr-' + (g.holder || 'gift') + '.png'; document.body.appendChild(a); a.click(); a.remove();
      });
    });
  }
  function renderCountdown() {
    var el = $('[data-render="countdown"]'), st = partyStartUTC();
    if (!el) return;
    if (!st) { el.textContent = 'Ngày không hợp lệ'; return; }
    function tick() {
      var diff = st.getTime() - Date.now();
      if (diff <= 0) { var blk = el.closest('.flex.items-center.justify-center.flex-col'); if (blk) blk.parentNode.removeChild(blk); clearInterval(iv); return; } // original hides the countdown once the date has passed
      var d = Math.floor(diff / 864e5), h = Math.floor(diff % 864e5 / 36e5), m = Math.floor(diff % 36e5 / 6e4), s = Math.floor(diff % 6e4 / 1e3);
      el.textContent = d + ' ngày ' + h + ' giờ ' + m + ' phút ' + s + ' giây';
    }
    var iv = setInterval(tick, 1000); tick();
  }

  // ---------- album (3D cover-flow) ----------
  function initAlbum() {
    var imgs = C.gallery || [], n = imgs.length, cur = 0, hover = false, hoverTimer = null, visible = false, ratios = {};
    var host = $('[data-render="slides"]'), dots = $('[data-render="dots"]'), stage = $('[data-album="stage"]');
    if (!n) { stage.parentNode.style.display = 'none'; return; }
    host.innerHTML = imgs.map(function (src, i) {
      return '<div class="absolute h-[92%] rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all ease-in-out" data-slide="' + i + '" style="transition-duration:1100ms"><img src="' + esc(src) + '" alt="Wedding photo ' + (i + 1) + '" class="h-full w-full object-cover" style="object-position:50% 50%"></div>';
    }).join('');
    var slides = $$('[data-slide]', host);
    slides.forEach(function (el, i) {
      var im = el.firstChild;
      im.addEventListener('load', function () { if (im.naturalWidth && !ratios[i]) { ratios[i] = im.naturalWidth / im.naturalHeight; layout(); } });
      el.addEventListener('click', function () { if (i === cur) openLightbox(i); else { cur = i; layout(); pause(); } });
    });
    function off(i) { var t = i - cur; return t > n / 2 ? t - n : t < -n / 2 ? t + n : t; }
    function layout() {
      slides.forEach(function (el, i) {
        var o = off(i), a = Math.abs(o), sc = Math.max(.7, 1 - .15 * a), op = Math.max(.3, 1 - .25 * a);
        el.style.aspectRatio = Math.min(1.2, Math.max(.5, ratios[i] || 2 / 3));
        el.style.transform = 'translateX(' + (60 * o) + '%) translateZ(' + (-(150 * a)) + 'px) rotateY(' + (45 * o) + 'deg) scale(' + sc + ')';
        el.style.opacity = op; el.style.zIndex = 100 - a;
        el.classList.toggle('ring-2', a === 0); el.classList.toggle('ring-white/30', a === 0);
      });
      if (n <= 7) {
        dots.innerHTML = imgs.map(function (_, i) { return '<button type="button" aria-label="Go to photo ' + (i + 1) + '" data-dot="' + i + '" class="rounded-full transition-all duration-300 ' + (i === cur ? 'w-6 h-2 bg-current opacity-70' : 'w-2 h-2 bg-current opacity-25 hover:opacity-40') + '"></button>'; }).join('');
      } else dots.innerHTML = '<span class="text-sm tabular-nums opacity-60">' + (cur + 1) + ' / ' + n + '</span>';
    }
    dots.addEventListener('click', function (e) { var b = e.target.closest('[data-dot]'); if (b) { cur = +b.getAttribute('data-dot'); layout(); pause(); } });
    function next() { cur = (cur + 1) % n; layout(); } function prev() { cur = (cur - 1 + n) % n; layout(); }
    function pause() { hover = true; clearTimeout(hoverTimer); hoverTimer = setTimeout(function () { hover = false; }, 6000); }
    var pv = $('[data-album="prev"]'), nx = $('[data-album="next"]');
    if (n <= 1) { pv.style.display = nx.style.display = 'none'; }
    pv.addEventListener('click', function () { pause(); prev(); }); nx.addEventListener('click', function () { pause(); next(); });
    var wrap = stage.parentNode, inside = false;
    wrap.addEventListener('mouseenter', function () { clearTimeout(hoverTimer); hover = true; inside = true; });
    wrap.addEventListener('mouseleave', function () { hover = false; inside = false; });
    var tx = null;
    stage.addEventListener('touchstart', function (e) { tx = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (!tx) return; var dx = e.changedTouches[0].clientX - tx.x, dy = Math.abs(e.changedTouches[0].clientY - tx.y); tx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > dy) { dx < 0 ? next() : prev(); pause(); }
    }, { passive: true });
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { rootMargin: '300px 0px' }).observe(wrap);
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (n > 1 && !reduce) setInterval(function () { if (visible && !hover) next(); }, 1400);
    layout();

    // lightbox
    var lb = $('#lightbox'), lbImg = $('[data-lb="img"]'), thumbs = $('[data-lb="thumbs"]'), li = 0;
    $('[data-lb="total"]').textContent = n;
    thumbs.innerHTML = imgs.map(function (s, i) { return '<button type="button" data-th="' + i + '" class="flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-md sm:rounded-lg overflow-hidden transition-all duration-200" aria-label="View image ' + (i + 1) + '"><img src="' + esc(s) + '" class="h-full w-full object-cover" alt="Thumbnail ' + (i + 1) + '" draggable="false"></button>'; }).join('');
    function lbShow(i) {
      li = (i + n) % n; lbImg.src = imgs[li]; lbImg.alt = 'Ảnh cưới ' + (li + 1); $('[data-lb="idx"]').textContent = li + 1;
      $$('[data-th]', thumbs).forEach(function (b, k) {
        var on = k === li;
        b.className = 'flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-md sm:rounded-lg overflow-hidden transition-all duration-200 ' + (on ? 'scale-105 shadow-lg' : 'opacity-60 hover:opacity-100');
        b.style.outline = on ? '2px solid #511419' : ''; b.style.outlineOffset = on ? '2px' : '';
        if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      });
    }
    function openLightbox(i) { lbShow(i); if (lb.showModal) lb.showModal(); else lb.setAttribute('open', ''); }
    thumbs.addEventListener('click', function (e) { e.stopPropagation(); var b = e.target.closest('[data-th]'); if (b) lbShow(+b.getAttribute('data-th')); });
    $('[data-lb="prev"]').addEventListener('click', function (e) { e.stopPropagation(); lbShow(li - 1); });
    $('[data-lb="next"]').addEventListener('click', function (e) { e.stopPropagation(); lbShow(li + 1); });
    lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') lbShow(li - 1); else if (e.key === 'ArrowRight') lbShow(li + 1); });
    lb.addEventListener('click', function (e) { if (e.target.closest('.modal-box') && e.target === e.target.closest('.modal-box') || e.target.classList.contains('modal-box')) lb.close(); });
    lbImg.addEventListener('click', function (e) { e.stopPropagation(); });
  }

  // ---------- gift dialog, guestbook form ----------
  function initGift() {
    var dlg = $('#giftDialog'), btn = $('#giftBtn');
    btn.addEventListener('click', function () { dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', ''); });
    $('[data-close="gift"]').addEventListener('click', function () { dlg.close(); });
  }
  function initGuestbook() {
    $('#gbForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, name = f.querySelector('input').value.trim(), msg = f.querySelector('textarea').value.trim();
      if (!name || !msg) return;
      var arr = localComments(); arr.push({ name: name, message: msg, time: fmtNow() });
      try { localStorage.setItem(LS, JSON.stringify(arr.slice(-20))); } catch (er) {}
      f.reset(); renderGuestbook();
    });
    var gi = $('#gbForm input'), gt = $('#gbForm textarea');
    if (C.guestbookNamePlaceholder) gi.placeholder = C.guestbookNamePlaceholder;
    if (C.guestbookMessagePlaceholder) gt.placeholder = C.guestbookMessagePlaceholder;
  }

  // ---------- envelope ----------
  function rng(seed) { var t = seed >>> 0; return function () { t = t + 0x6d2b79f5 >>> 0; var x = Math.imul(t ^ t >>> 15, 1 | t); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { var t = 0x811c9dc5; for (var i = 0; i < s.length; i++) { t ^= s.charCodeAt(i); t = Math.imul(t, 0x1000193); } return t >>> 0; }
  var COLORS = ['#a8323b', '#ece4d8', '#c9a24a', '#7a1f26'];
  var HEART_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>';
  function ambientHearts() {
    // the 12 hearts are the exact values rendered by the original page (its seed is not recoverable)
    var HS = [[30.328110058326274, 0, 13.239518091082573, 28.045056760311127, 24.864892337471247, -21.653968180870642], [17.2156402352266, 1, 22.52704422408715, 0.5086997570469975, 25.939923219382763, -10.373923639564312], [70.28673367807642, 2, 17.490823671221733, -28.064687317237258, 25.735697017982602, -8.38276002209779], [33.55705370660871, 0, 22.95301177399233, 29.648285089060664, 20.143269890919328, -19.691254769751314], [26.469557804521173, 2, 23.15696965251118, -12.885547913610935, 25.567597473040223, -13.424423354492045], [83.32324994262308, 2, 22.533293027430773, -25.829533128999174, 24.974357422441244, -0.10417875222258054], [9.044427201151848, 0, 18.041713471524417, 4.726191689260304, 23.068060817196965, -0.3111351032288825], [69.74547695368528, 2, 12.927935962565243, 23.722335817292333, 20.770730067044497, -7.488872562911941], [18.21989078540355, 1, 22.310039413161576, 25.63739493023604, 21.859994553029537, -20.672057977395454], [51.80270069278777, 3, 20.954792595934123, -15.57284370996058, 18.015412013977766, -0.6715260601425447], [25.922949633095413, 3, 17.78661971958354, 5.172966560348868, 24.570506004616618, -23.242164605190787], [91.75902127986774, 2, 12.577464719302952, -11.355045181699097, 20.06618256494403, -0.4162974501267686]];
    $('#envHearts').innerHTML = HS.map(function (a) {
      return '<div style="left:' + a[0] + '%;top:-30px;bottom:auto;color:' + COLORS[a[1]] + ';font-size:' + a[2] + 'px;--sway:' + a[3] + 'px;animation:ambient-fall ' + a[4] + 's ease-in-out ' + a[5] + 's infinite" class="absolute">' + HEART_SVG + '</div>';
    }).join('');
  }
  function chime() {
    try {
      var e = new (window.AudioContext || window.webkitAudioContext)(), t = e.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { var o = e.createOscillator(), g = e.createGain(); o.connect(g); g.connect(e.destination); o.type = 'sine'; var l = t + .1 * i; o.frequency.setValueAtTime(f, l); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.035 - .005 * i, l + .01); g.gain.exponentialRampToValueAtTime(.001, l + 1.8); o.start(l); o.stop(l + 1.8); });
      [1567.98, 2093].forEach(function (f, i) { var o = e.createOscillator(), g = e.createGain(); o.connect(g); g.connect(e.destination); o.type = 'sine'; var l = t + .35 + .1 * i; o.frequency.setValueAtTime(f, l); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.015, l + .02); g.gain.exponentialRampToValueAtTime(.001, l + 1.2); o.start(l); o.stop(l + 1.2); });
      var a = e.createOscillator(), r = e.createGain(), n = e.createBiquadFilter(); a.connect(n); n.connect(r); r.connect(e.destination); a.type = 'sine'; a.frequency.setValueAtTime(261.63, t); n.type = 'lowpass'; n.frequency.value = 400;
      r.gain.setValueAtTime(0, t); r.gain.linearRampToValueAtTime(.025, t + .4); r.gain.setValueAtTime(.02, t + 1); r.gain.exponentialRampToValueAtTime(.001, t + 2.5); a.start(t); a.stop(t + 2.5);
      setTimeout(function () { [783.99, 987.77, 1174.66, 1567.98].forEach(function (f, i) { var o = e.createOscillator(), g = e.createGain(); o.connect(g); g.connect(e.destination); o.type = 'sine'; var s = e.currentTime + .06 * i; o.frequency.setValueAtTime(f, s); g.gain.setValueAtTime(0, e.currentTime); g.gain.linearRampToValueAtTime(.025, s + .01); g.gain.exponentialRampToValueAtTime(.001, s + .6); o.start(s); o.stop(s + .6); }); }, 1200);
    } catch (er) {}
  }
  function playMusic() {
    var a = $('#bgm'); if (!a || !a.src) return;
    try { if (a.readyState < 2) a.load(); var p = a.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  }
  function initEnvelope() {
    var env = $('#envelope'), state = 'idle', done = false, lastClick = 0;
    document.documentElement.classList.add('env-lock');
    var inv = $('[data-landing-screenshot-id="invite-renderer"]'); if (!/[?&]open=1(&|$)/.test(location.search)) inv.style.display = 'none'; // original mounts the invitation only after opening
    ambientHearts();
    function finish() { if (done) return; done = true; env.parentNode.removeChild(env); inv.style.display = ''; document.documentElement.classList.remove('env-lock'); window.scrollTo(0, 0); window.dispatchEvent(new Event('resize')); }
    function particles() {
      var h = '';
      for (var i = 0; i < 32; i++) {
        var ang = 2 * Math.PI * i / 32 + (Math.random() - .5) * .4, rr = 25 + 60 * Math.random(), x = 50 + Math.cos(ang) * rr, y = 50 + Math.sin(ang) * rr;
        h += '<div style="color:' + COLORS[Math.floor(Math.random() * 4)] + ';font-size:' + (10 + 16 * Math.random()) + 'px;text-shadow:0 0 10px currentColor;--dx:' + ((x - 50) * 5) + 'px;--dy:' + ((y - 50) * 5) + 'px;--rot-start:' + ((Math.random() - .5) * 30) + 'deg;--rot-end:' + ((Math.random() - .5) * 360) + 'deg;animation:particle-burst 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) ' + (.15 * Math.random()) + 's forwards" class="absolute left-1/2 top-1/2">' + HEART_SVG + '</div>';
      }
      var d = document.createElement('div'); d.style.zIndex = 100; d.className = 'absolute inset-0 pointer-events-none'; d.innerHTML = h; env.appendChild(d);
      setTimeout(function () { d.remove(); }, 1500);
    }
    if (/[?&]open=1(&|$)/.test(location.search)) { finish(); return; } // same as original: ?open=1 skips the envelope
    $('#openBtn').addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      if (state !== 'idle') return;
      state = 'opening'; lastClick = Date.now();
      playMusic(); chime();
      var seal = $('#envSeal'), card = seal.nextElementSibling;
      seal.style.animation = 'seal-break 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards';
      var ring = document.createElement('div');
      ring.className = 'absolute left-1/2 rounded-full pointer-events-none';
      ring.style.cssText = 'top:50px;width:56px;height:56px;transform:translate(-50%, -50%);border:3px solid #511419;z-index:29;animation:seal-ring 0.6s ease-out forwards';
      seal.parentNode.insertBefore(ring, seal.nextSibling);
      var glow = document.createElement('div');
      glow.className = 'absolute inset-0 pointer-events-none transition-opacity duration-300';
      glow.style.background = 'radial-gradient(ellipse at center top, rgba(81, 20, 25, 0.2) 0%, transparent 70%)';
      var cardBg = $('#envBox .rounded-lg > .absolute.inset-0'); if (cardBg) cardBg.appendChild(glow);
      setTimeout(function () { particles(); state = 'away'; $('#envBox').style.animation = 'envelope-away 0.8s ease-in forwards'; }, 500);
      setTimeout(finish, 1300);
      setTimeout(finish, 2600);
    });
    $('#openBtn').addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } });
  }
  function initMusic() {
    var a = $('#bgm'), m = C.music || {};
    if (!m.enabled || !m.url) return;
    a.volume = m.volume == null ? .5 : m.volume; a.loop = true; a.preload = 'auto'; a.src = m.url;
  }

  // ---------- auto-fit couple names (port of the original useAutoFit: base 43px mobile / 46px >=768px) ----------
  function measure(text, px, family) {
    var s = document.createElement('span');
    s.style.cssText = 'visibility:hidden;position:absolute;white-space:nowrap;font-size:' + px + 'px;font-family:' + family;
    s.textContent = text; document.body.appendChild(s); var w = s.offsetWidth; document.body.removeChild(s); return w;
  }
  function fitNames() {
    var hs = $$('[data-t="groomFull"],[data-t="brideFull"]'); if (!hs.length) return;
    var fam = '"Viaoda Libre", "The Nautigal", ChungDoiIndic, cursive', M = 43, T = 46;
    function one(el) {
      var text = el.textContent, w = el.offsetWidth; if (!w) return null;
      var m = window.innerWidth >= 768 ? T : M, min = Math.min(Math.max(12, .5 * m), 24), h = w, g = measure(text, m, fam), x = m;
      if (g > h) { x = h / g * m * .95; x = Math.max(min, Math.min(m, x)); }
      var y = Math.round(x), b = measure(text, y, fam);
      if (b > h && y > min) { y = Math.max(min, Math.round(h / b * y * .95)); b = measure(text, y, fam); if (b > h && y > min) y = Math.max(min, Math.floor(h / b * y * .95)); }
      while (y > min && measure(text, y, fam) > h) y--;
      return y;
    }
    function run() { var a = hs.map(one); if (a.some(function (v) { return v == null; })) return; var v = Math.min.apply(null, a); hs.forEach(function (el) { el.style.fontSize = v + 'px'; }); }
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
      var l = document.fonts && document.fonts.load ? document.fonts.load('43px "Viaoda Libre"', hs[0].textContent) : null;
      return l && l.catch ? l.catch(function () {}) : l;
    }).then(function () { requestAnimationFrame(function () { requestAnimationFrame(run); }); });
    window.addEventListener('resize', run);
  }

  // parents' names: SSR is 12px, original hydrates to 14px from md (>=768px)
  function parentSize() {
    var f = function () { var px = window.innerWidth >= 768 ? '14px' : '12px'; $$('[data-t="groomFather"],[data-t="groomMother"],[data-t="brideFather"],[data-t="brideMother"]').forEach(function (e) { e.parentNode.style.fontSize = px; }); };
    f(); window.addEventListener('resize', f);
  }

  // ---------- boot ----------
  function load() {
    // relative URLs: works at the site root and under a sub-path (GitHub Pages /<repo>/)
    return fetch('api/content', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .catch(function () { return fetch('content.json?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.json(); }); })
      .then(function norm(v) { // legacy "/images/x" -> "images/x"
        if (typeof v === 'string') return /^\/(images|uploads)\//.test(v) ? v.slice(1) : v;
        if (Array.isArray(v)) return v.map(norm);
        if (v && typeof v === 'object') { Object.keys(v).forEach(function (k) { v[k] = norm(v[k]); }); }
        return v;
      });
  }
  // the HTML ships default text; stay hidden until the real content is applied (no flash of old names)
  var revealed = false;
  function reveal() { if (revealed) return; revealed = true; document.documentElement.classList.remove('loading'); }
  setTimeout(reveal, 4000);
  load().then(function (data) {
    C = data; derive(); applyText();
    renderCalendar(); renderLinks(); renderTimeline(); renderDress(); renderGuestbook(); renderGifts(); renderCountdown();
    parentSize(); fitNames(); initAlbum(); initGift(); initGuestbook(); initMusic(); initEnvelope();
    requestAnimationFrame(function () { requestAnimationFrame(reveal); });
    // clicking anywhere also starts the music (as on the original page)
    document.addEventListener('click', function () { var a = $('#bgm'); if (!$('#envelope') && a && a.src && a.paused && !a._started) { a._started = true; playMusic(); } }, true);
  }, reveal);
})();
