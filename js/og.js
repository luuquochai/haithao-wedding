/* Link-preview (Open Graph) helper, used by the admin. Crawlers (Zalo/Messenger/Facebook) do not run JS,
   so the tags must live in the static index.html; the admin rewrites the block between the og markers on save. */
(function (root) {
  'use strict';
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  function abs(base, p) { return !p ? '' : /^(https?:)?\/\//i.test(p) ? p : base + String(p).replace(/^\//, ''); }
  function fmtDate(s) { var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s || ''); return m ? (+m[3]) + ' tháng ' + (+m[2]) + ', ' + m[1] : ''; }
  // base: site root URL ending with "/", e.g. https://user.github.io/repo/
  function describe(c) {
    var d = fmtDate(c.partyDate || c.ceremonyDate), place = String(c.venueAddress || '').split('\n')[0].trim();
    return 'Trân trọng kính mời quý khách đến chung vui ngày trọng đại cùng gia đình chúng tôi.' + (d ? ' Tổ chức ngày ' + d : '') + (place ? ' tại ' + place : '') + '.';
  }
  function build(c, base) {
    var title = c.seoTitle || 'Thiệp mời cưới', desc = describe(c), img = abs(base, c.ogImage || c.heroPhoto), url = base;
    return ['<!--og:start-->',
      '<meta property="og:type" content="website"/>',
      '<meta property="og:locale" content="vi_VN"/>',
      '<meta property="og:title" content="' + esc(title) + '"/>',
      '<meta property="og:description" content="' + esc(desc) + '"/>',
      '<meta property="og:url" content="' + esc(url) + '"/>',
      img ? '<meta property="og:image" content="' + esc(img) + '"/>' : '',
      img ? '<meta property="og:image:alt" content="' + esc(title) + '"/>' : '',
      '<meta name="twitter:card" content="summary_large_image"/>',
      '<meta name="twitter:title" content="' + esc(title) + '"/>',
      '<meta name="twitter:description" content="' + esc(desc) + '"/>',
      img ? '<meta name="twitter:image" content="' + esc(img) + '"/>' : '',
      '<!--og:end-->'].filter(Boolean).join('\n');
  }
  // returns patched html (title, description and og block)
  function patch(html, c, base) {
    var title = c.seoTitle || 'Thiệp mời cưới', desc = describe(c);
    html = html.replace(/<title data-title>[\s\S]*?<\/title>/, '<title data-title>' + esc(title) + '</title>');
    html = html.replace(/<meta name="description" content="[^"]*"\s*\/>/, '<meta name="description" content="' + esc(desc) + '"/>');
    var block = build(c, base);
    if (/<!--og:start-->[\s\S]*?<!--og:end-->/.test(html)) return html.replace(/<!--og:start-->[\s\S]*?<!--og:end-->/, function () { return block; });
    return html.replace('</head>', block + '\n</head>');
  }
  var api = { build: build, patch: patch, describe: describe };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.OG = api;
})(typeof window !== 'undefined' ? window : this);
