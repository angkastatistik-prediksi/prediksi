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

    // Ekstraksi Objek Data secara Aman
    let dataEkstraksi;
    try {
        kontenJS = kontenJS.replace(/\/\/.*$/gm, '');
        const matchObjek = kontenJS.match(/=\s*\{([\s\S]*)\}/);
        if (!matchObjek) return;
        let jsonString = `{${matchObjek[1]}}`.replace(/(\w+)\s*:/g, '"$1":').replace(/'/g, '"').replace(/,\s*([\]}])/g, '$1');
        dataEkstraksi = JSON.parse(jsonString);
    } catch (error) { return; }

    const tanggalSeo = dataEkstraksi.tanggal_seo ? dataEkstraksi.tanggal_seo.trim() : '';
    if (!tanggalSeo) return;

    // Masukkan data hari ini ke arsip JSON database
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
    }

    // Ciptakan file arsip harian baru jika belum ada
    const namaHalamanBaru = `${pasaran.id}-${tanggalSeo}.html`;
    const pathHalamanBaru = path.join(__dirname, namaHalamanBaru);

    if (!fs.existsSync(pathHalamanBaru)) {
        fs.writeFileSync(pathHalamanBaru, kontenHTML, 'utf8');
        console.log(`✨ File baru sukses dicetak: ${namaHalamanBaru}`);
    }
});
