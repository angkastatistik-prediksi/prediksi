const fs = require("fs");
const path = require("path");

const pasaranList = [
    { id: 'cambodia', fileJS: 'data-cambodia.js', fileHTML: 'cambodia.html' },
    { id: 'sdy', fileJS: 'data-sdy.js', fileHTML: 'sdy.html' },
    { id: 'china', fileJS: 'data-china.js', fileHTML: 'china.html' },
    { id: 'japan', fileJS: 'data-japan.js', fileHTML: 'japan.html' },
    { id: 'sgp', fileJS: 'data-sgp.js', fileHTML: 'sgp.html' },
    { id: 'taiwan', fileJS: 'data-taiwan.js', fileHTML: 'taiwan.html' },
    { id: 'hk', fileJS: 'data-hk.js', fileHTML: 'hk.html' }
];

pasaranList.forEach((pasaran) => {
    const fileData = path.join(__dirname, `../data/${pasaran.fileJS}`);
    const fileArsip = path.join(__dirname, `../data/arsip-${pasaran.id}.json`);
    const fileHTMLUtama = path.join(__dirname, `../${pasaran.fileHTML}`);

    if (!fs.existsSync(fileData) || !fs.existsSync(fileHTMLUtama)) return;

    let isi = fs.readFileSync(fileData, "utf8");

    let tanggal_seo = "";
    let update = "";
    let prediksi = "";
    let result2d = "";
    let bbfs = "";
    let cb = "";

    try {
        // PERBAIKAN UTAMA: Mengunci indeks grup [1] sebelum memanggil fungsi .trim()
        const matchTgl = isi.match(/tanggal_seo\s*:\s*["']([^"']+)["']/);
        if (matchTgl && matchTgl[1]) tanggal_seo = matchTgl[1].trim();

        const matchUpdate = isi.match(/update\s*:\s*["']([^"']+)["']/);
        if (matchUpdate && matchUpdate[1]) update = matchUpdate[1].trim();

        const matchPrediksi = isi.match(/prediksi\s*:\s*`([\s\S]*?)`/);
        if (matchPrediksi && matchPrediksi[1]) prediksi = matchPrediksi[1].trim();

        const match2d = isi.match(/result2d\s*:\s*["']([^"']+)["']/);
        if (match2d && match2d[1]) result2d = match2d[1].trim();

        const matchBbfs = isi.match(/bbfs\s*:\s*["']([^"']+)["']/);
        if (matchBbfs && matchBbfs[1]) bbfs = matchBbfs[1].trim();

        const matchCb = isi.match(/cb\s*:\s*["']([^"']+)["']/);
        if (matchCb && matchCb[1]) cb = matchCb[1].trim();

    } catch (e) {
        console.log(`❌ Gagal membaca pola teks pada file ${pasaran.fileJS}`);
        return;
    }

    if (!tanggal_seo) {
        console.log(`⚠️ Tanggal SEO tidak ditemukan pada file ${pasaran.fileJS}. Lewati.`);
        return;
    }

    let arsip = [];
    if (fs.existsSync(fileArsip)) {
        try {
            arsip = JSON.parse(fs.readFileSync(fileArsip, "utf8"));
        } catch (e) {
            arsip = [];
        }
    }

    const sudahAda = arsip.some(x => x.tanggal_seo === tanggal_seo);

    if (!sudahAda) {
        arsip.unshift({
            tanggal_seo: tanggal_seo,
            update: update,
            prediksi: prediksi,
            result2d: result2d,
            bbfs: bbfs,
            cb: cb
        });

        fs.writeFileSync(fileArsip, JSON.stringify(arsip, null, 2), "utf8");
        console.log(`✅ Database JSON ${pasaran.id.toUpperCase()} sukses diperbarui.`);

        const kontenHTMLUtama = fs.readFileSync(fileHTMLUtama, "utf8");
        const namaHalamanBaru = `${pasaran.id}-${tanggal_seo}.html`;
        const pathHalamanBaru = path.join(__dirname, "../", namaHalamanBaru);

        if (!fs.existsSync(pathHalamanBaru)) {
            fs.writeFileSync(pathHalamanBaru, kontenHTMLUtama, "utf8");
            console.log(`✨ Sukses melahirkan halaman baru otomatis: ${namaHalamanBaru}`);
        }
    } else {
        console.log(`ℹ️ Tanggal ${tanggal_seo} untuk pasaran ${pasaran.id} sudah terekam sebelumnya.`);
    }
});
