const { pool, ensureSchema } = require('../_lib/db');
const { hashPassword } = require('../_lib/password');

function json(res, status, body) {
  res.status(status).json(body);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    await ensureSchema();
    const { firstName, lastName, email, password } = req.body || {};
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
      return json(res, 400, { error: 'Semua field wajib diisi' });
    }
    if (password.length < 6) {
      return json(res, 400, { error: 'Password minimal 6 karakter' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rowCount > 0) return json(res, 409, { error: 'Email sudah terdaftar' });

    const displayName = `${firstName.trim()} ${lastName.trim()}`;
    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      'INSERT INTO users(display_name, email, password_hash) VALUES($1, $2, $3) RETURNING id, display_name AS "displayName", email, created_at AS "createdAt"',
      [displayName, normalizedEmail, passwordHash]
    );

    return json(res, 201, { message: 'Registrasi berhasil', user: result.rows[0] });
  } catch (error) {
    console.error('Register error:', error);
    return json(res, 503, { error: 'Database tidak tersedia' });
  }
};
