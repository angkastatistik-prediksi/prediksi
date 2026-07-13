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

const semuaFile = fs.readdirSync(__dirname);

pasaranList.forEach((pasaran) => {
    const jsPath = path.join(__dirname, 'data', pasaran.fileJS);
    const htmlPath = path.join(__dirname, pasaran.fileHTML);
    const fileArsipJSON = path.join(__dirname, 'data', `arsip-${pasaran.id}.json`);

    if (!fs.existsSync(jsPath) || !fs.existsSync(htmlPath)) return;

    let kontenJS = fs.readFileSync(jsPath, 'utf8');
    let kontenHTML = fs.readFileSync(htmlPath, 'utf8');

    // 1. BERSIHKAN KOMENTAR DAN PARSE STRUKTUR DATA JS SECARA AMAN
    let dataEkstraksi;
    try {
        // Hapus baris yang diawali dengan komentar // agar tidak merusak JSON string
        kontenJS = kontenJS.replace(/\/\/.*$/gm, '');

        // Regex diperbarui agar toleran terhadap spasi setelah tanda sama dengan (= {)
        const matchObjek = kontenJS.match(/=\s*\{([\s\S]*)\}/);
        if (!matchObjek) throw new Error("Struktur objek data tidak ditemukan");
        
        let jsonString = `{${matchObjek[1]}}`
            .replace(/(\w+)\s*:/g, '"$1":') // Beri petik pada key objek
            .replace(/'/g, '"')              // Ubah petik satu ke dua
            .replace(/,\s*([\]}])/g, '$1');  // Hapus koma menggantung di akhir objek

        dataEkstraksi = JSON.parse(jsonString);
    } catch (error) {
        console.error(`❌ Gagal membaca atau parse file JS ${pasaran.nama}:`, error.message);
        return;
    }

    const tanggalSeo = dataEkstraksi.tanggal_seo ? dataEkstraksi.tanggal_seo.trim() : '';
    if (!tanggalSeo) return;

    const splitTgl = tanggalSeo.split('-');
    const tglFormatIndo = splitTgl.length === 3 ? `${splitTgl[2]}-${splitTgl[1]}-${splitTgl[0]}` : tanggalSeo;

    // 2. SIMPAN / UPDATE DATABASE DATABASE ARSIP JSON
    let arsipJSON = [];
    if (fs.existsSync(fileArsipJSON)) {
        try { arsipJSON = JSON.parse(fs.readFileSync(fileArsipJSON, 'utf8')); } catch (e) { arsipJSON = []; }
    }
    if (!arsipJSON.some(x => x.tanggal_seo === tanggalSeo)) {
        arsipJSON.unshift({
            tanggal_seo: tanggalSeo,
            update: dataEkstraksi.update || '',
            prediksi: dataEkstraksi.data?.prediksi || '',
            result2d: dataEkstraksi.data?.result2d || '',
            bbfs: dataEkstraksi.data?.bbfs || '',
            cb: dataEkstraksi.data?.cb || ''
        });
        fs.writeFileSync(fileArsipJSON, JSON.stringify(arsipJSON, null, 2), 'utf8');
    }

    // 3. DAFTARKAN FILE REALTIME + PRE-REGISTER FILE BARU AGAR LINKNYA MUNCUL
    const semuaFileSekarang = fs.readdirSync(__dirname);
    let fileArsipPasaran = semuaFileSekarang.filter(f => 
        f.startsWith(`${pasaran.id}-`) && f.endsWith('.html') && f.match(/\d{4}-\d{2}-\d{2}/)
    );

    const namaHalamanBaru = `${pasaran.id}-${tanggalSeo}.html`;
    if (!fileArsipPasaran.includes(namaHalamanBaru)) {
        fileArsipPasaran.push(namaHalamanBaru); // Paksa masuk ke daftar sebelum file fisiknya dicetak
    }

    // Urutkan arsip tanggal terbaru di paling atas
    fileArsipPasaran.sort().reverse();

    // Bangun struktur kotak navigasi arsip visual harian
    let daftarArsipHTML = '\n        <div class="nav-quick-title" style="margin-top:25px; color:#00f0ff; text-shadow:0 0 5px #00f0ff; font-size:1rem; font-weight:bold;">CEK ARSIP PREDIKSI SEBELUMNYA</div>\n         <div style="max-height:150px; overflow-y:auto; padding:10px; background:rgba(12,12,40,0.8); border-radius:6px; margin:10px auto; max-width:400px; border:1px dashed rgba(0, 240, 255, 0.4); text-align:center;">\n';
    
    fileArsipPasaran.forEach(file => {
        const bagian = file.replace('.html', '').split('-');
        if(bagian.length >= 4) {
            daftarArsipHTML += `            <a href="${file}" style="display:block; color:#ffff00; text-decoration:none; font-size:0.9rem; margin:8px 0; font-weight:bold;">⭕ Prediksi Tanggal ${bagian[3]}-${bagian[2]}-${bagian[1]}</a>\n`;
        }
    });
    daftarArsipHTML += '        </div>\n';

    // 4. SUNTIK KOTAK TAUTAN LINK KE FILE INDUK UTAMA (Misal: cambodia.html)
    const regexPembersihWadah = /(<div\s+id=["']arsip-otomatis["']>)[\s\S]*?(<\/div>)/i;
    if (regexPembersihWadah.test(kontenHTML)) {
        kontenHTML = kontenHTML.replace(regexPembersihWadah, `$1\n        <!-- MULAI ARSIP -->${daftarArsipHTML}        <!-- SELESAI ARSIP -->\n    $2`);
        fs.writeFileSync(htmlPath, kontenHTML, 'utf8');
        console.log(`✅ Tautan arsip sukses disuntik ke induk: ${pasaran.fileHTML}`);
    }

    // 5. CETAK FILE ARSIP HARIAN BARU (Membawa cetakan daftar link utuh dari nomor 4)
    const pathHalamanBaru = path.join(__dirname, namaHalamanBaru);

    if (!fs.existsSync(pathHalamanBaru)) {
        let kontenArsipHTML = kontenHTML;

        // Atur SEO Head khusus halaman arsip baru
        kontenArsipHTML = kontenArsipHTML
            .replace(/<title>[\s\S]*?<\/title>/i, `<title>Prediksi Akurat Pasaran ${pasaran.nama} Tanggal ${tglFormatIndo} - Angka Jitu</title>`)
            .replace(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i, `<meta property="og:title" content="Prediksi ${pasaran.nama} Tanggal ${tglFormatIndo} 100% Angka Jitu"`)
            .replace(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i, `<meta name="description" content="Arsip prediksi jitu pasaran ${pasaran.nama} pools hari ini tanggal ${tglFormatIndo}."`)
            .replace(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i, `<meta property="og:description" content="Arsip prediksi jitu pasaran ${pasaran.nama} pools hari ini tanggal ${tglFormatIndo}."`);

        // Ubah arah tombol kembali ke file induk pasaran, bukan index.html
        kontenArsipHTML = kontenArsipHTML.replace('href="index.html" class="back-btn"', `href="${pasaran.fileHTML}" class="back-btn"`);

        // Kunci data angka hari ini di file baru agar permanen (mencegah berubah besok)
        const penandaScriptAwal = `<script src="data/${pasaran.fileJS}"></script>`;
        const dataSuntikanStatis = `<script>
const ${pasaran.varName} = {
    update: "${dataEkstraksi.update}",
    tanggal_seo: "${dataEkstraksi.tanggal_seo}",
    data: ${JSON.stringify(dataEkstraksi.data)}
};</script>`;

        kontenArsipHTML = kontenArsipHTML.replace(penandaScriptAwal, dataSuntikanStatis);

        fs.writeFileSync(pathHalamanBaru, kontenArsipHTML, 'utf8');
        console.log(`✨ Sukses mengunci arsip ber-link lengkap: ${namaHalamanBaru}`);
    }
});
