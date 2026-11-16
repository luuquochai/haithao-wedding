// Zero-dependency static server + tiny admin API.   node server.js   (PORT=3000, ADMIN_PASSWORD=...)
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = __dirname, PORT = +process.env.PORT || 3000, PASS = process.env.ADMIN_PASSWORD || 'admin123';
const DATA = path.join(ROOT, 'data'), UPL = path.join(ROOT, 'uploads');
[DATA, UPL].forEach(d => fs.mkdirSync(d, { recursive: true }));
const FILE = path.join(DATA, 'content.json'), DEFAULT = path.join(ROOT, 'content.json');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };
const tokens = new Set();
const readContent = () => fs.readFileSync(fs.existsSync(FILE) ? FILE : DEFAULT, 'utf8');
const send = (res, code, body, type = 'application/json; charset=utf-8') => { res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };
const body = (req, max = 30e6) => new Promise((ok, no) => { const c = []; let n = 0; req.on('data', d => { n += d.length; if (n > max) { no(new Error('too large')); req.destroy(); } else c.push(d); }); req.on('end', () => ok(Buffer.concat(c).toString('utf8'))); req.on('error', no); });
const authed = req => tokens.has((/(?:^|; )adm=([a-f0-9]+)/.exec(req.headers.cookie || '') || [])[1]);

http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://x'); let p = decodeURIComponent(u.pathname);
    if (p === '/api/content' && req.method === 'GET') return send(res, 200, readContent());
    if (p === '/api/content' && req.method === 'POST') {
      if (!authed(req)) return send(res, 401, { error: 'unauthorized' });
      const j = JSON.parse(await body(req)); fs.writeFileSync(FILE, JSON.stringify(j, null, 2)); return send(res, 200, { ok: true });
    }
    if (p === '/api/content/reset' && req.method === 'POST') {
      if (!authed(req)) return send(res, 401, { error: 'unauthorized' }); if (fs.existsSync(FILE)) fs.unlinkSync(FILE); return send(res, 200, { ok: true });
    }
    if (p === '/api/login' && req.method === 'POST') {
      const j = JSON.parse(await body(req, 1e4));
      const a = Buffer.from(String(j.password || '')), b = Buffer.from(PASS);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return send(res, 401, { error: 'Sai mật khẩu' });
      const t = crypto.randomBytes(24).toString('hex'); tokens.add(t);
      res.setHeader('Set-Cookie', `adm=${t}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`); return send(res, 200, { ok: true });
    }
    if (p === '/api/me') return send(res, 200, { ok: authed(req) });
    if (p === '/api/logout' && req.method === 'POST') { tokens.delete((/(?:^|; )adm=([a-f0-9]+)/.exec(req.headers.cookie || '') || [])[1]); return send(res, 200, { ok: true }); }
    if (p === '/api/upload' && req.method === 'POST') {
      if (!authed(req)) return send(res, 401, { error: 'unauthorized' });
      const j = JSON.parse(await body(req)), m = /^data:(image\/(?:webp|png|jpeg|gif|svg\+xml));base64,(.+)$/.exec(j.data || '');
      if (!m) return send(res, 400, { error: 'Chỉ hỗ trợ ảnh webp/png/jpg/gif/svg' });
      const ext = { 'image/webp': '.webp', 'image/png': '.png', 'image/jpeg': '.jpg', 'image/gif': '.gif', 'image/svg+xml': '.svg' }[m[1]];
      const buf = Buffer.from(m[2], 'base64'), name = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12) + ext;
      fs.writeFileSync(path.join(UPL, name), buf); return send(res, 200, { url: '/uploads/' + name });
    }
    // static
    if (p.endsWith('/')) p += 'index.html';
    if (p === '/admin') { res.writeHead(302, { Location: '/admin/' }); return res.end(); }
    const f = path.normalize(path.join(ROOT, p));
    if (!f.startsWith(ROOT + path.sep) || /(^|[\\/])(data|_src|tools|node_modules|server\.js)([\\/]|$)/.test(path.relative(ROOT, f)) || path.basename(f).startsWith('.')) return send(res, 404, 'Not found', 'text/plain');
    fs.stat(f, (e, st) => {
      if (e || !st.isFile()) return send(res, 404, 'Not found', 'text/plain');
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': f.includes(path.sep + 'uploads' + path.sep) ? 'public, max-age=31536000' : 'no-cache' });
      fs.createReadStream(f).pipe(res);
    });
  } catch (e) { send(res, 500, { error: String(e.message || e) }); }
}).listen(PORT, () => console.log(`Invitation:  http://localhost:${PORT}/\nAdmin:       http://localhost:${PORT}/admin/   (password: ${process.env.ADMIN_PASSWORD ? '[from ADMIN_PASSWORD]' : 'admin123'})`));
