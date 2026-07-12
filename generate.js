const fs = require('fs');
const path = require('path');

// Daftar pemetaan file yang sudah disesuaikan dengan nama asli Anda (sdy dan hk)
const pasaranList = [
    { id: 'macau', fileJS: 'data-macau.js', fileHTML: 'macau.html' },
    { id: 'cambodia', fileJS: 'data-cambodia.js', fileHTML: 'cambodia.html' },
    { id: 'sdy', fileJS: 'data-sdy.js', fileHTML: 'sdy.html' },        // <-- Sudah sdy
    { id: 'china', fileJS: 'data-china.js', fileHTML: 'china.html' },
    { id: 'japan', fileJS: 'data-japan.js', fileHTML: 'japan.html' },
    { id: 'sgp', fileJS: 'data-sgp.js', fileHTML: 'sgp.html' },        // <-- Sudah sgp
    { id: 'taiwan', fileJS: 'data-taiwan.js', fileHTML: 'taiwan.html' },
    { id: 'hk', fileJS: 'data-hk.js', fileHTML: 'hk.html' }          // <-- Sudah hk
];

pasaranList.forEach((pasaran) => {
    const jsPath = path.join(__dirname, 'data', pasaran.fileJS);
    const htmlPath = path.join(__dirname, pasaran.fileHTML);

    // Jika file JS atau HTML tidak ditemukan, lewati ke pasaran berikutnya secara aman
    if (!fs.existsSync(jsPath) || !fs.existsSync(htmlPath)) return;

    const kontenJS = fs.readFileSync(jsPath, 'utf8');
    let kontenHTML = fs.readFileSync(htmlPath, 'utf8');

    // 1. Ekstrak teks "update"
    const matchUpdate = kontenJS.match(/update\s*:\s*["']([^"']+)["']/);
    const updateTime = matchUpdate ? matchUpdate[1] : '';

    // 2. Ekstrak teks "result2d"
    const match2d = kontenJS.match(/result2d\s*:\s*["']([^"']+)["']/);
    const result2d = match2d ? match2d[1] : '';

    // 3. Ekstrak teks "bbfs"
    const matchBbfs = kontenJS.match(/bbfs\s*:\s*["']([^"']+)["']/);
    const bbfs = matchBbfs ? matchBbfs[1] : '';

    // 4. Ekstrak teks "cb"
    const matchCb = kontenJS.match(/cb\s*:\s*["']([^"']+)["']/);
    const cb = matchCb ? matchCb[1] : '';

    // 5. Ekstrak data "prediksi" multiline (antara tanda backtick `` ` ``)
    const matchPrediksi = kontenJS.match(/prediksi\s*:\s*`([\s\S]*?)`/);
    const prediksiRaw = matchPrediksi ? matchPrediksi[1].trim() : '';

    // ==========================================
    // PROSES GENERATE STRUKTUR BOLA HTML STATIS
    // ==========================================

    // A. Generate Baris Angka Prediksi
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
            // Angka sebelah kiri (Bola Merah)
            for (let c of kiri) {
                prediksiHTML += `                <span class="bola bola-merah">${c}</span>\n`;
            }
            // Pembatas Titik Dua
            prediksiHTML += '                <span class="pembatas-titik-dua">:</span>\n';
            // Angka sebelah kanan (Bola Putih)
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

    // ==========================================
    // PENYUNTIKKAN DATA KE FILE HTML ASLI ANDA
    // ==========================================
    
    // Ganti area lastUpdate
    kontenHTML = kontenHTML.replace(
        /<div id="lastUpdate">[\s\S]*?<\/div>/, 
        `<div id="lastUpdate">𝚃𝚎рак𝚑𝚒𝚛 𝙳𝚒𝚙𝚎𝚛𝚋α𝚛𝚞𝚒 𝙰𝙳𝙼𝙸𝙽 :<br>${updateTime}</div>`
    );

    // Ganti area prediksi utama
    kontenHTML = kontenHTML.replace(
        /<div id="area-prediksi">[\s\S]*?<\/div>/, 
        `<div id="area-prediksi">${prediksiHTML}            </div>`
    );

    // Ganti area teks kesimpulan 2D
    kontenHTML = kontenHTML.replace(
        /<span class="box-spesial kesimpulan-warna" id="area-kesimpulan">[\s\S]*?<\/span>/, 
        `<span class="box-spesial kesimpulan-warna" id="area-kesimpulan">${result2d}</span>`
    );

    // Ganti area bola BBFS
    kontenHTML = kontenHTML.replace(
        /<div id="area-bbfs">[\s\S]*?<\/div>/, 
        `<div id="area-bbfs">${bbfsHTML}</div>`
    );

    // Ganti area bola Colok Bebas / Tunggal
    kontenHTML = kontenHTML.replace(
        /<div id="area-cb">[\s\S]*?<\/div>/, 
        `<div id="area-cb">${cbHTML}</div>`
    );

    // Tulis balik semua perubahan ke file HTML asli Anda secara permanen
    fs.writeFileSync(htmlPath, kontenHTML, 'utf8');
    console.log(`🚀 Sukses Injeksi SEO Statis ke file: ${pasaran.fileHTML}`);
});
