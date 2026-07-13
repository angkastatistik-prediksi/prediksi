const fs = require("fs");
const path = require("path");

// Daftar 7 pasaran Anda sesuai nama file dan variabelnya
const pasaranList = [
    { id: 'cambodia', fileJS: 'data-cambodia.js', fileHTML: 'cambodia.html', varName: 'DATA_CAMBODIA' },
    { id: 'sdy', fileJS: 'data-sdy.js', fileHTML: 'sdy.html', varName: 'DATA_SYDNEY' },
    { id: 'china', fileJS: 'data-china.js', fileHTML: 'china.html', varName: 'DATA_CHINA' },
    { id: 'japan', fileJS: 'data-japan.js', fileHTML: 'japan.html', varName: 'DATA_JAPAN' },
    { id: 'sgp', fileJS: 'data-sgp.js', fileHTML: 'sgp.html', varName: 'DATA_SGP' },
    { id: 'taiwan', fileJS: 'data-taiwan.js', fileHTML: 'taiwan.html', varName: 'DATA_TAIWAN' },
    { id: 'hk', fileJS: 'data-hk.js', fileHTML: 'hk.html', varName: 'DATA_HK' }
];

pasaranList.forEach((pasaran) => {
    const fileData = path.join(__dirname, `../data/${pasaran.fileJS}`);
    const fileArsip = path.join(__dirname, `../data/arsip-${pasaran.id}.json`);
    const fileHTMLUtama = path.join(__dirname, `../${pasaran.fileHTML}`);

    // Jika file data .js atau .html utama belum ada di repositori, lewati ke pasaran berikutnya
    if (!fs.existsSync(fileData) || !fs.existsSync(fileHTMLUtama)) return;

    const isi = fs.readFileSync(fileData, "utf8");

    // Ambil object data pasaran secara aman menggunakan eval bawaan Anda
    let data;
    try {
        data = eval(isi + `\n${pasaran.varName};`);
    } catch (e) {
        console.log(`❌ Error membaca variabel pada file ${pasaran.fileJS}`);
        return;
    }

    if (!data || !data.tanggal_seo) return;

    // Ambil arsip lama database JSON
    let arsip = [];
    if (fs.existsSync(fileArsip)) {
        try {
            arsip = JSON.parse(fs.readFileSync(fileArsip, "utf8"));
        } catch (e) {
            arsip = [];
        }
    }

    // Cek apakah tanggal sudah terdaftar di database JSON
    const sudahAda = arsip.some(x => x.tanggal_seo === data.tanggal_seo);

    if (!sudahAda) {
        // 1. UPDATE DATABASE JSON PASARAN TERKAIT
        arsip.unshift({
            tanggal_seo: data.tanggal_seo,
            update: data.update,
            prediksi: data.data.prediksi,
            result2d: data.data.result2d,
            bbfs: data.data.bbfs,
            cb: data.data.cb
        });

        fs.writeFileSync(fileArsip, JSON.stringify(arsip, null, 2), "utf8");
        console.log(`✅ Database JSON ${pasaran.id.toUpperCase()} berhasil diperbarui.`);

        // 2. OTOMATIS MENCIPTAKAN HALAMAN ARSIP HTML HARIAN BARU DI ROOT
        const kontenHTMLUtama = fs.readFileSync(fileHTMLUtama, "utf8");
        const namaHalamanBaru = `${pasaran.id}-${data.tanggal_seo}.html`;
        const pathHalamanBaru = path.join(__dirname, "../", namaHalamanBaru);

        if (!fs.existsSync(pathHalamanBaru)) {
            fs.writeFileSync(pathHalamanBaru, kontenHTMLUtama, "utf8");
            console.log(`✨ Sukses membuat halaman baru otomatis: ${namaHalamanBaru}`);
        }
    }
});

