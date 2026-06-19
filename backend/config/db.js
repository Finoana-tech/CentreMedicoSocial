const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jirama_medical',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Test de connexion au démarrage
pool.getConnection()
  .then(connection => {
    console.log(' Pool de connexion MySQL créé avec succès');
    connection.release();
  })
  .catch(err => {
    console.error(' Erreur de création du pool MySQL:', err.message);
  });

module.exports = pool;