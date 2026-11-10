/**
 * Meeoww Music Player - Client Application Logic
 * Terhubung penuh dengan Database API, Dynamic Lyrics, Profile Management,
 * Interactive Audio Player, dan UI Controls.
 */

// Helper selector
const $ = (selector) => document.querySelector(selector);

// Media URL Helpers
const media = (name) => `/media/${encodeURIComponent(name)}`;
const coverMedia = (name) => `/covers/${name}`;

// Lyrics Collection
const SONG_LYRICS = {
  '33x': [
    'Tenanglah, tenang',
    'Semua ada waktunya',
    'Tarik nafas yang dalam',
    'Sebelum kita melangkah lagi',
    'Tiga puluh tiga kali ku bertanya',
    'Apakah ini jalan yang kupilih?',
    'Tetaplah berjalan di antara riuh',
    'Dan temukan damaimu di sana'
  ],
  'about you': [
    'And there was something about you that now I can\'t remember',
    'It\'s the same damn thing that made my heart surrender',
    'And I miss you on a train, I miss you in the morning',
    'I never know what to think about',
    'I think about you, about you',
    'Do you think you have forgotten?',
    'Do you think you have forgotten about you?'
  ],
  'best friend': [
    'I should\'ve stayed at home',
    '\'Cause now there ain\'t no way around it',
    'I try to read your mind',
    'Just to see if you have decided',
    'I still wanna be your favorite boy',
    'I wanna be the one that you call first',
    'At 2 AM when everything hurts'
  ],
  'love me not': [
    'He loves me, he loves me not',
    'Count the petals till they fall',
    'Spinning round inside my head',
    'Wondering if you ever call',
    'Tell me now or let me go',
    'Underneath the velvet glow',
    'Are we real or just a show?'
  ],
  'what if i call': [
    'What if I call you late tonight?',
    'Underneath the city light',
    'Would you pick up and say hello?',
    'Or tell me that it\'s time to go',
    'Merry Christmas, I still miss you',
    'Wondering what could have been',
    'If we never let it end'
  ]
};

// Default Offline / Fallback Data
const DEFAULT_SONGS = [
  {
    id: 1,
    title: '33x',
    artist: 'Perunggu',
    album: 'Memorabilia',
    genre: 'Rock',
    coverUrl: coverMedia('33x.jpg'),
    audioUrl: media('33x - Perunggu Lirik Lagu.mp3'),
    durationSeconds: 336,
  },
  {
    id: 2,
    title: 'About You',
    artist: 'The 1975',
    album: 'Being Funny in a Foreign Language',
    genre: 'Rock',
    coverUrl: coverMedia('about-you.jpg'),
    audioUrl: media('The 1975 - About You (Official).mp3'),
    durationSeconds: 262,
  },
  {
    id: 3,
    title: 'Best Friend',
    artist: 'Rex Orange County',
    album: 'Apricot Princess',
    genre: 'Pop',
    coverUrl: coverMedia('best-friend.jpg'),
    audioUrl: media('Rex Orange County - Best Friend (Official Audio).mp3'),
    durationSeconds: 238,
  },
  {
    id: 4,
    title: 'Love Me Not',
    artist: 'Ravyn Lenae',
    album: "Bird's Eye",
    genre: 'R&B',
    coverUrl: coverMedia('love-me-not.jpg'),
    audioUrl: media('Love Me Not - Ravyn Lenae Lirik Terjemahan Indonesia.mp3'),
    durationSeconds: 190,
  },
  {
    id: 5,
    title: 'What If I Call',
    artist: 'Alex Crichton',
    album: 'Singles',
    genre: 'Jazz',
    coverUrl: coverMedia('what-if-i-call.jpg'),
    audioUrl: media('What If I Call - Alex Crichton Lirik Terjemahan Indonesia.mp3'),
    durationSeconds: 214,
  },
];

// In-Memory State
let songs = [...DEFAULT_SONGS];
let audioTracks = [...DEFAULT_SONGS];
const likedTracks = new Set(['About You']);

// Cover Art Lookup Helper
function getCover(title) {
  const found = songs.find((s) => s.title.toLowerCase() === String(title || '').toLowerCase());
  if (found && found.coverUrl) return found.coverUrl;

  const fallbackMap = {
    '33x': coverMedia('33x.jpg'),
    'love me not': coverMedia('love-me-not.jpg'),
    'best friend': coverMedia('best-friend.jpg'),
    'about you': coverMedia('about-you.jpg'),
    'what if i call': coverMedia('what-if-i-call.jpg'),
  };
  return fallbackMap[String(title || '').toLowerCase()] || '';
}

