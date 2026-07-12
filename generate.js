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

// PROSES 2: MENYUNTIKKAN TEKS ARSIP TEPAT DI BAWAH KALIMAT "sᴇᴍᴏɢᴀ ʙᴇʀᴜɴᴛᴜɴɢ"
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

    // Buat kotak desain arsip
    let daftarArsipHTML = '\n        <div class="nav-quick-title" style="margin-top:25px; color:#00f0ff; text-shadow:0 0 5px #00f0ff; font-size:1rem; font-weight:bold;">CEK ARSIP PREDIKSI LAINNYA</div>\n         <div style="max-height:150px; overflow-y:auto; padding:10px; background:rgba(12,12,40,0.8); border-radius:6px; margin:10px auto; max-width:400px; border:1px dashed rgba(0, 240, 255, 0.4); text-align:center;">\n';
    
    if (fileArsipPasaran.length > 0) {
        fileArsipPasaran.forEach(file => {
            const bagian = file.replace('.html', '').split('-');
            const thn = bagian[1];
            const bln = bagian[2];
            const tgl = bagian[3];
            daftarArsipHTML += `            <a href="${file}" style="display:block; color:#ffff00; text-decoration:none; font-size:0.9rem; margin:8px 0; font-weight:bold; letter-spacing:1px;">📊 Prediksi Tanggal ${tgl}-${bln}-${thn}</a>\n`;
        });
    } else {
        daftarArsipHTML += '            <span style="color:#888; font-size:0.85rem;">Belum ada riwayat prediksi harian.</span>\n';
    }
    daftarArsipHTML += '        </div>\n';

    // Bersihkan arsip lama jika robot dijalankan berulang kali
    kontenHTML = kontenHTML.replace(/<div class="nav-quick-title"[\s\S]*?<\/div>\s*<\/div>/, '');

    // Taktik Jitu: Cari kalimat "sᴇᴍᴏɢᴀ ʙᴇʀᴜɴᴛᴜɴɢ </div>" lalu selipkan kotak arsip tepat di bawahnya [1, 2]
    const penandaLama = '<div class="salam-penutup"> sᴇᴍᴏɢᴀ ʙᴇʀᴜɴᴛᴜɴɢ </div>';
    const penandaBaru = '<div class="salam-penutup">sᴇᴍᴏɢᴀ ʙᴇʀᴜɴᴛᴜɴɢ</div>';
    
    if (kontenHTML.includes(penandaLama)) {
        kontenHTML = kontenHTML.replace(penandaLama, `${penandaLama}${daftarArsipHTML}`);
    } else if (kontenHTML.includes(penandaBaru)) {
        kontenHTML = kontenHTML.replace(penandaBaru, `${penandaBaru}${daftarArsipHTML}`);
    }

    fs.writeFileSync(htmlPath, kontenHTML, 'utf8');
    console.log(`✅ Arsip disuntik langsung di bawah salam penutup file: ${pasaran.fileHTML}`);
});
