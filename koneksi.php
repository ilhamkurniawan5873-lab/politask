<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "sql300.infinityfree.com"; 
$user = "if0_42291628";            
$db   = "if0_42291628_politask_db"; 
$pass = "pswHkmmcvSsf"; // Ganti dengan password asli vPanel kamu jika berbeda

$koneksi = mysqli_connect($host, $user, $pass, $db);

if (!$koneksi) {
    echo json_encode(["status" => "error", "message" => "Koneksi database gagal."]);
    exit();
}
?>