// SVG Icon Paths
const paths = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  arrow: '<path d="m15 18-6-6 6-6"/>',
  more: '<circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/>',
  bell: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  eyeOff: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/><path d="m3 3 18 18"/>',
  play: '<path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  prev: '<path d="m17 6-8 6 8 6V6ZM6 6v12"/>',
  next: '<path d="m7 6 8 6-8 6V6Zm11 0v12"/>',
  shuffle: '<path d="M3 7h3c4 0 6 10 10 10h5M17 4l4 3-4 3M3 17h3c1.5 0 2.5-.8 3.3-1.8M17 14l4 3-4 3"/>',
  repeat: '<path d="M17 3l4 3-4 3M3 12V8a2 2 0 0 1 2-2h16M7 21l-4-3 4-3M21 12v4a2 2 0 0 1-2 2H3"/>',
  home: '<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H8v6H4a1 1 0 0 1-1-1v-9Z"/>',
  library: '<path d="M5 4v16M10 4v16M15 4v16M20 4v16"/>',
  profile: '<circle cx="12" cy="8" r="3"/><path d="M5 21a7 7 0 0 1 14 0"/>',
  heart: '<path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 2.5Z"/>',
  heartFill: '<path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 2.5Z" fill="currentColor" stroke="none"/>',
  lyrics: '<path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  volume: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>',
  volumeMute: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/>',
  offline: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  theme: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
  cat: '<circle cx="12" cy="13" r="7"/><path d="M7 8 5 4l4 2M17 8l2-4-4 2"/><circle cx="9.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="12" r="1" fill="currentColor" stroke="none"/><path d="M11 15c.5.5 1.5.5 2 0"/>',
  google: '<path d="M22 12c0-.7-.06-1.36-.18-2H12v4.26h5.6a4.8 4.8 0 0 1-2.08 3.14v2.6h3.36c1.96-1.8 3.12-4.46 3.12-8Z"/><path d="M12 22c2.78 0 5.12-.92 6.82-2.5l-3.36-2.6a6.04 6.04 0 0 1-9.04-3.18H2.93v2.68A10 10 0 0 0 12 22Z"/><path d="M6.42 13.72a6 6 0 0 1 0-3.44V7.6H2.93a10 10 0 0 0 0 8.8l3.49-2.68Z"/><path d="M12 5.92c1.5 0 2.87.52 3.93 1.54l2.95-2.95A9.97 9.97 0 0 0 12 2 10 10 0 0 0 2.93 7.6l3.49 2.68c.82-2.46 3.14-4.36 5.58-4.36Z"/>',
  apple: '<path d="M18.7 19.5c-.8 1.2-1.7 2.4-3 2.5-1.3.1-1.8-.8-3.3-.8s-2 .8-3.3.8c-1.3-.1-2.3-1.3-3.1-2.5-1.7-2.5-3-7-1.2-10.1 1-1.6 2.6-2.6 4.3-2.6 1.3 0 2.5.9 3.3.9s2.3-.9 3.8-.9c1.6 0 3 .8 3.8 2-3.1 1.9-2.6 6 0 7.2-.6 1.3-1.4 2.5-2.2 3.5Z"/><path d="M15.5 5.5c.7-.9 1.2-2.1 1-3.3-1.1.1-2.3.7-3 1.6-.6.7-1.1 2-1 3.2 1.2.1 2.3-.6 3-1.5Z"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z"/>',
  twitter: '<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>',
};

