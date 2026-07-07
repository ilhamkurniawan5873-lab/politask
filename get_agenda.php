<?php
include 'koneksi.php';
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = mysqli_query($koneksi, "SELECT * FROM agenda");
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Konversi isSelesai dari angka (0/1) ke boolean asli untuk React
        $row['isSelesai'] = (bool)$row['isSelesai'];
        $data[] = $row;
    }
    echo json_encode($data);
}
?>