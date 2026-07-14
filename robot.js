const fs = require('fs');
const path = require('path');

const sourceFile = 'data.js';
const archiveDir = 'archive';

if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir);
}

const timestamp = new Date()
  .toISOString()
  .replace(/[:.]/g, '-');

const archiveFile = path.join(
  archiveDir,
  `data-${timestamp}.js`
);

fs.copyFileSync(sourceFile, archiveFile);

console.log(`Arsip dibuat: ${archiveFile}`);
