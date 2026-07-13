const fs = require('fs');
const path = require('path');

const pasaranList = [
    { id: 'macau', fileJS: 'data-macau.js', fileHTML: 'macau.html', nama: 'Macau', varName: 'DATA_MACAU' },
    { id: 'cambodia', fileJS: 'data-cambodia.js', fileHTML: 'cambodia.html', nama: 'Cambodia', varName: 'DATA_CAMBODIA' },
    { id: 'sdy', fileJS: 'data-sdy.js', fileHTML: 'sdy.html', nama: 'Sydney', varName: 'DATA_SYDNEY' },
    { id: 'china', fileJS: 'data-china.js', fileHTML: 'china.html', nama: 'China', varName: 'DATA_CHINA' },
    { id: 'japan', fileJS: 'data-japan.js', fileHTML: 'japan.html', nama: 'Japan', varName: 'DATA_JAPAN' },
    { id: 'sgp', fileJS: 'data-sgp.js', fileHTML: 'sgp.html', nama: 'Singapore', varName: 'DATA_SGP' },
    { id: 'taiwan', fileJS: 'data-taiwan.js', fileHTML: 'taiwan.html', nama: 'Taiwan', varName: 'DATA_TAIWAN' },
    { id: 'hk', fileJS: 'data-hk.js', fileHTML: 'hk.html', nama: 'Hongkong', varName: 'DATA_HK' }
];

pasaranList.forEach((pasaran) => {
    const jsPath = path.join(__dirname, 'data', pasaran.fileJS);
    const htmlPath = path.join(__dirname, pasaran.fileHTML);
    const fileArsipJSON = path.join(__dirname, 'data', `arsip-${pasaran.id}.json`);

    if (!fs.existsSync(jsPath) || !fs.existsSync(htmlPath)) return;

    let kontenJS = fs.readFileSync(jsPath, 'utf8');
    const kontenHTML = fs.readFileSync(htmlPath, 'utf8');

    // 1. EKSTRAKSI DATA JS KE JSON SECARA AKURAT
    let dataEkstraksi;
    try {
        // Buang baris komentar // agar tidak merusak format text
        kontenJS = kontenJS.replace(/\/\/.*$/gm, '');

        // Tangkap isi di dalam kurung kurawal pertama { ... }
        const matchObjek = kontenJS.match(/=\s*\{([\s\S]*)\}/);
        if (!matchObjek || !matchObjek[1]) return;
        
        // Ambil grup indeks ke-1 (string isi objeknya murni)
        let jsonString = `{${matchObjek[1]}}`
            .replace(/(\w+)\s*:/g, '"$1":') // Beri petik dua pada key
            .replace(/'/g, '"')              // Setel semua petik satu ke petik dua
            .replace(/,\s*([\]}])/g, '$1');  // Bersihkan koma menggantung di akhir

        dataEkstraksi = JSON.parse(jsonString);
    } catch (error) {
        console.error(`❌ Gagal membaca objek data pasaran ${pasaran.nama}:`, error.message);
        return;
    }

    const tanggalSeo = dataEkstraksi.tanggal_seo ? dataEkstraksi.tanggal_seo.trim() : '';
    if (!tanggalSeo) return;

    // 2. MASUKKAN DATA BARU KE GUDANG DATA JSON ARSIP
    let arsipJSON = [];
    if (fs.existsSync(fileArsipJSON)) {
        try { arsipJSON = JSON.parse(fs.readFileSync(fileArsipJSON, 'utf8')); } catch (e) { arsipJSON = []; }
    }
    
    if (!arsipJSON.some(x => x.tanggal_seo === tanggalSeo)) {
        arsipJSON.unshift({
            tanggal_seo: tanggalSeo,
            update: dataEkstraksi.update || ''
        });
        fs.writeFileSync(fileArsipJSON, JSON.stringify(arsipJSON, null, 2), 'utf8');
        console.log(`🗄️ Tanggal baru ${tanggalSeo} dicatat ke database JSON ${pasaran.nama}`);
    }

    // 3. CETAK HALAMAN ARSIP HARIAN BARU OTOMATIS BERDASARKAN TANGGAL
    const namaHalamanBaru = `${pasaran.id}-${tanggalSeo}.html`;
    const pathHalamanBaru = path.join(__dirname, namaHalamanBaru);

    if (!fs.existsSync(pathHalamanBaru)) {
        // Salin isi file utama menjadi file arsip bertanggal baru secara utuh
        fs.writeFileSync(pathHalamanBaru, kontenHTML, 'utf8');
        console.log(`✨ Sukses menciptakan halaman arsip otomatis: ${namaHalamanBaru}`);
    }
});
