const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const http = require('node:http');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { URL } = require('node:url');
const pool = require('./db');

const scrypt = promisify(crypto.scrypt);
const PORT = process.env.PORT || 3000;

// Directory paths
const frontendDir = path.resolve(__dirname, '../../frontend');
const assetsDir = path.resolve(__dirname, '../../assets');
const audioDir = path.resolve(__dirname, '../../assets/audio');
const rootDir = path.resolve(__dirname, '../..');

/**
 * Send HTTP Response helper
 */
function send(res, status, body, type = 'application/json') {
  res.writeHead(status, {
    'Content-Type': `${type}; charset=utf-8`,
    'Cache-Control': 'no-cache',
  });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

/**
 * Hash password using scrypt
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return scrypt(password, salt, 64).then((key) => `${salt}:${key.toString('hex')}`);
}

/**
 * Verify password against stored hash
 */
async function verifyPassword(password, stored) {
  const [salt, key] = String(stored || '').split(':');
  if (!salt || !key) return false;
  const derivedKey = await scrypt(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
}

/**
 * Parse incoming JSON body
 */
async function parseBody(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
  }
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return null;
  }
}

/**
 * Serve audio and media files with HTTP Range (Partial Content) support
 */
function serveAudio(req, res, url) {
  const requested = decodeURIComponent(url.pathname.slice('/media/'.length));

  if (!requested || requested.includes('..') || path.basename(requested) !== requested) {
    return send(res, 400, { error: 'Invalid audio path' });
  }

  // Look in assets/audio first, then fallback to rootDir
  let file = path.join(audioDir, requested);
  if (!fs.existsSync(file)) {
    file = path.join(rootDir, requested);
  }

  if (!/\.(mp3|wav|ogg|m4a|flac|jpg|jpeg|png|webp|gif)$/i.test(file)) {
    return send(res, 415, { error: 'Unsupported media format' });
  }

  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) {
      return send(res, 404, { error: 'Audio not found' });
    }

    const mimeTypes = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/mp4',
      '.flac': 'audio/flac',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    const contentType = mimeTypes[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range;

    let start = 0;
    let end = stat.size - 1;

    if (range) {
      const match = /bytes=(\d*)-(\d*)/.exec(range);
      if (match) {
        if (match[1]) start = Number(match[1]);
        if (match[2]) end = Number(match[2]);
        if (!match[1] && match[2]) start = Math.max(0, stat.size - Number(match[2]));
        if (start > end || start >= stat.size) {
          return send(res, 416, { error: 'Range not satisfiable' });
        }
        end = Math.min(end, stat.size - 1);
        res.writeHead(206, {
          'Content-Type': contentType,
          'Content-Length': end - start + 1,
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache',
        });
        return fs.createReadStream(file, { start, end }).pipe(res);
      }
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(file).pipe(res);
  });
}

/**
 * Query songs from PostgreSQL database
 */
async function getSongs(q = '') {
  const result = await pool.query(
    `SELECT id, title, artist, album, genre, cover_url AS "coverUrl", audio_url AS "audioUrl", duration_seconds AS "durationSeconds"
     FROM songs
     WHERE ($1 = '' OR LOWER(title || ' ' || artist || ' ' || COALESCE(genre, '')) LIKE '%' || LOWER($1) || '%')
     ORDER BY id`,
    [q]
  );
  return result.rows;
}

/**
 * Serve static frontend and asset files
 */
function serveStatic(req, res) {
  const requested = req.url === '/' ? 'index.html' : decodeURIComponent(req.url.replace(/^\//, ''));
  const isAsset = requested.startsWith('assets/');
  const root = isAsset ? path.resolve(assetsDir, '..') : frontendDir;
  const file = path.resolve(root, requested);

  if (!(file === root || file.startsWith(root + path.sep))) {
    return send(res, 403, { error: 'Forbidden' });
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      return send(res, 404, { error: 'Not found' });
    }

    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };
    send(res, 200, data, mimeTypes[path.extname(file)] || 'application/octet-stream');
  });
}

/**
 * Main HTTP Server
 */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    // 1. Audio / Media streaming
    if (req.method === 'GET' && url.pathname.startsWith('/media/')) {
      return serveAudio(req, res, url);
    }

    // 2. Health check
    if (req.method === 'GET' && url.pathname === '/api/health') {
      await pool.query('SELECT 1');
      return send(res, 200, {
        status: 'ok',
        service: 'meeoww-api',
        database: 'connected',
      });
    }

    // 3. User Registration
    if (req.method === 'POST' && url.pathname === '/api/auth/register') {
      const data = await parseBody(req);
      if (!data || !data.firstName || !data.lastName || !data.email || !data.password) {
        return send(res, 400, { error: 'Semua field wajib diisi' });
      }
      if (data.password.length < 6) {
        return send(res, 400, { error: 'Password minimal 6 karakter' });
      }

      const email = data.email.trim().toLowerCase();
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rowCount > 0) {
        return send(res, 409, { error: 'Email sudah terdaftar' });
      }

      const displayName = `${data.firstName.trim()} ${data.lastName.trim()}`;
      const hashedPassword = await hashPassword(data.password);
      const result = await pool.query(
        'INSERT INTO users(display_name, email, password_hash) VALUES($1, $2, $3) RETURNING id, display_name, email, created_at',
        [displayName, email, hashedPassword]
      );

      return send(res, 201, {
        message: 'Registrasi berhasil',
        user: result.rows[0],
      });
    }

    // 4. User Login
    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const data = await parseBody(req);
      if (!data || !data.username || !data.password) {
        return send(res, 400, { error: 'Username dan password wajib diisi' });
      }

      const username = data.username.trim();
      const result = await pool.query(
        'SELECT id, display_name, email, password_hash FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(display_name) = LOWER($1) LIMIT 1',
        [username]
      );

      if (!result.rowCount || !(await verifyPassword(data.password, result.rows[0].password_hash))) {
        return send(res, 401, { error: 'Username atau password salah' });
      }

      const user = result.rows[0];
      return send(res, 200, {
        message: 'Login berhasil',
        user: { id: user.id, displayName: user.display_name, email: user.email },
      });
    }

    // 5. Songs List & Search
    if (req.method === 'GET' && url.pathname === '/api/songs') {
      const query = url.searchParams.get('q') || '';
      return send(res, 200, { data: await getSongs(query) });
    }

    // 6. Song by ID
    if (req.method === 'GET' && url.pathname.startsWith('/api/songs/')) {
      const id = Number(url.pathname.split('/').pop());
      if (!Number.isInteger(id) || id < 1) {
        return send(res, 400, { error: 'Song id harus berupa angka' });
      }

      const result = await pool.query(
        `SELECT id, title, artist, album, genre, cover_url AS "coverUrl", audio_url AS "audioUrl", duration_seconds AS "durationSeconds"
         FROM songs WHERE id = $1`,
        [id]
      );

      return result.rows[0]
        ? send(res, 200, { data: result.rows[0] })
        : send(res, 404, { error: 'Song not found' });
    }

    // 7. Fallback: Static file server
    serveStatic(req, res);
  } catch (error) {
    console.error('Server error:', error.message);
    if (url.pathname.startsWith('/api/')) {
      return send(res, 503, { error: 'Database unavailable', detail: error.message });
    }
    send(res, 500, { error: 'Internal server error' });
  }
});

// Port in-use error handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} sudah dipakai. Tutup proses lain di port ini atau ubah PORT di .env.`);
    process.exit(1);
  }
  throw error;
});

// Start listening
server.listen(PORT, () => {
  console.log(`Meeoww server running at http://localhost:${PORT}`);
});
