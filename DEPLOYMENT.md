# Meeoww Music Player - Deployment ke Vercel + Neon

Project ini sekarang memakai Vercel untuk frontend dan Serverless API, serta Neon PostgreSQL untuk data akun dan lagu.

## 1. Pengaturan Project Vercel

Di Vercel Dashboard → Project → Settings → General:

- **Root Directory**: kosongkan atau gunakan root repository `meeoww`
- **Framework Preset**: Other
- **Build Command**: kosong
- **Output Directory**: kosong
- **Install Command**: `npm install`

Jangan gunakan `outputs/music-player/frontend` sebagai Root Directory karena folder tersebut hanya berisi frontend dan tidak membawa folder `api`.

## 2. Environment Variable Neon

Di Vercel Dashboard → Settings → Environment Variables, tambahkan:

```text
Name: DATABASE_URL
Value: connection string Neon kamu
Environments: Production, Preview, Development
```

Jangan menaruh connection string langsung di source code atau melakukan commit file `.env`.

## 3. Database

Schema dan seed lagu sudah dijalankan ke Neon. Jika perlu mengulang migrasi dari komputer lokal:

```powershell
npm.cmd --prefix outputs/music-player run db:migrate
```

## 4. Deploy

Setelah menyimpan environment variable:

```powershell
git add .
git commit -m "Add Vercel Neon API"
git push origin main
```

Push ke `main` akan memicu deployment production jika repository sudah terhubung ke Vercel.

## 5. Endpoint yang tersedia

- `POST /api/auth/register` — membuat akun di tabel `users`
- `POST /api/auth/login` — login dengan email atau nama tampilan
- `GET /api/songs` — membaca lagu dari tabel `songs`
- `GET /api/songs?q=about` — mencari lagu

Gambar dan audio contoh disajikan dari file di repository melalui rewrite Vercel (`/assets`, `/covers`, dan `/media`). Daftar lagu contoh tetap tersedia sebagai fallback frontend jika API/database belum siap.

## 6. Jika masih muncul error

Buka Vercel → Deployments → deployment terbaru → Functions Logs. Pastikan:

1. `DATABASE_URL` tersedia di environment yang dipakai deployment.
2. Root Directory bukan `outputs/music-player/frontend`.
3. Deployment terbaru sudah menggunakan commit yang berisi folder `api`.
4. Neon mengizinkan koneksi dari serverless function.
