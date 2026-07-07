<?php
include 'koneksi.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'];

    if (!empty($id)) {
        $query = "DELETE FROM agenda WHERE id = ?";
        $stmt = mysqli_prepare($koneksi, $query);
        mysqli_stmt_bind_param($stmt, "s", $id);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(["success" => true, "message" => "Agenda berhasil dihapus"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => mysqli_error($koneksi)]);
        }
    } else {
        echo json_encode(["error" => "ID tidak ditemukan"]);
    }
}
?>