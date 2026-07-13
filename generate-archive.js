const fs = require("fs");
const path = require("path");

const DOMAIN="https://angkastatistik.my.id";

const DATA_FOLDER="./data";
const OUTPUT_FOLDER="./arsip";

if(!fs.existsSync(OUTPUT_FOLDER)){
fs.mkdirSync(OUTPUT_FOLDER,{recursive:true});
}

const PASARAN=[
"hk",
"sdy",
"sgp",
"china",
"japan",
"taiwan",
"cambodia",
"macau"
];

function getToday(){

const d=new Date();

const y=d.getFullYear();

const m=String(d.getMonth()+1).padStart(2,"0");

const day=String(d.getDate()).padStart(2,"0");

return `${y}-${m}-${day}`;

}

const TODAY=getToday();

function readData(file){

let txt=fs.readFileSync(file,"utf8");

txt=txt.replace(/const\s+/,"");

txt=txt.replace("=","=");

const sandbox={};

try{

eval(txt);

}catch(e){

console.log("ERROR :",file);

console.log(e);

return null;

}

const key=Object.keys(global).find(k=>k.startsWith("DATA_"));

if(global[key]) return global[key];

return null;

}

function buildHTML(nama,data){

return `<!DOCTYPE html>

<html lang="id">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width,initial-scale=1">

<title>${nama.toUpperCase()} ${TODAY}</title>

<meta name="description" content="Prediksi ${nama.toUpperCase()} ${TODAY}">

<link rel="canonical" href="${DOMAIN}/${nama}.html">

</head>

<body>

<h1>${nama.toUpperCase()}</h1>

<h3>${data.update}</h3>

<pre>${data.data.prediksi}</pre>

<h2>2D</h2>

<p>${data.data.result2d}</p>

<h2>BBFS</h2>

<p>${data.data.bbfs}</p>

<h2>TUNGGAL</h2>

<p>${data.data.cb}</p>

</body>

</html>`;

}

function generateArchive(){

PASARAN.forEach(nama=>{

const file=path.join(DATA_FOLDER,`data-${nama}.js`);

if(!fs.existsSync(file)) return;

const DATA=readData(file);

if(!DATA) return;

const html=buildHTML(nama,DATA);

const output=path.join(
OUTPUT_FOLDER,
`${nama}-${TODAY}.html`
);

fs.writeFileSync(output,html);

console.log("Berhasil :",output);

});

}

generateArchive();
