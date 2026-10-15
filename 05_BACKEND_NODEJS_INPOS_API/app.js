/** cPanel CloudLinux / Phusion Passenger startup entrypoint.
 * Keep this file at the Node.js application's ROOT (not public_html).
 * Execute `npm run build` before clicking Restart.
 */
'use strict';
require('dotenv/config');
const fs = require('node:fs');
const path = require('node:path');
const entry = path.join(__dirname, 'dist', 'main.js');
if (!fs.existsSync(entry)) {
  console.error('INPOS API: dist/main.js belum tersedia. Jalankan npm install, npx prisma generate, npm run build.');
  process.exitCode = 1;
} else {
  require(entry);
}
