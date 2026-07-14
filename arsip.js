const fs = require("fs");


// baca data terbaru
let isi = fs.readFileSync(
"data/data-hk.js",
"utf8"
);


// ambil DATA_HK
let tanggal = isi.match(
/tanggal:\s*"([^"]+)"/
)[1];

let update = isi.match(
/update:\s*"([^"]+)"/
)[1];


// ambil isi data
let prediksi = isi.match(
/prediksi:\s*`([\s\S]*?)`/
)[1];

let result2d = isi.match(
/result2d:\s*"([^"]+)"/
)[1];

let bbfs = isi.match(
/bbfs:\s*"([^"]+)"/
)[1];

let cb = isi.match(
/cb:\s*"([^"]+)"/
)[1];


// baca arsip lama
let arsip=[];

if(fs.existsSync("data/arsip-hk.js")){

let lama=fs.readFileSync(
"data/arsip-hk.js",
"utf8"
);

try{

arsip=JSON.parse(
lama.replace(
"const ARSIP_HK =",
""
)
);

}catch(e){}

}


// cegah tanggal dobel

if(!arsip.find(x=>x.tanggal===tanggal)){

arsip.unshift({

tanggal,
update,

data:{
prediksi,
result2d,
bbfs,
cb
}

});

}


// simpan

fs.writeFileSync(
"data/arsip-hk.js",

"const ARSIP_HK = "+

JSON.stringify(
arsip,
null,
2
)

);

