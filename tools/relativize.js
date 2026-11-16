// One-off: make every site-root path relative so the site works at / and under /<repo>/ (GitHub Pages).
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const rw = (f, fn) => { const p = path.join(R, f); const a = fs.readFileSync(p, 'utf8'), b = fn(a); if (a !== b) { fs.writeFileSync(p, b); console.log('updated', f); } };

// build.py output: attributes + inline styles
rw('index.html', s => s
  .replace(/(href|src)="\/(?!\/)/g, '$1="')
  .replace(/url\(&quot;\/images/g, 'url(&quot;images')
  .replace(/src="\/js\/app\.js"/, 'src="js/app.js"'));
// font urls inside the big stylesheet: css lives in _next/static/css/
rw('_next/static/css/d037ca79ab5530a8.css', s => s.replace(/url\(\/fonts\//g, 'url(../../../fonts/'));
// default content
rw('content.json', s => s.replace(/"\/(images|uploads)\//g, '"$1/'));
