<?php
include 'koneksi.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $id = isset($_GET['id']) ? $_GET['id'] : $data['id'];
    $judul = $data['judul'];
    $keterangan = $data['keterangan'];
    $tanggal = $data['tanggal'];
    $waktuMulai = $data['waktuMulai'] ?? null;
    $jamPengumpulan = $data['jamPengumpulan'] ?? null;

    $query = "UPDATE agenda SET judul = ?, keterangan = ?, tanggal = ?, waktuMulai = ?, jamPengumpulan = ? WHERE id = ?";
    $stmt = mysqli_prepare($koneksi, $query);
    mysqli_stmt_bind_param($stmt, "ssssss", $judul, $keterangan, $tanggal, $waktuMulai, $jamPengumpulan, $id);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => mysqli_error($koneksi)]);
    }
}
?>