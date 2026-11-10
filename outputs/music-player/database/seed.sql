-- Meeoww seed data (idempotent: aman dijalankan berulang kali)
-- Catatan: tabel songs tidak punya UNIQUE constraint sehingga ON CONFLICT DO NOTHING
-- tidak pernah aktif. Pemeriksaan duplikat dilakukan manual dengan NOT EXISTS (case-insensitive).
INSERT INTO users (display_name, email)
SELECT 'Meeoww Demo', 'demo@meeoww.local'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo@meeoww.local');

-- Masukkan lagu baru hanya jika belum ada (title+artist, abaikan kapitalisasi)
INSERT INTO songs (title, artist, album, genre, cover_url, audio_url, duration_seconds)
SELECT s.title, s.artist, s.album, s.genre, s.cover_url, s.audio_url, s.duration_seconds
FROM (VALUES
  ('33x', 'Perunggu', 'Memorabilia', 'Rock', '/covers/33x.jpg', '/media/33x - Perunggu Lirik Lagu.mp3', 336),
  ('About You', 'The 1975', 'Being Funny in a Foreign Language', 'Rock', '/covers/about-you.jpg', '/media/The 1975 - About You (Official).mp3', 262),
  ('Best Friend', 'Rex Orange County', 'Apricot Princess', 'Pop', '/covers/best-friend.jpg', '/media/Rex Orange County - Best Friend (Official Audio).mp3', 238),
  ('Love Me Not', 'Ravyn Lenae', 'Bird''s Eye', 'R&B', '/covers/love-me-not.jpg', '/media/Love Me Not - Ravyn Lenae Lirik Terjemahan Indonesia.mp3', 190),
  ('What If I Call', 'Alex Crichton', 'Singles', 'Jazz', '/covers/what-if-i-call.jpg', '/media/What If I Call - Alex Crichton Lirik Terjemahan Indonesia.mp3', 214)
) AS s(title, artist, album, genre, cover_url, audio_url, duration_seconds)
WHERE NOT EXISTS (
  SELECT 1 FROM songs
  WHERE LOWER(songs.title) = LOWER(s.title) AND LOWER(songs.artist) = LOWER(s.artist)
);

-- Baru masuk: perbarui data existing dengan cover_url dan audio_url
UPDATE songs SET cover_url = '/covers/33x.jpg', audio_url = '/media/33x - Perunggu Lirik Lagu.mp3' WHERE LOWER(title) LIKE '%33x%' AND artist ILIKE 'perunggu';
UPDATE songs SET cover_url = '/covers/about-you.jpg', audio_url = '/media/The 1975 - About You (Official).mp3' WHERE LOWER(title) LIKE '%about you%' AND artist ILIKE 'the 1975';
UPDATE songs SET cover_url = '/covers/best-friend.jpg', audio_url = '/media/Rex Orange County - Best Friend (Official Audio).mp3' WHERE LOWER(title) LIKE '%best friend%' AND artist ILIKE 'rex orange county';
UPDATE songs SET cover_url = '/covers/love-me-not.jpg', audio_url = '/media/Love Me Not - Ravyn Lenae Lirik Terjemahan Indonesia.mp3' WHERE LOWER(title) LIKE '%love me not%' AND artist ILIKE 'ravyn lenae';
UPDATE songs SET cover_url = '/covers/what-if-i-call.jpg', audio_url = '/media/What If I Call - Alex Crichton Lirik Terjemahan Indonesia.mp3' WHERE LOWER(title) LIKE '%what if i call%' AND artist ILIKE 'alex crichton';
