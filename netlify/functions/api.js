const mysql = require('mysql2/promise');

const getDbConnection = async () => {
  return mysql.createConnection({
    host: process.env.DB_HOST || 'bjgtjqpfgyymnosvaqrs-mysql.services.clever-cloud.com',
    user: process.env.DB_USER || 'uqqalwavwaaeghjb',
    password: process.env.DB_PASSWORD || 'AA9OWxsZcIQjuRXEw8fQ',
    database: process.env.DB_NAME || 'bjgtjqpfgyymnosvaqrs',
    port: parseInt(process.env.DB_PORT || '3306'),
    ssl: { rejectUnauthorized: false }
  });
};

exports.handler = async (event, context) => {
  // Normalize path and remove leading /api
  let path = event.path.replace(/^\/api/, '');
  // Netlify sometimes redirects /api/tugas to /tugas inside redirects
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  const method = event.httpMethod;

  try {
    const connection = await getDbConnection();

    if (path.startsWith('/tugas')) {
      if (method === 'GET') {
        const [rows] = await connection.query('SELECT * FROM tugas');
        await connection.end();
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(rows),
        };
      } else if (method === 'POST') {
        const data = JSON.parse(event.body || '{}');
        await connection.query(
          'INSERT INTO tugas (id_tugas, judul_tugas, nama_matkul, tanggal_deadline, prioritas) VALUES (?, ?, ?, ?, ?)',
          [data.id_tugas, data.judul_tugas, data.nama_matkul, data.tanggal_deadline, data.prioritas]
        );
        await connection.end();
        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ message: 'Success' }),
        };
      }
    } else if (path.startsWith('/delete-tugas/')) {
      if (method === 'POST' || method === 'DELETE') {
        const parts = path.split('/');
        const id = parts[parts.length - 1];
        await connection.query('DELETE FROM tugas WHERE id_tugas = ?', [id]);
        await connection.end();
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ message: 'Success' }),
        };
      }
    } else if (path.startsWith('/profile')) {
      if (method === 'GET') {
        const [rows] = await connection.query('SELECT nama_user FROM profil ORDER BY id DESC LIMIT 1');
        await connection.end();
        const name = rows && rows.length > 0 ? rows[0].nama_user : 'Ilham Kurniawan';
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ nama_user: name }),
        };
      } else if (method === 'POST') {
        const data = JSON.parse(event.body || '{}');
        await connection.query('INSERT INTO profil (nama_user) VALUES (?)', [data.nama_user]);
        await connection.end();
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ message: 'Success' }),
        };
      }
    }

    await connection.end();
    return {
      statusCode: 404,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Route not found: ' + path }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
