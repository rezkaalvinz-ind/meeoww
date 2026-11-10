# Meeoww Music Player

Prototype *full-stack mobile-first music player* berdasarkan desain UI/UX Meeoww. Dilengkapi dengan backend Node.js native, streaming audio (HTTP 206 Partial Content), autentikasi password terenkripsi (`scrypt`), dan integrasi database PostgreSQL (Neon).

---

## 📁 Struktur Direktori

```text
outputs/music-player/
├── assets/
│   ├── audio/              # File lagu MP3 lokal
│   ├── meeoww-logo.png     # Logo utama Meeoww
│   └── meeoww-mark.png     # Logo icon Meeoww
├── frontend/
│   ├── covers/             # Cover album lagu
│   ├── index.html          # Shell Single Page Application
│   ├── styles.css          # Styling mobile-first (max-width 430px, 100dvh)
│   └── app.js              # State manager, web audio player, & API integration
├── backend/src/
│   ├── server.js           # HTTP server native (REST API, streaming, static files)
│   ├── db.js               # PostgreSQL connection pool
│   └── migrate.js          # Skrip migrasi skema tabel & seed data
├── database/
│   ├── schema.sql          # Definisi tabel PostgreSQL (users, songs, playlists, dsb.)
│   └── seed.sql            # Data awal lagu & user demo (idempotent)
├── shared/
│   └── api-contract.md     # Spesifikasi data API
├── docs/                   # Dokumentasi project
├── .env                    # Variabel environment lokal (DATABASE_URL, PORT)
└── package.json
```

---

## 🚀 Menjalankan Project

Pastikan Node.js 18 atau lebih baru sudah terpasang.

### Dari Folder Utama:
```bash
npm run dev
```

### Atau dari folder `outputs/music-player`:
```bash
cd outputs/music-player
npm install
npm run dev
```

Buka browser di **`http://localhost:3000`**.

---

## 🗄️ Database (Neon PostgreSQL)

Koneksi database dikonfigurasi melalui variabel `DATABASE_URL` di file `.env`.
Untuk menginisialisasi atau memperbarui skema dan daftar lagu:

```bash
npm run db:migrate
```

---

## 📡 API Endpoints

- `GET /api/health` — Status server dan koneksi database
- `GET /api/songs` — Mengambil seluruh daftar lagu
- `GET /api/songs?q=keyword` — Mencari lagu berdasarkan judul, artis, atau genre
- `GET /api/songs/:id` — Detail lagu berdasarkan ID
- `POST /api/auth/register` — Registrasi akun baru (password di-hash dengan `scrypt`)
- `POST /api/auth/login` — Autentikasi user
- `GET /media/:filename` — Streaming file audio dengan dukungan seek (HTTP Range 206)
- `GET /covers/:filename` — Mengambil file gambar cover album
