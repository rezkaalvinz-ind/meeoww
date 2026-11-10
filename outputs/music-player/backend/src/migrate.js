const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('./db');

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Run schema
    const schema = fs
      .readFileSync(path.resolve(__dirname, '../../database/schema.sql'), 'utf8')
      .replaceAll('CREATE TABLE ', 'CREATE TABLE IF NOT EXISTS ');
    await client.query(schema);

    // Ensure password_hash column exists
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT');

    // Run seed data
    const seed = fs.readFileSync(path.resolve(__dirname, '../../database/seed.sql'), 'utf8');
    await client.query(seed);

    await client.query('COMMIT');
    console.log('Database schema, password_hash, dan seed berhasil dijalankan.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migrasi gagal:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
