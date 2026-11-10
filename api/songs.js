const { pool, ensureSchema } = require('./_lib/db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await ensureSchema();
    const q = String(req.query?.q || '');
    const result = await pool.query(
      `SELECT id, title, artist, album, genre,
              cover_url AS "coverUrl", audio_url AS "audioUrl",
              duration_seconds AS "durationSeconds"
       FROM songs
       WHERE ($1 = '' OR LOWER(title || ' ' || artist || ' ' || COALESCE(genre, '')) LIKE '%' || LOWER($1) || '%')
       ORDER BY id`,
      [q]
    );
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Songs error:', error);
    return res.status(503).json({ error: 'Database tidak tersedia' });
  }
};
