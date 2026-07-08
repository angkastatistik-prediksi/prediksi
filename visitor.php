<?php
date_default_timezone_set("Asia/Jakarta");

$token = "8618368155:AAEfe6hZ-r5yDV2OOxik2LNvsfAIsttu9Rk";
$chat_id = "7887222182";

// Folder cache
if (!is_dir("cache")) {
    mkdir("cache", 0755, true);
}

$ip = $_SERVER['REMOTE_ADDR'];
$file = "cache/" . md5($ip);

// Jangan kirim lagi jika IP yang sama berkunjung dalam 10 menit
if (file_exists($file) && (time() - filemtime($file) < 600)) {
    exit;
}

touch($file);

// Ambil informasi lokasi
$info = @json_decode(file_get_contents("http://ip-api.com/json/".$ip), true);

$negara = $info['country'] ?? "-";
$kota    = $info['city'] ?? "-";
$isp     = $info['isp'] ?? "-";

$browser = $_SERVER['HTTP_USER_AGENT'];
$halaman = $_SERVER['REQUEST_URI'];
$jam = date("d-m-Y H:i:s");

$pesan =
"🔔 ADA PENGUNJUNG BARU\n\n".
"🕒 ".$jam."\n".
"🌍 Negara : ".$negara."\n".
"🏙 Kota : ".$kota."\n".
"📡 ISP : ".$isp."\n".
"🌐 IP : ".$ip."\n".
"📄 Halaman : ".$halaman."\n".
"💻 ".$browser;

$url = "https://api.telegram.org/bot".$token."/sendMessage";

file_get_contents(
    $url.
    "?chat_id=".$chat_id.
    "&text=".urlencode($pesan)
);
