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

    // METODE BARU: Ekstrak data menggunakan Regex aman (Kebal terhadap komentar //)
    let tanggal_seo = "";
    let update = "";
    let prediksi = "";
    let result2d = "";
    let bbfs = "";
    let cb = "";

    try {
        // 1. Ambil Tanggal SEO
        const matchTgl = isi.match(/tanggal_seo\s*:\s*["']([^"']+)["']/);
        if (matchTgl) tanggal_seo = matchTgl[1].trim();

        // 2. Ambil Waktu Update
        const matchUpdate = isi.match(/update\s*:\s*["']([^"']+)["']/);
        if (matchUpdate) update = matchUpdate[1].trim();

        // 3. Ambil Prediksi (Teks di dalam Backtick ``)
        const matchPrediksi = isi.match(/prediksi\s*:\s*`([\s\S]*?)`/);
        if (matchPrediksi) prediksi = matchPrediksi[1].trim();

        // 4. Ambil Result 2D
        const match2d = isi.match(/result2d\s*:\s*["']([^"']+)["']/);
        if (match2d) result2d = match2d[1].trim();

        // 5. Ambil BBFS
        const matchBbfs = isi.match(/bbfs\s*:\s*["']([^"']+)["']/);
        if (matchBbfs) bbfs = matchBbfs[1].trim();

        // 6. Ambil Colok Bebas
        const matchCb = isi.match(/cb\s*:\s*["']([^"']+)["']/);
        if (matchCb) cb = matchCb[1].trim();

    } catch (e) {
        console.log(`❌ Gagal membaca pola teks pada file ${pasaran.fileJS}`);
        return;
    }

    // Validasi mutlak: Jika tanggal_seo gagal ditangkap, lewati agar tidak error
    if (!tanggal_seo) {
        console.log(`⚠️ Tanggal SEO tidak ditemukan pada file ${pasaran.fileJS}. Lewati.`);
        return;
    }

    // Ambil arsip lama database JSON
    let arsip = [];
    if (fs.existsSync(fileArsip)) {
        try {
            arsip = JSON.parse(fs.readFileSync(fileArsip, "utf8"));
        } catch (e) {
            arsip = [];
        }
    }

    // Cek apakah tanggal sudah terdaftar
    const sudahAda = arsip.some(x => x.tanggal_seo === tanggal_seo);

    if (!sudahAda) {
        // 1. UPDATE DATABASE JSON PASARAN TERKAIT
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

        // 2. OTOMATIS MENCIPTAKAN HALAMAN ARSIP HTML HARIAN BARU DI ROOT
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