function icon(name) {
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.more}</svg>`;
}

// Render Song Row Item
function renderSongRow(song, isResult = false) {
  const title = song.title;
  const artist = song.artist;
  const cover = song.coverUrl || getCover(title);

  return `
    <div class="${isResult ? 'result-row' : 'song-row'}" data-track-title="${title}">
      <div class="${isResult ? 'result-icon' : 'song-art'}"${cover ? ` style="background-image:url('${cover}')"` : ''}>
        ${isResult ? icon('search') : ''}
      </div>
      <div class="${isResult ? '' : 'song-copy'}">
        <strong>${title}</strong>
        <small>${artist}</small>
      </div>
      ${isResult ? '' : `<button type="button" class="song-menu" aria-label="Song options">${icon('more')}</button>`}
    </div>
  `;
}

// Render Featured Result Card
function renderResultFeature(song) {
  const title = song.title;
  const artist = song.artist;
  const cover = song.coverUrl || getCover(title);

  return `
    <div class="result-feature" data-track-title="${title}">
      <div class="result-cover" style="background-image:url('${cover}')"></div>
      <div class="result-feature-copy">
        <strong>${title}</strong>
        <small>${artist}</small>
      </div>
      <button type="button" class="result-play" aria-label="Play result">${icon('play')}</button>
      <button type="button" class="result-more" aria-label="More options">${icon('more')}</button>
    </div>
  `;
}

// Update Trending & Search List in DOM
function renderTrendingList() {
  const trendingContainer = $('#trendingList');
  if (trendingContainer) {
    trendingContainer.innerHTML = songs.map((song) => renderSongRow(song)).join('');
  }

  // Update Hero Cards Cover Art
  document.querySelectorAll('.hero-card[data-track-title]').forEach((card) => {
    const art = card.querySelector('.hero-art');
    const cover = getCover(card.dataset.trackTitle);
    if (art && cover) art.style.backgroundImage = `url('${cover}')`;
  });
}

// Fetch Songs from Backend Database API with Offline Fallback
async function loadSongsFromApi() {
  try {
    const response = await fetch('/api/songs');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();

    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      songs = json.data.map((item) => {
        const title = item.title;
        return {
          id: item.id,
          title: item.title,
          artist: item.artist,
          album: item.album || '',
          genre: item.genre || '',
          coverUrl: item.coverUrl || getCover(title),
          audioUrl:
            item.audioUrl ||
            DEFAULT_SONGS.find((d) => d.title.toLowerCase() === title.toLowerCase())?.audioUrl ||
            media(`${title}.mp3`),
          durationSeconds: item.durationSeconds || 180,
        };
      });

      audioTracks = [...songs];
      renderTrendingList();
      console.log(`[Meeoww] Loaded ${songs.length} songs from Database API.`);
      return;
    }
  } catch (error) {
    console.warn('[Meeoww] API offline or error. Using local fallback songs:', error.message);
  }

  // Fallback to local default songs if API unavailable
  songs = [...DEFAULT_SONGS];
  audioTracks = [...DEFAULT_SONGS];
  renderTrendingList();
}

// Search Results with Database API & Fallback
async function showSearchResults(query) {
  const trimmed = query.trim();
  let matches = [];

  try {
    const res = await fetch(`/api/songs?q=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        matches = json.data.map((item) => ({
          ...item,
          coverUrl: item.coverUrl || getCover(item.title),
          audioUrl:
            item.audioUrl ||
            DEFAULT_SONGS.find((d) => d.title.toLowerCase() === item.title.toLowerCase())?.audioUrl ||
            media(`${item.title}.mp3`),
        }));
      }
    }
  } catch {
    // Local fallback search
    const val = trimmed.toLowerCase();
    matches = songs.filter((s) => `${s.title} ${s.artist} ${s.genre}`.toLowerCase().includes(val));
  }

  if (matches.length === 0) {
    const val = trimmed.toLowerCase();
    matches = songs.filter((s) => `${s.title} ${s.artist} ${s.genre}`.toLowerCase().includes(val));
  }

  const chosen = matches[0] || songs[0];
  $('#resultList').innerHTML = renderResultFeature(chosen);
  paintIcons();
  $('#resultInput').value = query;
  show('resultsView');
}

// Search Suggestions Handling
function renderSuggestions(query) {
  const host = $('#searchSuggestions');
  if (!host) return;
  const value = query.trim().toLowerCase();
  if (!value) {
    host.innerHTML = '';
    return;
  }

  const matches = songs
    .filter((song) => `${song.title} ${song.artist}`.toLowerCase().includes(value))
    .slice(0, 5);

  host.innerHTML = matches
    .map(
      (song) => `
      <button type="button" class="suggestion-row" data-query="${song.title}">
        <span>${icon('search')}</span>
        <span>
          <strong>${song.title}</strong>
          <small>${song.artist}</small>
        </span>
      </button>
    `
    )
    .join('');
}

// View Navigation Management
function isAuth(id) {
  return ['welcomeView', 'loginView', 'signupView'].includes(id);
}

function show(id) {
  const view = document.getElementById(id);
  if (!view) return;

  document.querySelectorAll('.view, .auth-view').forEach((item) => {
    item.classList.toggle('active', item.id === id);
  });

  $('.bottom-nav').classList.toggle('visible', !isAuth(id));
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.view === id);
  });

  // Profile View User Data sync
  if (id === 'profileView') {
    syncProfileView();
  }
}

// Sync Profile Info from localStorage
function syncProfileView() {
  const userJson = localStorage.getItem('meeoww_user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user.displayName) $('#profileName').textContent = user.displayName;
      if (user.email) $('#profileEmail').textContent = user.email;
    } catch {
      // ignore parse error
    }
  }
}

