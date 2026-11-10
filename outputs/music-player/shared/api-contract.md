# Shared API Contract

## Song

```json
{
  "id": 1,
  "title": "Best friend",
  "artist": "Rex Orange County",
  "genre": "Pop",
  "album": "Apricot Princess",
  "coverUrl": null,
  "audioUrl": null,
  "durationSeconds": 238
}
```

`GET /api/songs` mengembalikan `{ "data": Song[] }` dan mendukung query `q` untuk pencarian.
