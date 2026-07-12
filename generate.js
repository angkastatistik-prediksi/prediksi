const fs = require('fs');
const path = require('path');

const pasaranList = [
    { id: 'macau', fileJS: 'data-macau.js', fileHTML: 'macau.html', nama: 'Macau' },
    { id: 'cambodia', fileJS: 'data-cambodia.js', fileHTML: 'cambodia.html', nama: 'Cambodia' },
    { id: 'sdy', fileJS: 'data-sdy.js', fileHTML: 'sdy.html', nama: 'Sydney' },
    { id: 'china', fileJS: 'data-china.js', fileHTML: 'china.html', nama: 'China' },
    { id: 'japan', fileJS: 'data-japan.js', fileHTML: 'japan.html', nama: 'Japan' },
    { id: 'sgp', fileJS: 'data-sgp.js', fileHTML: 'sgp.html', nama: 'Singapore' },
    { id: 'taiwan', fileJS: 'data-taiwan.js', fileHTML: 'taiwan.html', nama: 'Taiwan' },
    { id: 'hk', fileJS: 'data-hk.js', fileHTML: 'hk.html', nama: 'Hongkong' }
];

// PROSES 1: MEMBUAT FILE ARSIP HALAMAN BARU BERDASARKAN TANGGAL SEO
pasaranList.forEach((pasaran) => {
    const jsPath = path.join(__dirname, 'data', pasaran.fileJS);
    const htmlPath = path.join(__dirname, pasaran.fileHTML);

    if (!fs.existsSync(jsPath) || !fs.existsSync(htmlPath)) return;

    const kontenJS = fs.readFileSync(jsPath, 'utf8');
    const kontenHTML = fs.readFileSync(htmlPath, 'utf8');

    const matchTglSeo = kontenJS.match(/tanggal_seo\s*:\s*["']([^"']+)["']/);
    const tanggalSeo = matchTglSeo ? matchTglSeo[1].trim() : '';

    if (tanggalSeo) {
        const namaHalamanBaru = `${pasaran.id}-${tanggalSeo}.html`;
        // Gandakan file HTML asli Anda secara utuh (iklan & disqus aman) menjadi file tanggal baru
        fs.writeFileSync(path.join(__dirname, namaHalamanBaru), kontenHTML, 'utf8');
        console.log(`✨ Sukses menggandakan halaman baru: ${namaHalamanBaru}`);
    }
});

// PROSES 2: SCAN DIREKTORI DAN SUNTIK DAFTAR LINK SECARA OTOMATIS BERDASARKAN HASIL SCAN FILE
const semuaFile = fs.readdirSync(__dirname);

pasaranList.forEach((pasaran) => {
    const htmlPath = path.join(__dirname, pasaran.fileHTML);
    if (!fs.existsSync(htmlPath)) return;

    let kontenHTML = fs.readFileSync(htmlPath, 'utf8');

    // Filter mencari semua file arsip harian khusus pasaran ini yang ada di folder GitHub Anda saat ini
    const fileArsipPasaran = semuaFile.filter(f => 
        f.startsWith(`${pasaran.id}-`) && 
        f.endsWith('.html') && 
        f.match(/\d{4}-\d{2}-\d{2}/)
    ).sort().reverse(); // reverse membuat tanggal terbaru otomatis naik ke posisi paling atas

    // Buat struktur HTML Kotak Arsip Dinamis
    let daftarArsipHTML = '\n        <div id="tempat-arsip-otomatis">\n        <div class="nav-quick-title" style="margin-top:25px; color:#00f0ff; text-shadow:0 0 5px #00f0ff; font-size:1rem; font-weight:bold;">CEK ARSIP PREDIKSI SEBELUMNYA</div>\n         <div style="max-height:150px; overflow-y:auto; padding:10px; background:rgba(12,12,40,0.8); border-radius:6px; margin:10px auto; max-width:400px; border:1px dashed rgba(0, 240, 255, 0.4); text-align:center;">\n';
    
    if (fileArsipPasaran.length > 0) {
        fileArsipPasaran.forEach(file => {
            const bagian = file.replace('.html', '').split('-');
            const thn = bagian[1];
            const bln = bagian[2];
            const tgl = bagian[3];
            daftarArsipHTML += `            <a href="${file}" style="display:block; color:#ffff00; text-decoration:none; font-size:0.9rem; margin:8px 0; font-weight:bold;">📊 Prediksi Tanggal ${tgl}-${bln}-${thn}</a>\n`;
        });
    } else {
        daftarArsipHTML += '            <span style="color:#888; font-size:0.85rem;">Belum ada riwayat prediksi harian.</span>\n';
    }
    daftarArsipHTML += '        </div>\n        </div>\n';

    // Suntikkan hasil scan file tadi ke wadah tempat-arsip-otomatis di file utama
    if (kontenHTML.includes('<div id="tempat-arsip-otomatis"></div>')) {
        kontenHTML = kontenHTML.replace('<div id="tempat-arsip-otomatis"></div>', daftarArsipHTML);
        fs.writeFileSync(htmlPath, kontenHTML, 'utf8');
        console.log(`✅ Daftar link arsip dinamis sukses dimasukkan ke: ${pasaran.fileHTML}`);
    }
});
