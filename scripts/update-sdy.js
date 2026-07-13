const fs = require("fs");

const fileData = "data/data-sdy.js";
const fileArsip = "data/arsip-sdy.json";

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

    console.log("Arsip Sydney berhasil diperbarui.");

} else {

    console.log("Tanggal Sydney sudah ada.");

}

