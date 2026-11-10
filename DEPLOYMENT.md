# Meeoww Music Player - Deployment Guide

## Deploy ke Vercel

### Opsi 1: Via Vercel Dashboard (Recommended)

1. Login ke [Vercel](https://vercel.com)
2. Klik "Add New Project"
3. Import repository: `rezkaalvinz-ind/meeoww`
4. **Build Settings**:
   - Framework Preset: `Other`
   - Root Directory: `outputs/music-player/frontend`
   - Build Command: (leave empty)
   - Output Directory: `.` (dot)
   - Install Command: (leave empty)
5. Klik "Deploy"

### Opsi 2: Via Vercel CLI

```bash
npm install -g vercel
cd "d:\hasil desain\meeoww(manus)"
vercel
```

### Opsi 3: Struktur Alternatif (Jika Opsi 1 Gagal)

Jika deployment gagal karena struktur folder, gunakan `vercel.json` yang sudah dibuat:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/outputs/music-player/frontend/index.html"
    }
  ]
}
```

## Troubleshooting

### Error: "No index.html found"
**Solusi**: Set Root Directory ke `outputs/music-player/frontend`

### Error: "404 Not Found"
**Solusi**: Pastikan vercel.json ada di root repository

### Error: "Build Failed"
**Solusi**: Ini adalah static site, tidak perlu build command

### Assets tidak load (CSS/JS/Images)
**Solusi**: Check path di index.html, pastikan menggunakan relative path

## Environment Variables (Optional untuk Backend)

Jika ingin deploy dengan backend:

1. Di Vercel Dashboard → Settings → Environment Variables
2. Tambahkan:
   - `DATABASE_URL`: Connection string PostgreSQL
   - `PORT`: 3000
   - `NODE_ENV`: production

## Backend Deployment (Opsional)

Backend Node.js bisa di-deploy terpisah di:
- Railway
- Render
- Heroku
- Vercel Serverless Functions

Untuk sekarang, frontend bisa jalan standalone tanpa backend (data hardcoded di app.js).

## Post-Deployment Checklist

- [ ] Homepage load dengan benar
- [ ] Welcome screen animation berjalan
- [ ] Login form tampil setelah splash
- [ ] Navigation bar berfungsi
- [ ] Audio player controls visible
- [ ] Responsive di mobile dan desktop

## Custom Domain (Optional)

1. Di Vercel Dashboard → Settings → Domains
2. Add domain Anda
3. Update DNS records sesuai instruksi Vercel

## Tips

1. **Preview Deploy**: Setiap push ke branch akan create preview URL
2. **Production Deploy**: Push ke `main` branch akan update production
3. **Rollback**: Bisa rollback ke deployment sebelumnya dari dashboard

---

**Support**: Jika ada masalah, share error message atau screenshot dari Vercel build logs.