// Toast Notifications
function toast(message) {
  let element = $('.toast');
  if (!element) {
    element = document.createElement('div');
    element.className = 'toast';
    document.body.appendChild(element);
  }
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => element.classList.remove('visible'), 2400);
}

function authError(form, message) {
  let element = form.querySelector('.form-message');
  if (!element) {
    element = document.createElement('p');
    element.className = 'form-message';
    form.insertBefore(element, form.firstChild);
  }
  element.textContent = message;
}

async function readApiResponse(response) {
  const text = await response.text();
  if (!text) return { error: `Server tidak mengirim respons (HTTP ${response.status})` };
  try {
    return JSON.parse(text);
  } catch {
    return { error: `Respons server tidak valid (HTTP ${response.status})` };
  }
}

function setLoading(button, isLoading, label) {
  button.disabled = isLoading;
  button.textContent = isLoading ? 'Loading...' : label;
}

// Paint UI Icons Across the App
function paintIcons() {
  // Navigation & Topbars
  document.querySelectorAll('.search-icon').forEach((el) => (el.innerHTML = icon('search')));
  document.querySelectorAll('.back-button').forEach((el) => (el.innerHTML = icon('arrow')));
  document.querySelectorAll('.topbar .icon-button').forEach((el) => (el.innerHTML = icon('more')));
  document.querySelectorAll('.hero-play-btn').forEach((el) => (el.innerHTML = icon('play')));

  // Brand Bell
  const bell = $('.notification-btn .icon-bell');
  if (bell) bell.innerHTML = icon('bell');

  // Auth Inputs
  const userIcons = document.querySelectorAll('.auth-input .input-icon:not(.painted)');
  userIcons.forEach((el) => {
    const text = el.textContent.trim().toLowerCase();
    el.innerHTML = icon(text === 'user' ? 'user' : 'lock');
    el.classList.add('painted');
  });

  // Passwords
  document.querySelectorAll('.toggle-password').forEach((el) => (el.innerHTML = icon('eye')));

  // Social Sign In
  const googleBtn = $('.google-btn .social-icon');
  if (googleBtn) googleBtn.innerHTML = icon('google');
  const appleBtn = $('.apple-btn .social-icon');
  if (appleBtn) appleBtn.innerHTML = icon('apple');
  const fbBtn = $('.facebook-btn .social-icon');
  if (fbBtn) fbBtn.innerHTML = icon('facebook');
  const twitterBtn = $('.twitter-btn .social-icon');
  if (twitterBtn) twitterBtn.innerHTML = icon('twitter');

  // Player Controls Bar
  const ctrlShuffle = $('#ctrlShuffle');
  if (ctrlShuffle) ctrlShuffle.innerHTML = icon('shuffle');
  const ctrlPrev = $('#ctrlPrev');
  if (ctrlPrev) ctrlPrev.innerHTML = icon('prev');
  const ctrlPause = $('#pauseButton');
  if (ctrlPause) ctrlPause.innerHTML = icon(audioPlayer && !audioPlayer.paused ? 'pause' : 'play');
  const ctrlNext = $('#ctrlNext');
  if (ctrlNext) ctrlNext.innerHTML = icon('next');
  const ctrlRepeat = $('#ctrlRepeat');
  if (ctrlRepeat) ctrlRepeat.innerHTML = icon('repeat');

  // Like Button
  updateLikeButton();

  // Lyrics Peek & Mini Player
  const lyricsIcon = $('.lyrics-peek-pill .lyrics-icon');
  if (lyricsIcon) lyricsIcon.innerHTML = icon('lyrics');

  const miniPause = $('#miniPauseBtn');
  if (miniPause) miniPause.innerHTML = icon(audioPlayer && !audioPlayer.paused ? 'pause' : 'play');
  const miniNext = $('#miniNextBtn');
  if (miniNext) miniNext.innerHTML = icon('next');

  // Library & Profile Icons
  const heartArt = $('.liked-heart-art');
  if (heartArt) heartArt.innerHTML = icon('heartFill');
  const likedPlay = $('.liked-play-btn');
  if (likedPlay) likedPlay.innerHTML = icon('play');

  const profileAvatar = $('.profile-avatar');
  if (profileAvatar) profileAvatar.innerHTML = icon('cat');

  // Profile Settings Menu
  const menuIcons = document.querySelectorAll('.menu-icon');
  if (menuIcons[0]) menuIcons[0].innerHTML = icon('volume');
  if (menuIcons[1]) menuIcons[1].innerHTML = icon('offline');
  if (menuIcons[2]) menuIcons[2].innerHTML = icon('theme');

  // Bottom Navigation Bar
  const navMap = ['home', 'search', 'library', 'profile'];
  document.querySelectorAll('.bottom-nav .nav-item').forEach((item, index) => {
    const iconSpan = item.querySelector('.nav-icon');
    if (iconSpan) iconSpan.innerHTML = icon(navMap[index]);
  });

  // Volume Icon
  const volIcon = $('#volumeMuteBtn .volume-icon');
  if (volIcon) {
    volIcon.innerHTML = icon(audioPlayer && audioPlayer.muted ? 'volumeMute' : 'volume');
  }
}

