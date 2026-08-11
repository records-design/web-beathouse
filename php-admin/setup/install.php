<?php
// Security: require secret token
if (!isset($_GET['token']) || $_GET['token'] !== 'BTH_INSTALL_2026') {
    http_response_code(403);
    die('Acceso denegado. Use ?token=BTH_INSTALL_2026');
}

require_once __DIR__ . '/../../php-admin/includes/db.php';

echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>BeatHouse Install</title>
<style>
body{font-family:monospace;background:#111;color:#0f0;padding:2rem;}
p{margin:0.3rem 0;}
h1,h2{color:#e6007e;}
.warn{color:#f90;font-size:1.1rem;border:2px solid #f90;padding:1rem;margin-top:2rem;border-radius:6px;}
.ok{color:#0f0;} .err{color:#f44;}
</style></head><body>';
echo '<h1>BeatHouse — Instalación MySQL</h1>';

$pdo = getDB();

function msg($text) { echo "<p>$text</p>\n"; flush(); ob_flush(); }

// Create tables
$tables = [
'users' => "CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

'artists' => "CREATE TABLE IF NOT EXISTS artists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  genre VARCHAR(100),
  short_bio TEXT,
  bio TEXT,
  stat_label VARCHAR(255),
  main_image VARCHAR(500),
  carousel_image VARCHAR(500),
  horizontal_image VARCHAR(500),
  main_focal_x FLOAT DEFAULT 50,
  main_focal_y FLOAT DEFAULT 20,
  carousel_focal_x FLOAT DEFAULT 50,
  carousel_focal_y FLOAT DEFAULT 20,
  spotify_url VARCHAR(500),
  instagram_url VARCHAR(500),
  youtube_url VARCHAR(500),
  tiktok_url VARCHAR(500),
  soundcloud_url VARCHAR(500),
  apple_music_url VARCHAR(500),
  website_url VARCHAR(500),
  status ENUM('draft','published','hidden','archived') NOT NULL DEFAULT 'published',
  show_in_roster TINYINT(1) NOT NULL DEFAULT 1,
  show_in_carousel TINYINT(1) NOT NULL DEFAULT 1,
  show_in_ticker TINYINT(1) NOT NULL DEFAULT 1,
  roster_order INT DEFAULT 0,
  carousel_order INT DEFAULT 0,
  ticker_order INT DEFAULT 0,
  seo_title VARCHAR(255),
  seo_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  updated_by INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

'releases' => "CREATE TABLE IF NOT EXISTS releases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artist_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  type ENUM('single','ep','album','mixtape','compilation') DEFAULT 'single',
  genre VARCHAR(100),
  description TEXT,
  cover_image VARCHAR(500),
  cover_focal_x FLOAT DEFAULT 50,
  cover_focal_y FLOAT DEFAULT 50,
  release_date DATE,
  publish_at DATETIME,
  spotify_url VARCHAR(500),
  youtube_url VARCHAR(500),
  instagram_url VARCHAR(500),
  tiktok_url VARCHAR(500),
  soundcloud_url VARCHAR(500),
  bandcamp_url VARCHAR(500),
  apple_music_url VARCHAR(500),
  show_spotify TINYINT(1) DEFAULT 1,
  show_youtube TINYINT(1) DEFAULT 1,
  show_instagram TINYINT(1) DEFAULT 1,
  show_tiktok TINYINT(1) DEFAULT 1,
  show_apple_music TINYINT(1) DEFAULT 1,
  featured TINYINT(1) DEFAULT 0,
  status ENUM('draft','published','hidden','archived') NOT NULL DEFAULT 'draft',
  sort_order INT DEFAULT 0,
  seo_title VARCHAR(255),
  seo_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  updated_by INT,
  FOREIGN KEY (artist_id) REFERENCES artists(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

'media' => "CREATE TABLE IF NOT EXISTS media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  path VARCHAR(500) NOT NULL,
  url VARCHAR(500) NOT NULL,
  mimetype VARCHAR(100),
  size INT,
  width INT,
  height INT,
  entity_type VARCHAR(50),
  entity_id INT,
  field_name VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
];

echo '<h2>Tablas</h2>';
foreach ($tables as $name => $sql) {
    try {
        $pdo->exec($sql);
        msg('<span class="ok">✓ Tabla \'' . $name . '\' creada o ya existía.</span>');
    } catch (PDOException $e) {
        msg('<span class="err">✗ Error en tabla \'' . $name . '\': ' . htmlspecialchars($e->getMessage()) . '</span>');
    }
}

// Seed admin user
echo '<h2>Usuarios</h2>';
$existing = $pdo->query("SELECT COUNT(*) FROM users WHERE username = 'beathouse_admin'")->fetchColumn();
if (!$existing) {
    $hash = password_hash('BTH!2026_Panel#7Kx9', PASSWORD_BCRYPT, ['cost' => 12]);
    $pdo->prepare("INSERT INTO users (username, password_hash, role, active) VALUES (?, ?, 'admin', 1)")
        ->execute(['beathouse_admin', $hash]);
    msg('<span class="ok">✓ Usuario \'beathouse_admin\' creado. Contraseña: BTH!2026_Panel#7Kx9</span>');
} else {
    msg('— Usuario \'beathouse_admin\' ya existe.');
}

// Seed artists
echo '<h2>Artistas</h2>';
$artists = [
    ['Tomas Gimenez','tomas-gimenez','Pop','La Voz Argentina','Voz potente y letras directas que conectan con una generación. Uno de los artistas más prometedores del pop argentino.','imagenes/foto-tomas-gimenez.jpg',50,20,'https://open.spotify.com/artist/5fMwlAHh96WMf9t8dwtyKK','https://instagram.com/tomasgimeneza',null,null,null,1,1,1],
    ['Crash','crash','Pop','Netflix · Go!','Actriz y cantante, protagonizó \'Go! Vive a tu manera\' en Netflix. Pop con identidad propia y energía sin límites.','imagenes/foto-crash.jpeg',50,20,'https://open.spotify.com/artist/5AIFs6bO6XZLbfeTplCHkL','https://instagram.com/crash.music','https://www.youtube.com/@crashmusic','https://www.tiktok.com/@crash.music',null,2,2,2],
    ['Maga','maga','Pop','Pop íntimo contemporáneo','Canciones íntimas con producción contemporánea. Conecta emocionalmente con una nueva generación que cruza fronteras.','imagenes/foto-maga.jpg',50,40,null,null,null,null,null,3,3,3],
    ['Lucas Barros','lucas-barros','Pop / R&B','531K seguidores','Groove, melodía y presencia escénica que se siente desde el primer acorde. Participó en La Voz Argentina 2025.','imagenes/foto-lucas-barros.jpeg',50,20,'https://open.spotify.com/artist/6xfNuiMrfZbMrq0JI0xMZU','https://instagram.com/lucasbarrosok',null,null,null,4,4,4],
    ['Karen Quiroga','karen-quiroga','Pop','Córdoba · Buenos Aires','Cordobesa radicada en Buenos Aires. Fusiona pop, folklore y ritmos alternativos con autenticidad y visión clara.','imagenes/foto-Karen Quiroga.jpg',50,20,'https://open.spotify.com/artist/3Ho3YtSse8d6srqI1Zgo4L','https://instagram.com/karen.quirogaa',null,null,null,5,5,5],
    ['Beruti','beruti','Pop','+10M de streams','Dúo de hermanos gemelos con más de 10M de streams. Giras por Latinoamérica y Europa. Pop con alma y sustancia.','imagenes/foto-beruti.jpg',50,20,'https://open.spotify.com/artist/4Ozcco9RkNmJtg7qkCy8zI','https://instagram.com/beruti.arg',null,null,null,6,6,6],
    ['Silvestre','silvestre','Folklore','Salta · Argentina','Décadas en el folklore argentino con raíces ancestrales y sonoridad contemporánea. Territorio, identidad y voz propia.','imagenes/foto-silvestre-fondo.png',50,20,'https://open.spotify.com/artist/2xVUJLo9DaJWBlAqQqmUNY','https://instagram.com/silvestrecantante',null,null,null,7,7,7],
    ['Ana Paula','ana-paula','Pop','Netflix · Go!','Conocida por \'Go! Vive a tu manera\' en Netflix. En 2025 lanzó \'No pasa nada\'. Voz cálida y presencia que no pasa desapercibida.','imagenes/foto-anapaula.jpg',50,20,'https://open.spotify.com/artist/5AHBeq2Oxxi9lJgeyYNskU',null,null,null,null,8,8,8],
];

$stmtArtist = $pdo->prepare("INSERT INTO artists (name,slug,genre,stat_label,short_bio,main_image,main_focal_x,main_focal_y,spotify_url,instagram_url,youtube_url,tiktok_url,apple_music_url,roster_order,carousel_order,ticker_order,status,show_in_roster,show_in_carousel,show_in_ticker) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'published',1,1,1)");

foreach ($artists as $a) {
    $chk = $pdo->prepare("SELECT COUNT(*) FROM artists WHERE slug = ?");
    $chk->execute([$a[1]]);
    if (!$chk->fetchColumn()) {
        $stmtArtist->execute($a);
        msg('<span class="ok">✓ Artista \'' . $a[0] . '\' creado.</span>');
    } else {
        msg('— Artista \'' . $a[0] . '\' ya existe.');
    }
}

// Seed release for Crash
echo '<h2>Lanzamientos</h2>';
$crashId = $pdo->prepare("SELECT id FROM artists WHERE slug = 'crash'");
$crashId->execute();
$crash = $crashId->fetchColumn();

if ($crash) {
    $existingRelease = $pdo->prepare("SELECT COUNT(*) FROM releases WHERE slug = 'heart-roto'");
    $existingRelease->execute();
    if (!$existingRelease->fetchColumn()) {
        $pdo->prepare("INSERT INTO releases (artist_id,title,slug,type,genre,description,cover_image,release_date,publish_at,spotify_url,instagram_url,youtube_url,tiktok_url,show_spotify,show_youtube,show_instagram,show_tiktok,show_apple_music,featured,status,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1,1,1,1,0,1,'published',1)")
            ->execute([$crash,'Heart Roto','heart-roto','single','Pop','Una canción que habla de lo que queda cuando algo se rompe — y de lo que nace después.','imagenes/arte de tapa-crash.jpeg','2026-06-01','2026-06-01 00:00:00','https://open.spotify.com/artist/5AIFs6bO6XZLbfeTplCHkL','https://instagram.com/crash.music','https://www.youtube.com/@crashmusic','https://www.tiktok.com/@crash.music']);
        msg('<span class="ok">✓ Release \'Heart Roto\' creado.</span>');
    } else {
        msg('— Release \'Heart Roto\' ya existe.');
    }
}

echo '<div class="warn">⚠️ IMPORTANTE: Eliminá o renombrá este archivo (setup/install.php) del servidor una vez ejecutado exitosamente. No lo dejés accesible públicamente.</div>';
echo '<p style="margin-top:2rem;color:#aaa;">Para acceder al panel: <a href="/php-admin/login.php" style="color:#e6007e">/php-admin/login.php</a><br>Usuario: <strong>beathouse_admin</strong> · Contraseña: <strong>BTH!2026_Panel#7Kx9</strong></p>';
echo '</body></html>';
