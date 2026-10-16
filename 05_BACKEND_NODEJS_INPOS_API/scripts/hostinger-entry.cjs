/* Hostinger Node.js Web App mencari "Entry file" di dalam folder output (dist).
 * Buat pintu masuk cadangan agar entry app.js, main.js, maupun dist/main.js sama-sama menjalankan dist/main.js. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const dist = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(path.join(dist, 'main.js'))) { console.error('dist/main.js belum ada; jalankan nest build dulu.'); process.exit(1); }
fs.writeFileSync(path.join(dist, 'app.js'), "require('./main.js');\n");
fs.mkdirSync(path.join(dist, 'dist'), { recursive: true });
fs.writeFileSync(path.join(dist, 'dist', 'main.js'), "require('../main.js');\n");
console.log('Entry cadangan dibuat: dist/app.js dan dist/dist/main.js -> dist/main.js');
