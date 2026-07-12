const fs = require("fs");

const fileData = "data/data-cambodia.js";
const fileArsip = "data/arsip-cambodia.json";

const isi = fs.readFileSync(fileData, "utf8");

// Ambil object DATA_CAMBODIA
const data = eval(
    isi +
    "\nDATA_CAMBODIA;"
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

    console.log("Arsip berhasil diperbarui.");

} else {

    console.log("Tanggal sudah ada.");

}
