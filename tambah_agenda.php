<?php
include 'koneksi.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $id = $data['id'];
    $judul = $data['judul'];
    $keterangan = $data['keterangan'] ?? 'Aktivitas Harian';
    $tanggal = $data['tanggal'];
    $waktuMulai = $data['waktuMulai'] ?? null;
    $jamPengumpulan = $data['jamPengumpulan'] ?? null;
    $tipe = $data['tipe'];
    $isSelesai = $data['isSelesai'] ? 1 : 0;

    $query = "INSERT INTO agenda (id, judul, keterangan, tanggal, waktuMulai, jamPengumpulan, tipe, isSelesai) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = mysqli_prepare($koneksi, $query);
    mysqli_stmt_bind_param($stmt, "sssssssi", $id, $judul, $keterangan, $tanggal, $waktuMulai, $jamPengumpulan, $tipe, $isSelesai);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => mysqli_error($koneksi)]);
    }
}
?>