function updateLikeButton() {
  const currentTrack = audioTracks[audioIndex];
  const likeBtn = $('#playerLikeBtn');
  if (!likeBtn || !currentTrack) return;

  const isLiked = likedTracks.has(currentTrack.title);
  likeBtn.classList.toggle('liked', isLiked);
  const iconSpan = likeBtn.querySelector('.like-icon');
  if (iconSpan) iconSpan.innerHTML = icon(isLiked ? 'heartFill' : 'heart');

  const likedSmall = $('.liked-info small');
  if (likedSmall) {
    likedSmall.textContent = `${likedTracks.size} Lagu Tersimpan`;
  }
}

// Clear Search Buttons
document.querySelectorAll('.clear-search').forEach((button) => {
  button.innerHTML = icon('close');
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const searchInput = $('#searchInput');
    const resultInput = $('#resultInput');
    if (searchInput) searchInput.value = '';
    if (resultInput) resultInput.value = '';
    const suggestions = $('#searchSuggestions');
    if (suggestions) suggestions.innerHTML = '';
    if (button.closest('#resultsView')) show('searchView');
    setTimeout(() => searchInput?.focus(), 0);
  });
});

// Search input keydown handlers
function submitSearchOnEnter(event) {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  const query = event.currentTarget.value.trim();
  if (query.length > 0) showSearchResults(query);
}

$('#searchInput').addEventListener('input', (event) => renderSuggestions(event.target.value));
$('#searchInput').addEventListener('keydown', submitSearchOnEnter);
$('#resultInput').addEventListener('input', (event) => showSearchResults(event.target.value));
$('#resultInput').addEventListener('keydown', submitSearchOnEnter);

// Global Enter Key fallback
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  const target = event.target;
  if (target && ['searchInput', 'resultInput'].includes(target.id)) {
    event.preventDefault();
    const query = target.value.trim();
    if (query) showSearchResults(query);
  }
});

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach((button) =>
  button.addEventListener('click', () => {
    const input = button.parentElement.querySelector('input');
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    button.innerHTML = icon(visible ? 'eyeOff' : 'eye');
  })
);

// Global Click Event Handler
document.addEventListener('click', (event) => {
  // 1. View Navigation by [data-view]
  const viewTarget = event.target.closest('[data-view]');
  if (viewTarget) {
    event.preventDefault();
    show(viewTarget.dataset.view);
    return;
  }

  // 2. Play song row or result row
  const song = event.target.closest('.song-row, .result-row');
  if (song && !event.target.closest('button')) {
    selectAudioTrack(song.dataset.trackTitle, true);
    show('playerView');
    return;
  }

  // 3. Play hero card
  const hero = event.target.closest('.hero-card');
  if (hero) {
    selectAudioTrack(hero.dataset.trackTitle, true);
    show('playerView');
    return;
  }

  // 4. Click search suggestion
  const suggestion = event.target.closest('.suggestion-row');
  if (suggestion) {
    $('#searchInput').value = suggestion.dataset.query;
    showSearchResults(suggestion.dataset.query);
    return;
  }

  // 5. Result Feature Card actions
  const result = event.target.closest('.result-feature');
  if (
    result &&
    (event.target.closest('.result-play') ||
      event.target.closest('.result-cover') ||
      event.target.closest('.result-feature-copy'))
  ) {
    selectAudioTrack(result.dataset.trackTitle, true);
    show('playerView');
    return;
  }

  if (event.target.closest('.result-more')) {
    toast('Opsi lagu dibuka');
    return;
  }

  // 6. Like button in player
  if (event.target.closest('#playerLikeBtn')) {
    const currentTrack = audioTracks[audioIndex];
    if (currentTrack) {
      if (likedTracks.has(currentTrack.title)) {
        likedTracks.delete(currentTrack.title);
        toast('Dihapus dari Koleksi Disukai');
      } else {
        likedTracks.add(currentTrack.title);
        toast('Disimpan ke Koleksi Disukai ❤️');
      }
      updateLikeButton();
    }
    return;
  }

  // 7. Library Chips
  const chip = event.target.closest('.chip');
  if (chip) {
    document.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    toast(`Filter: ${chip.textContent.trim()}`);
    return;
  }

  // 8. Logout Button
  if (event.target.closest('#logoutButton')) {
    localStorage.removeItem('meeoww_user');
    toast('Berhasil keluar dari akun');
    setTimeout(() => show('loginView'), 400);
    return;
  }

  // 9. UI Toasts & Interactions
  if (event.target.closest('.song-menu')) {
    toast('Opsi lagu dibuka');
    return;
  }
  if (event.target.closest('.brand-row .icon-button')) {
    toast('Tidak ada notifikasi baru');
    return;
  }
  if (event.target.closest('.section-heading button')) {
    show('searchView');
    return;
  }
  if (event.target.closest('.genre')) {
    showSearchResults(event.target.closest('.genre').querySelector('span').textContent.trim());
    return;
  }
  if (event.target.closest('.form-options .text-link')) {
    authError($('#loginForm'), 'Fitur reset password akan segera hadir.');
    return;
  }
  if (event.target.closest('.social-btn')) {
    toast('Masuk via media sosial akan segera didukung');
    return;
  }
  if (event.target.closest('.topbar .icon-button')) {
    toast('Opsi tambahan dibuka');
    return;
  }
});

