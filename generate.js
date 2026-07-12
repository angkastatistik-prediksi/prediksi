const fs = require('fs');
const path = require('path');

const pasaranList = [
    { id: 'macau', fileJS: 'data-macau.js', fileHTML: 'macau.html' },
    { id: 'cambodia', fileJS: 'data-cambodia.js', fileHTML: 'cambodia.html' },
    { id: 'sdy', fileJS: 'data-sydney.js', fileHTML: 'sdy.html' },
    { id: 'china', fileJS: 'data-china.js', fileHTML: 'china.html' },
    { id: 'japan', fileJS: 'data-japan.js', fileHTML: 'japan.html' },
    { id: 'sgp', fileJS: 'data-singapore.js', fileHTML: 'sgp.html' },
    { id: 'taiwan', fileJS: 'data-taiwan.js', fileHTML: 'taiwan.html' },
    { id: 'hk', fileJS: 'data-hongkong.js', fileHTML: 'hk.html' }
];

// PROSES 1: MEMBUAT HALAMAN BARU BERDASARKAN TANGGAL SEO
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

// PROSES 2: MENYUNTIKKAN TEKS ARSIP DI ATAS NAVIGASI TOMBOL PASARAN
const semuaFile = fs.readdirSync(__dirname);

pasaranList.forEach((pasaran) => {
    const htmlPath = path.join(__dirname, pasaran.fileHTML);
    if (!fs.existsSync(htmlPath)) return;

    let kontenHTML = fs.readFileSync(htmlPath, 'utf8');

    // Ambil daftar file arsip khusus pasaran ini
    const fileArsipPasaran = semuaFile.filter(f => 
        f.startsWith(`${pasaran.id}-`) && 
        f.endsWith('.html') && 
        f.match(/\d{4}-\d{2}-\d{2}/)
    ).sort().reverse();

    // Buat kotak desain arsip baru yang lebih mencolok
    let daftarArsipHTML = '\n        <!-- KOTAK ARSIP OTOMATIS START -->\n        <div style="margin-top:20px; color:#00f0ff; font-weight:bold; font-size:1.1rem; text-shadow: 0 0 5px #00f0ff;">CEK ARSIP PREDIKSI SEBELUMNYA</div>\n         <div style="max-height:150px; overflow-y:auto; padding:10px; background:rgba(12,12,40,0.9); border-radius:6px; margin:10px auto 20px; max-width:400px; border:1px dashed #00f0ff; text-align:center;">\n';
    
    if (fileArsipPasaran.length > 0) {
        fileArsipPasaran.forEach(file => {
            const bagian = file.replace('.html', '').split('-');
            const thn = bagian[1];
            const bln = bagian[2];
            const tgl = bagian[3];
            daftarArsipHTML += `            <a href="${file}" style="display:block; color:#ffff00; text-decoration:none; font-size:0.95rem; margin:10px 0; font-weight:bold; letter-spacing:1px;">📊 Prediksi Tanggal ${tgl}-${bln}-${thn}</a>\n`;
        });
    } else {
        daftarArsipHTML += '            <span style="color:#aaa; font-size:0.9rem;">Belum ada riwayat prediksi harian.</span>\n';
    }
    daftarArsipHTML += '        </div>\n        <!-- KOTAK ARSIP OTOMATIS END -->\n';

    // Hapus arsip lama jika robot dijalankan ulang agar tidak menumpuk ganda
    kontenHTML = kontenHTML.replace(/<!-- KOTAK ARSIP OTOMATIS START -->[\s\S]*?<!-- KOTAK ARSIP OTOMATIS END -->/g, '');

    // Kunci Sasaran: Kita cari baris judul menu tombol pasaran Anda yang pasti ada
    const targetNavigasi = '<div class="nav-quick-title">PILIH PREDIKSI LAINNYA</div>';
    
    if (kontenHTML.includes(targetNavigasi)) {
        // Taruh kotak arsip tepat di atas judul "PILIH PREDIKSI LAINNYA"
        kontenHTML = kontenHTML.replace(targetNavigasi, `${daftarArsipHTML}${targetNavigasi}`);
    }

    fs.writeFileSync(htmlPath, kontenHTML, 'utf8');
    console.log(`✅ Arsip sukses disisipkan di atas menu navigasi file: ${pasaran.fileHTML}`);
});
