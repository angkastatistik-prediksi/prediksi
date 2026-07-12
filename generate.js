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

// PROSES 1: MENCIPTAKAN HALAMAN ARSIP BARU BERDASARKAN TANGGAL
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
        fs.writeFileSync(path.join(__dirname, namaHalamanBaru), kontenHTML, 'utf8');
        console.log(`✨ Sukses menggandakan halaman baru: ${namaHalamanBaru}`);
    }
});

// PROSES 2: MENYUNTIKKAN LINK DAFTAR ARSIP DENGAN LOGIKA REPLACEMENT SUPER AMAN
const semuaFile = fs.readdirSync(__dirname);

pasaranList.forEach((pasaran) => {
    const htmlPath = path.join(__dirname, pasaran.fileHTML);
    if (!fs.existsSync(htmlPath)) return;

    let kontenHTML = fs.readFileSync(htmlPath, 'utf8');

    // Ambil daftar file arsip harian khusus pasaran ini yang ada di folder root GitHub Anda
    const fileArsipPasaran = semuaFile.filter(f => 
        f.startsWith(`${pasaran.id}-`) && 
        f.endsWith('.html') && 
        f.match(/\d{4}-\d{2}-\d{2}/)
    ).sort().reverse();

    // Buat struktur kotak visual arsip harian
    let daftarArsipHTML = '\n        <div id="tempat-arsip-otomatis">\n        <div class="nav-quick-title" style="margin-top:25px; color:#00f0ff; text-shadow:0 0 5px #00f0ff; font-size:1rem; font-weight:bold;">CEK ARSIP PREDIKSI SEBELUMNYA</div>\n         <div style="max-height:150px; overflow-y:auto; padding:10px; background:rgba(12,12,40,0.8); border-radius:6px; margin:10px auto; max-width:400px; border:1px dashed rgba(0, 240, 255, 0.4); text-align:center;">\n';
    
    if (fileArsipPasaran.length > 0) {
        fileArsipPasaran.forEach(file => {
            const bagian = file.replace('.html', '').split('-');
            const thn = bagian[1];
            const bln = bagian[2];
            const tgl = bagian[3];
            daftarArsipHTML += `            <a href="${file}" style="display:block; color:#ffff00; text-decoration:none; font-size:0.9rem; margin:8px 0; font-weight:bold;">⭕ Prediksi Tanggal ${tgl}-${bln}-${thn}</a>\n`;
        });
    } else {
        daftarArsipHTML += '            <span style="color:#888; font-size:0.85rem;">Belum ada riwayat prediksi harian.</span>\n';
    }
    daftarArsipHTML += '        </div>\n        </div>\n';

    // Bersihkan sisa-sisa suntikan arsip lama di dalam file agar kodenya tidak rusak atau menumpuk ganda
    kontenHTML = kontenHTML.replace(/<div id="tempat-arsip-otomatis">[\s\S]*?<\/div>\s*<\/div>/g, '<div id="tempat-arsip-otomatis"></div>');

    // Cara Suntik Paling Aman: Menggunakan regex global untuk mencari id tempat-arsip-otomatis secara fleksibel
    const regexWadahAman = /<div\s+id=["']tempat-arsip-otomatis["']>\s*<\/div>/i;
    
    if (regexWadahAman.test(kontenHTML)) {
        kontenHTML = kontenHTML.replace(regexWadahAman, daftarArsipHTML);
        fs.writeFileSync(htmlPath, kontenHTML, 'utf8');
        console.log(`✅ Sukses mendaftarkan tautan arsip dinamis pada file: ${pasaran.fileHTML}`);
    } else {
        console.log(`⚠️ Peringatan: Wadah tempat-arsip-otomatis tidak ditemukan di file ${pasaran.fileHTML}`);
    }
});
