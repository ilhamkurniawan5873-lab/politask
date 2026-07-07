<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'koneksi.php';

if (!$koneksi) {
    echo json_encode(["status" => "error", "message" => "Koneksi ke database gagal dikonfigurasi!"]);
    exit();
}

// Mengetes membaca struktur kolom tabel agenda langsung dari server online
$query = mysqli_query($koneksi, "DESCRIBE agenda");
$columns = [];

if ($query) {
    while ($row = mysqli_fetch_assoc($query)) {
        $columns[] = $row['Field'] . " (" . $row['Type'] . ")";
    }
    echo json_encode([
        "status" => "sukses",
        "message" => "Berhasil terhubung ke database online!",
        "kolom_tabel_agenda_kamu" => $columns
    ], JSON_PRETTY_PRINT);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Gagal membaca tabel: " . mysqli_error($koneksi)
    ]);
}
?>