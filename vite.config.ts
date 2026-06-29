import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'bjgtjqpfgyymnosvaqrs-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'uqqalwavwaaeghjb',
  password: process.env.DB_PASSWORD || 'AA9OWxsZcIQjuRXEw8fQ',
  database: process.env.DB_NAME || 'bjgtjqpfgyymnosvaqrs',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Auto create tables
db.getConnection((err, connection) => {
  if (err) {
    console.error('Gagal koneksi MySQL Clever Cloud:', err);
  } else {
    console.log('Mantap! Database Online terhubung.');
    connection.query(`CREATE TABLE IF NOT EXISTS tugas (
      id_tugas BIGINT PRIMARY KEY,
      judul_tugas VARCHAR(255) NOT NULL,
      nama_matkul VARCHAR(255) NOT NULL,
      tanggal_deadline VARCHAR(100) NOT NULL,
      prioritas VARCHAR(50) NOT NULL
    )`);
    connection.query(`CREATE TABLE IF NOT EXISTS profil (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nama_user VARCHAR(255) NOT NULL
    )`);
    connection.release();
  }
});

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-server',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith('/api/tugas')) {
              res.setHeader('Content-Type', 'application/json');
              if (req.method === 'GET') {
                db.query('SELECT * FROM tugas', (err, results) => {
                  if (err) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: err.message }));
                  } else {
                    res.end(JSON.stringify(results));
                  }
                });
              } else if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                  try {
                    const data = JSON.parse(body);
                    db.query('INSERT INTO tugas (id_tugas, judul_tugas, nama_matkul, tanggal_deadline, prioritas) VALUES (?, ?, ?, ?, ?)',
                      [data.id_tugas, data.judul_tugas, data.nama_matkul, data.tanggal_deadline, data.prioritas],
                      (err) => {
                        if (err) {
                          res.statusCode = 500;
                          res.end(JSON.stringify({ error: err.message }));
                        } else {
                          res.end(JSON.stringify({ message: 'Success' }));
                        }
                      }
                    );
                  } catch (e) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                  }
                });
              }
            } else if (req.url?.startsWith('/api/delete-tugas/')) {
              res.setHeader('Content-Type', 'application/json');
              if (req.method === 'DELETE' || req.method === 'POST') {
                const parts = req.url.split('/');
                const id = parts[parts.length - 1];
                db.query('DELETE FROM tugas WHERE id_tugas = ?', [id], (err) => {
                  if (err) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: err.message }));
                  } else {
                    res.end(JSON.stringify({ message: 'Success' }));
                  }
                });
              }
            } else if (req.url?.startsWith('/api/profile')) {
              res.setHeader('Content-Type', 'application/json');
              if (req.method === 'GET') {
                db.query('SELECT nama_user FROM profil ORDER BY id DESC LIMIT 1', (err, results: any) => {
                  if (err) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: err.message }));
                  } else {
                    const name = results && results.length > 0 ? results[0].nama_user : 'Ilham Kurniawan';
                    res.end(JSON.stringify({ nama_user: name }));
                  }
                });
              } else if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                  try {
                    const data = JSON.parse(body);
                    db.query('INSERT INTO profil (nama_user) VALUES (?)', [data.nama_user], (err) => {
                      if (err) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: err.message }));
                      } else {
                        res.end(JSON.stringify({ message: 'Success' }));
                      }
                    });
                  } catch (e) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                  }
                });
              }
            } else {
              next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
