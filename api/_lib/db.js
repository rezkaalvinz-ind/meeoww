const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL belum diatur di environment Vercel.');
}

const globalForDb = globalThis;
const pool = globalForDb.__meeowwPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
});

globalForDb.__meeowwPool = pool;

let schemaReady;

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        display_name VARCHAR(80) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT,
        avatar_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(180) NOT NULL,
        artist VARCHAR(180) NOT NULL,
        album VARCHAR(180),
        genre VARCHAR(80),
        cover_url TEXT,
        audio_url TEXT,
        duration_seconds INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `).catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  await schemaReady;
}

module.exports = { pool, ensureSchema };