// Authentication: Login Form Submit
$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const button = form.querySelector('button[type=submit]');
  setLoading(button, true, 'Log in');

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await readApiResponse(response);
    if (!response.ok) throw new Error(result.error || 'Login gagal');

    localStorage.setItem('meeoww_user', JSON.stringify(result.user));
    toast('Login berhasil! Selamat datang');
    setTimeout(() => show('homeView'), 300);
  } catch (error) {
    authError(form, error.message);
  } finally {
    setLoading(button, false, 'Log In');
  }
});

// Authentication: Sign Up Form Submit
$('#signupForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));

  if (data.password !== data.confirmPassword) {
    authError(form, 'Konfirmasi password tidak cocok');
    return;
  }

  const button = form.querySelector('button[type=submit]');
  setLoading(button, true, 'Sign Up');

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await readApiResponse(response);
    if (!response.ok) throw new Error(result.error || 'Pendaftaran gagal');

    localStorage.setItem('meeoww_user', JSON.stringify(result.user));
    toast('Akun berhasil dibuat!');
    setTimeout(() => show('homeView'), 300);
  } catch (error) {
    authError(form, error.message);
  } finally {
    setLoading(button, false, 'Daftar Akun');
  }
});

// Carousel Component
const carousel = document.querySelector('[data-carousel]');
if (carousel) {
  const track = carousel.querySelector('.carousel-track');
  const slides = [...carousel.querySelectorAll('.carousel-slide')];
  const dots = [...carousel.querySelectorAll('.carousel-dot')];
  const previous = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  let index = 0;

  const update = (animate) => {
    track.style.transition = animate ? 'transform .35s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };

  const goTo = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    update(true);
  };

  previous?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    goTo(index - 1);
  });

  next?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    goTo(index + 1);
  });

  dots.forEach((dot, i) =>
    dot.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      goTo(i);
    })
  );

  update(false);
}

// Global Carousel Item Click Helper
window.playCarouselTrack = function (title, event) {
  event?.preventDefault();
  event?.stopPropagation();
  selectAudioTrack(title, true);
  show('playerView');
};

// ==========================================
// Web Audio Player State & Controls
// ==========================================
const audioPlayer = $('#audioPlayer');
const progressBar = $('#progressBar');
const currentTimeLabel = $('#currentTime');
const durationLabel = $('#duration');
const playerTitle = $('#playerTitle');
const playerArtist = $('#playerArtist');
const miniPlayerTitle = $('#miniPlayerTitle');
const miniPlayerArtist = $('#miniPlayerArtist');

let audioIndex = 0;
let repeatTrack = false;
let shuffleTracks = false;

function formatAudioTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${rest}`;
}

function renderAudioState() {
  const playing = !audioPlayer.paused;
  const pauseButton = $('#pauseButton');
  if (pauseButton) {
    pauseButton.innerHTML = icon(playing ? 'pause' : 'play');
    pauseButton.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }
  const miniPause = $('#miniPauseBtn');
  if (miniPause) {
    miniPause.innerHTML = icon(playing ? 'pause' : 'play');
  }

  // Mini player vinyl spin state
  const miniPlayer = $('.mini-player');
  if (miniPlayer) {
    miniPlayer.classList.toggle('playing', playing);
  }
}

// Update Dynamic Lyrics View
function updateLyricsView(track) {
  const title = track.title;
  const artist = track.artist;
  const cover = track.coverUrl || getCover(title);

  const lyricsCover = $('#lyricsCover');
  if (lyricsCover) lyricsCover.style.backgroundImage = `url('${cover}')`;

  const trackTitle = $('#lyricsTrackTitle');
  if (trackTitle) trackTitle.textContent = title;

  const trackArtist = $('#lyricsTrackArtist');
  if (trackArtist) trackArtist.textContent = artist;

  const lyricsBody = $('#lyricsBody');
  if (lyricsBody) {
    const key = title.toLowerCase();
    const lines = SONG_LYRICS[key] || [
      'Lirik lagu ini belum tersedia.',
      'Dengarkan alunan melodi indahnya!',
      '♪ ♫ ♬'
    ];

    lyricsBody.innerHTML = lines
      .map((line, i) => `<p class="lyrics-line${i === 1 ? ' active' : ''}">${line}</p>`)
      .join('');
  }
}

function loadAudioTrack(nextIndex, autoplay = false) {
  if (!audioTracks.length) return;
  audioIndex = (nextIndex + audioTracks.length) % audioTracks.length;
  const track = audioTracks[audioIndex];
  audioPlayer.src = track.audioUrl || media(`${track.title}.mp3`);
  audioPlayer.load();

  // Update Player Details
  playerTitle.textContent = track.title;
  playerArtist.textContent = track.artist;

  const albumLabel = $('#playerTopAlbum');
  if (albumLabel) albumLabel.textContent = track.album || 'Single';

  const playerArt = $('#playerArt');
  const trackCover = track.coverUrl || getCover(track.title);
  if (playerArt && trackCover) playerArt.style.backgroundImage = `url('${trackCover}')`;

  // Update Mini Player
  if (miniPlayerTitle) miniPlayerTitle.textContent = track.title;
  if (miniPlayerArtist) miniPlayerArtist.textContent = track.artist;
  const miniArt = $('#miniPlayerArt');
  if (miniArt && trackCover) miniArt.style.backgroundImage = `url('${trackCover}')`;

  // Update Lyrics
  updateLyricsView(track);

  // Update Like State
  updateLikeButton();

  // MediaSession API Integration (Lock Screen & Hardware Keys)
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || 'Meeoww Music',
      artwork: [{ src: trackCover, sizes: '512x512', type: 'image/jpeg' }],
    });

    navigator.mediaSession.setActionHandler('play', () => audioPlayer.play());
    navigator.mediaSession.setActionHandler('pause', () => audioPlayer.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime && audioPlayer.duration) {
        audioPlayer.currentTime = details.seekTime;
      }
    });
  }

  // Reset Progress
  progressBar.value = 0;
  currentTimeLabel.textContent = '0:00';
  durationLabel.textContent = formatAudioTime(track.durationSeconds || 0);

  if (autoplay) {
    audioPlayer.play().catch(() => toast('Gagal memutar audio otomatis. Tekan Play untuk memulai.'));
  }
}

function selectAudioTrack(title, autoplay = false) {
  const index = audioTracks.findIndex((track) => track.title.toLowerCase() === String(title || '').toLowerCase());
  loadAudioTrack(index < 0 ? 0 : index, autoplay);
}

function playNext() {
  if (!audioTracks.length) return;
  if (shuffleTracks) {
    const randomIndex = Math.floor(Math.random() * audioTracks.length);
    loadAudioTrack(randomIndex, true);
  } else {
    loadAudioTrack(audioIndex + 1, true);
  }
}

function playPrevious() {
  if (audioPlayer.currentTime > 3) {
    audioPlayer.currentTime = 0;
    return;
  }
  loadAudioTrack(audioIndex - 1, true);
}

function toggleAudio() {
  if (audioPlayer.paused) {
    audioPlayer.play().catch(() => toast('Tekan tombol Play untuk memutar'));
  } else {
    audioPlayer.pause();
  }
}

// Audio Player Event Listeners
if (audioPlayer) {
  audioPlayer.addEventListener('play', renderAudioState);
  audioPlayer.addEventListener('pause', renderAudioState);

  audioPlayer.addEventListener('loadedmetadata', () => {
    progressBar.max = audioPlayer.duration || 0;
    durationLabel.textContent = formatAudioTime(audioPlayer.duration);
  });

  audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
      progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;

      // Dynamic Lyrics Active Line Sync
      const lines = document.querySelectorAll('.lyrics-line');
      if (lines.length > 0) {
        const ratio = audioPlayer.currentTime / audioPlayer.duration;
        const activeIdx = Math.min(lines.length - 1, Math.floor(ratio * lines.length));
        lines.forEach((line, idx) => {
          line.classList.toggle('active', idx === activeIdx);
        });
      }
    }
    currentTimeLabel.textContent = formatAudioTime(audioPlayer.currentTime);
  });

  audioPlayer.addEventListener('ended', () => {
    if (repeatTrack) {
      audioPlayer.currentTime = 0;
      audioPlayer.play();
    } else {
      playNext();
    }
  });

  audioPlayer.addEventListener('error', () => toast('Gagal memuat file lagu audio'));

  progressBar.addEventListener('input', () => {
    if (audioPlayer.duration) {
      audioPlayer.currentTime = (Number(progressBar.value) / 100) * audioPlayer.duration;
    }
  });

  // Volume Bar & Mute Controls
  const volumeBar = $('#volumeBar');
  const volumeMuteBtn = $('#volumeMuteBtn');

  function updateVolumeIcon() {
    const volIcon = $('#volumeMuteBtn .volume-icon');
    if (volIcon) {
      volIcon.innerHTML = icon(audioPlayer.muted || audioPlayer.volume === 0 ? 'volumeMute' : 'volume');
    }
  }

  function toggleMute() {
    audioPlayer.muted = !audioPlayer.muted;
    if (volumeBar) {
      volumeBar.value = audioPlayer.muted ? 0 : audioPlayer.volume || 1;
    }
    updateVolumeIcon();
    toast(audioPlayer.muted ? 'Suara dinonaktifkan (Mute)' : 'Suara aktif');
  }

  if (volumeBar) {
    volumeBar.addEventListener('input', (e) => {
      audioPlayer.volume = Number(e.target.value);
      audioPlayer.muted = audioPlayer.volume === 0;
      updateVolumeIcon();
    });
  }

  if (volumeMuteBtn) {
    volumeMuteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMute();
    });
  }

  // Keyboard Shortcuts (Space: Play/Pause, ArrowLeft/Right: Seek 5s, M: Mute, L: Lyrics)
  document.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (['input', 'textarea'].includes(activeTag)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      toggleAudio();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      if (audioPlayer.duration) {
        audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
        toast('+5 detik');
      }
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
      toast('-5 detik');
    } else if (e.code === 'KeyM') {
      e.preventDefault();
      toggleMute();
    } else if (e.code === 'KeyL') {
      e.preventDefault();
      const isLyrics = $('#lyricsView').classList.contains('active');
      show(isLyrics ? 'playerView' : 'lyricsView');
    }
  });

  // Player controls
  $('#ctrlShuffle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    shuffleTracks = !shuffleTracks;
    $('#ctrlShuffle').classList.toggle('control-active', shuffleTracks);
    toast(shuffleTracks ? 'Acak lagu: Aktif' : 'Acak lagu: Nonaktif');
  });

  $('#ctrlPrev')?.addEventListener('click', (e) => {
    e.stopPropagation();
    playPrevious();
  });

  $('#pauseButton')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAudio();
  });

  $('#ctrlNext')?.addEventListener('click', (e) => {
    e.stopPropagation();
    playNext();
  });

  $('#ctrlRepeat')?.addEventListener('click', (e) => {
    e.stopPropagation();
    repeatTrack = !repeatTrack;
    $('#ctrlRepeat').classList.toggle('control-active', repeatTrack);
    toast(repeatTrack ? 'Ulangi lagu: Aktif' : 'Ulangi lagu: Nonaktif');
  });

  // Mini player controls
  $('#miniPauseBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAudio();
  });

  $('#miniNextBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    playNext();
  });
}

// Device Mode Switcher (Mobile vs Tablet/Desktop Mode)
const btnMobile = $('#btnModeMobile');
const btnTablet = $('#btnModeTablet');
const devContainer = $('#deviceContainer');

if (btnMobile && btnTablet && devContainer) {
  btnMobile.addEventListener('click', () => {
    devContainer.classList.remove('mode-tablet');
    btnMobile.classList.add('active');
    btnTablet.classList.remove('active');
    toast('Mode tampilan: Ponsel');
  });

  btnTablet.addEventListener('click', () => {
    devContainer.classList.add('mode-tablet');
    btnTablet.classList.add('active');
    btnMobile.classList.remove('active');
    toast('Mode tampilan: Tablet / Desktop');
  });
}

// Initialize Application
paintIcons();
loadSongsFromApi().then(() => {
  loadAudioTrack(0, false);
});

const savedUser = localStorage.getItem('meeoww_user');
show('welcomeView');
setTimeout(() => {
  if ($('#welcomeView').classList.contains('active')) {
    show(savedUser ? 'homeView' : 'loginView');
  }
}, 2400);
