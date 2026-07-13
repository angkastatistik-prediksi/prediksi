const fs = require("fs");
const path = require("path");
const DOMAIN = "https://angkastatistik.my.id";

const PASARAN = [
"hk",
"sdy",
"sgp",
"china",
"japan",
"taiwan",
"cambodia",
"macau"
];

function generateSitemap(){}
function generateArchive(){}
function generateRSS(){}
function updateHistory(){}
generateArchive();
generateSitemap();
generateRSS();
updateHistory();

const DATA_FOLDER = "./data";
const OUTPUT_FOLDER = "./arsip";
if (!fs.existsSync(OUTPUT_FOLDER)){
    fs.mkdirSync(OUTPUT_FOLDER);
}
const today = new Date().toISOString().slice(0,10);
console.log("Tanggal :",today);
console.log("Mulai Generate...");
