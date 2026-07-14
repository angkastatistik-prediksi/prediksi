const fs = require('fs');
const path = require('path');

const files = [
  'data/data-cambodia.js',
  'data/data-sdy.js',
  'data/data-china.js',
  'data/data-japan.js',
  'data/data-sgp.js',
  'data/data-taiwan.js',
  'data/data-hk.js'
];

for (const file of files) {

  if (!fs.existsSync(file)) continue;

  const pasar = path
    .basename(file)
    .replace('data-', '')
    .replace('.js', '');

  const archiveDir = `archive/${pasar}`;

  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const archiveFile =
    `${archiveDir}/data-${pasar}-${today}.js`;

  if (!fs.existsSync(archiveFile)) {
    fs.copyFileSync(file, archiveFile);

    console.log(
      `Arsip dibuat: ${archiveFile}`
    );
  }
}
