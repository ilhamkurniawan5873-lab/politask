import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(express.json({ limit: '10mb' })); 
app.use(cors());

// Koneksi Basis Data XAMPP
const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'politask_db'
});

// 1. Ambil Semua Data Agenda
app.get('/api/agenda', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM agenda');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Tambah Agenda Baru
app.post('/api/agenda', async (req, res) => {
    try {
        const { id, judul, keterangan, tanggal, waktuMulai, jamPengumpulan, tipe, isSelesai } = req.body;
        await db.query(
            'INSERT INTO agenda (id, judul, keterangan, tanggal, waktuMulai, jamPengumpulan, tipe, isSelesai) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, judul, keterangan, tanggal, waktuMulai, jamPengumpulan, tipe, isSelesai ? 1 : 0]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Edit / Update Agenda Lama
app.put('/api/agenda/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { judul, keterangan, tanggal, waktuMulai, jamPengumpulan } = req.body;
        await db.query(
            'UPDATE agenda SET judul = ?, keterangan = ?, tanggal = ?, waktuMulai = ?, jamPengumpulan = ? WHERE id = ?',
            [judul, keterangan, tanggal, waktuMulai, jamPengumpulan, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Update Status Ceklis Selesai
app.put('/api/agenda/:id/ceklis', async (req, res) => {
    try {
        const { id } = req.params;
        const { isSelesai } = req.body;
        await db.query('UPDATE agenda SET isSelesai = ? WHERE id = ?', [isSelesai ? 1 : 0, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Hapus Agenda Permanen (SUDAH DIPERBAIKI)
app.delete('/api/agenda/:id', async (req, res) => {
    try {
        const id = req.params.id; // Diperbaiki: Mengambil id dari req.params.id
        await db.query('DELETE FROM agenda WHERE id = ?', [id]);
        res.json({ success: true, message: "Agenda berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => {
    console.log('🚀 API PoliTask Aktif Terhubung XAMPP di Port 5000');
});