const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'database');
fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'beathouse.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK(role IN ('admin','editor')),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS artists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  genre TEXT,
  short_bio TEXT,
  bio TEXT,
  stat_label TEXT,
  main_image TEXT,
  carousel_image TEXT,
  horizontal_image TEXT,
  main_focal_x REAL DEFAULT 50,
  main_focal_y REAL DEFAULT 20,
  carousel_focal_x REAL DEFAULT 50,
  carousel_focal_y REAL DEFAULT 20,
  spotify_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,
  apple_music_url TEXT,
  website_url TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft','published','hidden','archived')),
  show_in_roster INTEGER NOT NULL DEFAULT 1,
  show_in_carousel INTEGER NOT NULL DEFAULT 1,
  show_in_ticker INTEGER NOT NULL DEFAULT 1,
  roster_order INTEGER DEFAULT 0,
  carousel_order INTEGER DEFAULT 0,
  ticker_order INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS releases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL REFERENCES artists(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'single' CHECK(type IN ('single','ep','album','other')),
  genre TEXT,
  description TEXT,
  cover_image TEXT,
  cover_focal_x REAL DEFAULT 50,
  cover_focal_y REAL DEFAULT 50,
  release_date TEXT,
  publish_at TEXT,
  spotify_url TEXT,
  youtube_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  apple_music_url TEXT,
  show_spotify INTEGER DEFAULT 1,
  show_youtube INTEGER DEFAULT 1,
  show_instagram INTEGER DEFAULT 1,
  show_tiktok INTEGER DEFAULT 1,
  show_apple_music INTEGER DEFAULT 1,
  featured INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','hidden','archived')),
  sort_order INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  original_name TEXT,
  path TEXT NOT NULL,
  url TEXT NOT NULL,
  mimetype TEXT,
  size INTEGER,
  width INTEGER,
  height INTEGER,
  entity_type TEXT,
  entity_id INTEGER,
  field_name TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  created_by INTEGER REFERENCES users(id)
);
`);

console.log('✓ Tables created');

// Seed admin user (idempotent)
const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('beathouse_admin');
if (!existingAdmin) {
  const hash = bcrypt.hashSync('BTH!2026_Panel#7Kx9', 12);
  db.prepare(`INSERT INTO users (username, password_hash, role, active) VALUES (?, ?, 'admin', 1)`).run('beathouse_admin', hash);
  console.log('✓ Admin user created (username: beathouse_admin)');
} else {
  console.log('→ Admin user already exists, skipping');
}

// Seed artists
const existingArtists = db.prepare('SELECT COUNT(*) as c FROM artists').get();
if (existingArtists.c === 0) {
  const insertArtist = db.prepare(`
    INSERT INTO artists (name, slug, genre, short_bio, stat_label, main_image, main_focal_x, main_focal_y,
      spotify_url, instagram_url, youtube_url, tiktok_url,
      status, show_in_roster, show_in_carousel, show_in_ticker,
      roster_order, carousel_order, ticker_order)
    VALUES (@name, @slug, @genre, @short_bio, @stat_label, @main_image, @main_focal_x, @main_focal_y,
      @spotify_url, @instagram_url, @youtube_url, @tiktok_url,
      'published', 1, 1, 1, @roster_order, @carousel_order, @ticker_order)
  `);

  const artists = [
    {
      name: 'Tomas Gimenez', slug: 'tomas-gimenez', genre: 'Pop', stat_label: 'La Voz Argentina',
      short_bio: 'Voz potente y letras directas que conectan con una generación. Uno de los artistas más prometedores del pop argentino.',
      main_image: 'imagenes/foto-tomas-gimenez.jpg', main_focal_x: 50, main_focal_y: 20,
      spotify_url: 'https://open.spotify.com/artist/5fMwlAHh96WMf9t8dwtyKK',
      instagram_url: 'https://instagram.com/tomasgimeneza', youtube_url: null, tiktok_url: null,
      roster_order: 1, carousel_order: 1, ticker_order: 1
    },
    {
      name: 'Crash', slug: 'crash', genre: 'Pop', stat_label: 'Netflix · Go!',
      short_bio: "Actriz y cantante, protagonizó 'Go! Vive a tu manera' en Netflix. Pop con identidad propia y energía sin límites.",
      main_image: 'imagenes/foto-crash.jpeg', main_focal_x: 50, main_focal_y: 20,
      spotify_url: 'https://open.spotify.com/artist/5AIFs6bO6XZLbfeTplCHkL',
      instagram_url: 'https://instagram.com/crash.music',
      youtube_url: 'https://www.youtube.com/@crashmusic',
      tiktok_url: 'https://www.tiktok.com/@crash.music',
      roster_order: 2, carousel_order: 2, ticker_order: 2
    },
    {
      name: 'Maga', slug: 'maga', genre: 'Pop', stat_label: 'Pop íntimo contemporáneo',
      short_bio: 'Canciones íntimas con producción contemporánea. Conecta emocionalmente con una nueva generación que cruza fronteras.',
      main_image: 'imagenes/foto-maga.jpg', main_focal_x: 50, main_focal_y: 40,
      spotify_url: null, instagram_url: null, youtube_url: null, tiktok_url: null,
      roster_order: 3, carousel_order: 3, ticker_order: 3
    },
    {
      name: 'Lucas Barros', slug: 'lucas-barros', genre: 'Pop / R&B', stat_label: '531K seguidores',
      short_bio: 'Groove, melodía y presencia escénica que se siente desde el primer acorde. Participó en La Voz Argentina 2025.',
      main_image: 'imagenes/foto-lucas-barros.jpeg', main_focal_x: 50, main_focal_y: 20,
      spotify_url: 'https://open.spotify.com/artist/6xfNuiMrfZbMrq0JI0xMZU',
      instagram_url: 'https://instagram.com/lucasbarrosok', youtube_url: null, tiktok_url: null,
      roster_order: 4, carousel_order: 4, ticker_order: 4
    },
    {
      name: 'Karen Quiroga', slug: 'karen-quiroga', genre: 'Pop', stat_label: 'Córdoba · Buenos Aires',
      short_bio: 'Cordobesa radicada en Buenos Aires. Fusiona pop, folklore y ritmos alternativos con autenticidad y visión clara.',
      main_image: 'imagenes/foto-Karen Quiroga.jpg', main_focal_x: 50, main_focal_y: 20,
      spotify_url: 'https://open.spotify.com/artist/3Ho3YtSse8d6srqI1Zgo4L',
      instagram_url: 'https://instagram.com/karen.quirogaa', youtube_url: null, tiktok_url: null,
      roster_order: 5, carousel_order: 5, ticker_order: 5
    },
    {
      name: 'Beruti', slug: 'beruti', genre: 'Pop', stat_label: '+10M de streams',
      short_bio: 'Dúo de hermanos gemelos con más de 10M de streams. Giras por Latinoamérica y Europa. Pop con alma y sustancia.',
      main_image: 'imagenes/foto-beruti.jpg', main_focal_x: 50, main_focal_y: 20,
      spotify_url: 'https://open.spotify.com/artist/4Ozcco9RkNmJtg7qkCy8zI',
      instagram_url: 'https://instagram.com/beruti.arg', youtube_url: null, tiktok_url: null,
      roster_order: 6, carousel_order: 6, ticker_order: 6
    },
    {
      name: 'Silvestre', slug: 'silvestre', genre: 'Folklore', stat_label: 'Salta · Argentina',
      short_bio: 'Décadas en el folklore argentino con raíces ancestrales y sonoridad contemporánea. Territorio, identidad y voz propia.',
      main_image: 'imagenes/foto-silvestre-fondo.png', main_focal_x: 50, main_focal_y: 20,
      spotify_url: 'https://open.spotify.com/artist/2xVUJLo9DaJWBlAqQqmUNY',
      instagram_url: 'https://instagram.com/silvestrecantante', youtube_url: null, tiktok_url: null,
      roster_order: 7, carousel_order: 7, ticker_order: 7
    },
    {
      name: 'Ana Paula', slug: 'ana-paula', genre: 'Pop', stat_label: 'Netflix · Go!',
      short_bio: "Conocida por 'Go! Vive a tu manera' en Netflix. En 2025 lanzó 'No pasa nada'. Voz cálida y presencia que no pasa desapercibida.",
      main_image: 'imagenes/foto-anapaula.jpg', main_focal_x: 50, main_focal_y: 20,
      spotify_url: 'https://open.spotify.com/artist/5AHBeq2Oxxi9lJgeyYNskU',
      instagram_url: null, youtube_url: null, tiktok_url: null,
      roster_order: 8, carousel_order: 8, ticker_order: 8
    }
  ];

  const seedArtists = db.transaction((list) => {
    for (const a of list) insertArtist.run(a);
  });
  seedArtists(artists);
  console.log('✓ 8 artists seeded');
} else {
  console.log(`→ Artists already seeded (${existingArtists.c} found), skipping`);
}

// Seed release
const existingReleases = db.prepare('SELECT COUNT(*) as c FROM releases').get();
if (existingReleases.c === 0) {
  const crash = db.prepare("SELECT id FROM artists WHERE slug = 'crash'").get();
  if (crash) {
    db.prepare(`
      INSERT INTO releases (artist_id, title, slug, type, genre, description, cover_image,
        release_date, publish_at, spotify_url, youtube_url, instagram_url, tiktok_url,
        show_spotify, show_youtube, show_instagram, show_tiktok, show_apple_music,
        featured, status, sort_order)
      VALUES (?, 'Heart Roto', 'heart-roto', 'single', 'Pop',
        'Una canción que habla de lo que queda cuando algo se rompe — y de lo que nace después.',
        'imagenes/arte de tapa-crash.jpeg',
        '2026-06-01', '2026-06-01',
        'https://open.spotify.com/artist/5AIFs6bO6XZLbfeTplCHkL',
        'https://www.youtube.com/@crashmusic',
        'https://instagram.com/crash.music',
        'https://www.tiktok.com/@crash.music',
        1, 1, 1, 1, 0, 1, 'published', 1)
    `).run(crash.id);
    console.log('✓ 1 release seeded (Heart Roto by Crash)');
  }
} else {
  console.log(`→ Releases already seeded (${existingReleases.c} found), skipping`);
}

db.close();
console.log('\n✓ Setup complete.');
console.log('  Run: node server.js');
console.log('  Admin: http://localhost:3000/admin');
console.log('  Login: beathouse_admin / BTH!2026_Panel#7Kx9');
