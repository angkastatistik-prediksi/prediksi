const fs = require('fs');
const path = require('path');

// Daftar pemetaan file sesuai repositori Anda saat ini
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
    let kontenHTML = fs.readFileSync(htmlPath, 'utf8');

    // Ekstrak data dari file JS Anda
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

    // A. Generate Baris Angka Prediksi Bola
    let prediksiHTML = '\n';
    if (prediksiRaw) {
        const barisBaris = prediksiRaw.split('\n');
        barisBaris.forEach(baris => {
            const bersih = baris.trim();
            if (!bersih || bersih.startsWith('//') || !bersih.includes(':')) return;

            const bagian = bersih.split(':');
            const kiri = bagian[0].trim();
            const kanan = bagian[1].trim();

            prediksiHTML += '            <div class="baris-angka">\n';
            for (let c of kiri) {
                prediksiHTML += `                <span class="bola bola-merah">${c}</span>\n`;
            }
            prediksiHTML += '                <span class="pembatas-titik-dua">:</span>\n';
            const dicoret = kanan.startsWith('-');
            const angkaKanan = dicoret ? kanan.substring(1) : kanan;
            for (let c of angkaKanan) {
                prediksiHTML += `                <span class="bola bola-putih">${dicoret ? `<s>${c}</s>` : c}</span>\n`;
            }
            prediksiHTML += '            </div>\n';
        });
    }

    // B. Generate Bola BBFS
    let bbfsHTML = '\n';
    const angkaBBFS = bbfs.replace(/[^0-9]/g, '').split('');
    angkaBBFS.forEach(angka => {
        bbfsHTML += `    <span class="bola bola-merah" style="width:45px;height:45px;font-size:1.4rem;margin:3px;">${angka}</span>\n`;
    });

    // C. Generate Bola Colok Bebas
    let cbHTML = `\n    <span class="bola bola-merah" style="width:45px;height:45px;font-size:1.4rem;">${cb}</span>\n`;

    // Penyuntikkan data murni ke struktur HTML
    kontenHTML = kontenHTML.replace(/<div id="lastUpdate">[\s\S]*?<\/div>/, `<div id="lastUpdate">𝚃𝚎𝚛𝚊𝚔𝚑𝚒𝚛 𝙳iprogram 𝙰𝙳𝙼𝙸𝙽 :<br>${updateTime}</div>`);
    kontenHTML = kontenHTML.replace(/<div id="area-prediksi">[\s\S]*?<\/div>/, `<div id="area-prediksi">${prediksiHTML}            </div>`);
    kontenHTML = kontenHTML.replace(/<span class="box-spesial kesimpulan-warna" id="area-kesimpulan">[\s\S]*?<\/span>/, `<span class="box-spesial kesimpulan-warna" id="area-kesimpulan">${result2d}</span>`);
    kontenHTML = kontenHTML.replace(/<div id="area-bbfs">[\s\S]*?<\/div>/, `<div id="area-bbfs">${bbfsHTML}</div>`);
    kontenHTML = kontenHTML.replace(/<div id="area-cb">[\s\S]*?<\/div>/, `<div id="area-cb">${cbHTML}</div>`);

    // Tambahan SEO Dinamis: Mengubah Title tag agar relevan dengan tanggal arsip harian
    kontenHTML = kontenHTML.replace(/<title>[\s\S]*?<\/title>/, `<title>PREDIKSI ${pasaran.id.toUpperCase()} JITU ${tanggalSeo} - ANGKA STATISTIK</title>`);

    // LAKUKAN PROSES SIMPAN / UPDATE FILE HTML
    
    // 1. Perbarui halaman utama pasaran (Misal: cambodia.html)
    fs.writeFileSync(htmlPath, kontenHTML, 'utf8');
    console.log(`🚀 Sukses Perbarui Halaman Utama: ${pasaran.fileHTML}`);

    // 2. Buat Halaman Baru Berdasarkan Tanggal (Misal: cambodia-2026-07-12.html)
    if (tanggalSeo) {
        const namaHalamanBaru = `${pasaran.id}-${tanggalSeo}.html`;
        fs.writeFileSync(path.join(__dirname, namaHalamanBaru), kontenHTML, 'utf8');
        console.log(`✨ Halaman baru berhasil diciptakan: ${namaHalamanBaru}`);
    }
});
