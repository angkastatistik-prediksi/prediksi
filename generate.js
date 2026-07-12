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

// PROSES 1: BACA DATA JS DAN UPDATE ANGKA UTAMA SERTA BUAT FILE TANGGAL BARU
pasaranList.forEach((pasaran) => {
    const jsPath = path.join(__dirname, 'data', pasaran.fileJS);
    const htmlPath = path.join(__dirname, pasaran.fileHTML);

    if (!fs.existsSync(jsPath) || !fs.existsSync(htmlPath)) return;

    const kontenJS = fs.readFileSync(jsPath, 'utf8');
    let kontenHTML = fs.readFileSync(htmlPath, 'utf8');

    const matchUpdate = kontenJS.match(/update\s*:\s*["']([^"']+)["']/);
    const updateTime = matchUpdate ? matchUpdate[1] : '';

    const matchTglSeo = kontenJS.match(/tanggal_seo\s*:\s*["']([^"']+)["']/);
    const tanggalSeo = matchTglSeo ? matchTglSeo[1].trim() : '';

    const match2d = kontenJS.match(/result2d\s*:\s*["']([^"']+)["']/);
    const result2d = match2d ? match2d[1] : '';

    const matchBbfs = kontenJS.match(/bbfs\s*:\s*["']([^"']+)["']/);
    const bbfs = matchBbfs ? matchBbfs[1] : '';

    const matchCb = kontenJS.match(/cb\s*:\s*["']([^"']+)["']/);
    const cb = matchCb ? matchCb[1] : '';

    const matchPrediksi = kontenJS.match(/prediksi\s*:\s*`([\s\S]*?)`/);
    const prediksiRaw = matchPrediksi ? matchPrediksi[1].trim() : '';

    // Generate Baris Angka Prediksi
    let prediksiHTML = '\n';
    if (prediksiRaw) {
        prediksiRaw.split('\n').forEach(baris => {
            const bersih = baris.trim();
            if (!bersih || bersih.startsWith('//') || !bersih.includes(':')) return;
            const bagian = bersih.split(':');
            const kiri = bagian[0].trim();
            const kanan = bagian[1].trim();
            prediksiHTML += '            <div class="baris-angka">\n';
            for (let c of kiri) prediksiHTML += `                <span class="bola bola-merah">${c}</span>\n`;
            prediksiHTML += '                <span class="pembatas-titik-dua">:</span>\n';
            const dicoret = kanan.startsWith('-');
            const angkaKanan = dicoret ? kanan.substring(1) : kanan;
            for (let c of angkaKanan) prediksiHTML += `                <span class="bola bola-putih">${dicoret ? `<s>${c}</s>` : c}</span>\n`;
            prediksiHTML += '            </div>\n';
        });
    }

    let bbfsHTML = '\n';
    bbfs.replace(/[^0-9]/g, '').split('').forEach(angka => {
        bbfsHTML += `    <span class="bola bola-merah" style="width:45px;height:45px;font-size:1.4rem;margin:3px;">${angka}</span>\n`;
    });

    let cbHTML = `\n    <span class="bola bola-merah" style="width:45px;height:45px;font-size:1.4rem;">${cb}</span>\n`;

    kontenHTML = kontenHTML.replace(/<div id="lastUpdate">[\s\S]*?<\/div>/, `<div id="lastUpdate">𝚃𝚎𝚛𝚊𝚔𝚑𝚒𝚛 𝙳iprogram 𝙰𝙳𝙼𝙸𝙽 :<br>${updateTime}</div>`);
    kontenHTML = kontenHTML.replace(/<div id="area-prediksi">[\s\S]*?<\/div>/, `<div id="area-prediksi">${prediksiHTML}            </div>`);
    kontenHTML = kontenHTML.replace(/<span class="box-spesial kesimpulan-warna" id="area-kesimpulan">[\s\S]*?<\/span>/, `<span class="box-spesial kesimpulan-warna" id="area-kesimpulan">${result2d}</span>`);
    kontenHTML = kontenHTML.replace(/<div id="area-bbfs">[\s\S]*?<\/div>/, `<div id="area-bbfs">${bbfsHTML}</div>`);
    kontenHTML = kontenHTML.replace(/<div id="area-cb">[\s\S]*?<\/div>/, `<div id="area-cb">${cbHTML}</div>`);
    kontenHTML = kontenHTML.replace(/<title>[\s\S]*?<\/title>/, `<title>PREDIKSI ${pasaran.nama.toUpperCase()} JITU ${tanggalSeo} - ANGKA STATISTIK</title>`);

    // Simpan file utama pasaran (Misal: cambodia.html)
    fs.writeFileSync(htmlPath, kontenHTML, 'utf8');

    // Buat file arsip tanggal baru (Misal: cambodia-2026-07-12.html)
    if (tanggalSeo) {
        const namaFileArsip = `${pasaran.id}-${tanggalSeo}.html`;
        fs.writeFileSync(path.join(__dirname, namaFileArsip), kontenHTML, 'utf8');
    }
});

// PROSES 2: SCAN STRUKTUR DIREKTORI DAN AMBIL LINK ARSIP BERDASARKAN PASARANNYA MASING-MASING
const semuaFile = fs.readdirSync(__dirname);

pasaranList.forEach((pasaran) => {
    const htmlPath = path.join(__dirname, pasaran.fileHTML);
    if (!fs.existsSync(htmlPath)) return;

    let kontenHTML = fs.readFileSync(htmlPath, 'utf8');

    // Cari file HTML yang berformat nama 'idpasaran-tahun-bulan-tanggal.html'
    const fileArsipPasaran = semuaFile.filter(f => {
        return f.startsWith(`${pasaran.id}-`) && f.endsWith('.html') && f.match(/\d{4}-\d{2}-\d{2}/);
    }).sort().reverse(); // Tanggal terbaru berada di susunan paling atas

    let daftarArsipHTML = '\n        <div class="nav-quick-title" style="margin-top:25px; color:#00f0ff; text-shadow:0 0 5px #00f0ff;">CEK ARSIP PREDIKSI LAINNYA</div>\n        <div style="max-height:150px; overflow-y:auto; padding:5px; background:rgba(0,0,0,0.3); border-radius:6px; margin:10px auto; max-width:400px; border:1px dashed rgba(0, 240, 255, 0.2);">\n';

    if (fileArsipPasaran.length > 0) {
        fileArsipPasaran.forEach(file => {
            const bagian = file.replace('.html', '').split('-');
            const thn = bagian[1];
            const bln = bagian[2];
            const tgl = bagian[3];
            
            daftarArsipHTML += `            <a href="${file}" style="display:block; color:#ffff00; text-decoration:none; font-size:0.85rem; margin:6px 0; font-weight:bold;">📊 Prediksi ${pasaran.nama} Tanggal ${tgl}-${bln}-${thn}</a>\n`;
        });
    } else {
        daftarArsipHTML += '            <span style="color:#666; font-size:0.8rem;">Belum ada riwayat prediksi sebelumnya.</span>\n';
    }
    daftarArsipHTML += '        </div>\n';

    // Suntikkan data link arsip ke id="arsip-otomatis" di dalam file HTML utama pasaran
    kontenHTML = kontenHTML.replace(
        /<div id="arsip-otomatis">[\s\S]*?<\/div>/,
        `<div id="arsip-otomatis">${daftarArsipHTML}        </div>`
    );

    // Tulis ulang hasil suntikan arsip
    fs.writeFileSync(htmlPath, kontenHTML, 'utf8');
    console.log(`✅ Sukses menyuntikkan daftar arsip harian khusus ke file: ${pasaran.fileHTML}`);
});
