const fs = require('fs');
const path = require('path');

const pasaranList = [
    { id: 'macau', fileJS: 'data-macau.js', fileHTML: 'macau.html' },
    { id: 'cambodia', fileJS: 'data-cambodia.js', fileHTML: 'cambodia.html' },
    { id: 'sdy', fileJS: 'data-sdy.js', fileHTML: 'sdy.html' },
    { id: 'china', fileJS: 'data-china.js', fileHTML: 'china.html' },
    { id: 'japan', fileJS: 'data-japan.js', fileHTML: 'japan.html' },
    { id: 'sgp', fileJS: 'data-sgp.js', fileHTML: 'sgp.html' },
    { id: 'taiwan', fileJS: 'data-taiwan.js', fileHTML: 'taiwan.html' },
    { id: 'hk', fileJS: 'data-hk.js', fileHTML: 'hk.html' }
];

pasaranList.forEach((pasaran) => {
    const jsPath = path.join(__dirname, 'data', pasaran.fileJS);
    const htmlPath = path.join(__dirname, pasaran.fileHTML);

    if (!fs.existsSync(jsPath) || !fs.existsSync(htmlPath)) return;

    const kontenJS = fs.readFileSync(jsPath, 'utf8');
    const kontenHTML = fs.readFileSync(htmlPath, 'utf8');

    // Mengambil tanggal_seo dari file .js Anda
    const matchTglSeo = kontenJS.match(/tanggal_seo\s*:\s*["']([^"']+)["']/);
    const tanggalSeo = matchTglSeo ? matchTglSeo[1].trim() : '';

    if (tanggalSeo) {
        // Robot menduplikasi file HTML asli Anda secara utuh menjadi nama file tanggal baru
        const namaHalamanBaru = `${pasaran.id}-${tanggalSeo}.html`;
        fs.writeFileSync(path.join(__dirname, namaHalamanBaru), kontenHTML, 'utf8');
        console.log(`✨ Sukses menduplikasi halaman baru: ${namaHalamanBaru}`);
    }
});
