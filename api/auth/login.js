const { pool, ensureSchema } = require('../_lib/db');
const { verifyPassword } = require('../_lib/password');

function json(res, status, body) {
  res.status(status).json(body);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    await ensureSchema();
    const { username, password } = req.body || {};
    if (!username?.trim() || !password) {
      return json(res, 400, { error: 'Username dan password wajib diisi' });
    }

    const result = await pool.query(
      'SELECT id, display_name, email, password_hash FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(display_name) = LOWER($1) LIMIT 1',
      [username.trim()]
    );
    if (!result.rowCount || !(await verifyPassword(password, result.rows[0].password_hash))) {
      return json(res, 401, { error: 'Username atau password salah' });
    }

    const user = result.rows[0];
    return json(res, 200, {
      message: 'Login berhasil',
      user: { id: user.id, displayName: user.display_name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    return json(res, 503, { error: 'Database tidak tersedia' });
  }
};
