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
function generateArchive(){

    const files = getDataFiles();

    files.forEach(file=>{

        const market = getMarketName(file);

        const html = `
<!DOCTYPE html>
<html>
<head>
<title>${market.toUpperCase()} ${today}</title>
</head>

<body>

<h1>${market.toUpperCase()}</h1>

<p>Arsip otomatis ${today}</p>

</body>

</html>
`;

        fs.writeFileSync(
            path.join(
                OUTPUT_FOLDER,
                archiveFileName(market)
            ),
            html
        );

    });

                  }
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

function getDataFiles() {
    return fs.readdirSync(DATA_FOLDER)
        .filter(file => file.startsWith("data-") && file.endsWith(".js"));
}

function getMarketName(filename) {
    return filename
        .replace("data-", "")
        .replace(".js", "");
    }

function archiveFileName(market) {
    return `${market}-${today}.html`;
            }

