const fs = require("fs");
const path = require("path");

// Jalur folder (Path) disesuaikan karena script berada di dalam folder scripts/
const fileData = path.join(__dirname, "../data/data-sdy.js");
const fileArsip = path.join(__dirname, "../data/arsip-sdy.json");
const fileHTMLUtama = path.join(__dirname, "../sdy.html"); // File induk utama

const isi = fs.readFileSync(fileData, "utf8");

// Ambil object DATA_SYDNEY
const data = eval(
    isi +
    "\nDATA_SYDNEY;"
);

// Arsip lama
let arsip = [];

if (fs.existsSync(fileArsip)) {
    arsip = JSON.parse(fs.readFileSync(fileArsip, "utf8"));
}

// Cek apakah tanggal sudah ada
const sudahAda = arsip.some(
    x => x.tanggal_seo === data.tanggal_seo
);

if (!sudahAda) {

    // 1. PROSES UPDATE DATABASE JSON
    arsip.unshift({
        tanggal_seo: data.tanggal_seo,
        update: data.update,
        prediksi: data.data.prediksi,
        result2d: data.data.result2d,
        bbfs: data.data.bbfs,
        cb: data.data.cb
    });

    fs.writeFileSync(
        fileArsip,
        JSON.stringify(arsip, null, 2)
    );
    console.log("✅ Arsip data JSON Sydney berhasil diperbarui.");

    // ============================================================================
    // 2. KODE TAMBAHAN: OTOMATIS MENCIPTAKAN HALAMAN ARSIP HTML BARU DI ROOT
    // ============================================================================
    if (fs.existsSync(fileHTMLUtama)) {
        const kontenHTMLUtama = fs.readFileSync(fileHTMLUtama, "utf8");
        
        // Menentukan nama dan lokasi file baru di root (Contoh: sdy-2026-07-13.html)
        const namaHalamanBaru = `sdy-${data.tanggal_seo}.html`;
        const pathHalamanBaru = path.join(__dirname, "../", namaHalamanBaru);

        // Cetak file harian baru jika file tersebut belum ada di root
        if (!fs.existsSync(pathHalamanBaru)) {
            fs.writeFileSync(pathHalamanBaru, kontenHTMLUtama, "utf8");
            console.log(`✨ Sukses menciptakan halaman baru otomatis: ${namaHalamanBaru}`);
        } else {
            console.log(`ℹ️ File halaman ${namaHalamanBaru} sudah ada di root.`);
        }
    } else {
        console.log("⚠️ Peringatan: File sdy.html utama tidak ditemukan di root folder.");
    }

} else {
    console.log("Tanggal Sydney sudah ada. Lewati pembuatan halaman baru.");
}
