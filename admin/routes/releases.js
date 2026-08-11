const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const db = require('../../database/db');
const { requireAuth } = require('../middleware/auth');
const releasesListPage = require('../views/releases-list');
const releaseFormPage = require('../views/release-form');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg','image/png','image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de archivo no permitido'));
  }
});

function getUser(req) {
  return { id: req.session.userId, username: req.session.username, role: req.session.role };
}

function getArtists() {
  return db.prepare("SELECT id, name FROM artists WHERE status != 'archived' ORDER BY name").all();
}

async function processCoverImage(buffer, slug) {
  const dir = path.join(__dirname, '../../uploads/releases', slug);
  fs.mkdirSync(dir, { recursive: true });
  await sharp(buffer).resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toFile(path.join(dir, 'large.webp'));
  await sharp(buffer).resize(600, 600, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(dir, 'medium.webp'));
  await sharp(buffer).resize(200, 200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 75 }).toFile(path.join(dir, 'thumb.webp'));
  return `uploads/releases/${slug}/large.webp`;
}

function boolField(body, name, def = true) {
  if (body[name] !== undefined) return body[name] ? 1 : 0;
  return def ? 1 : 0;
}

// GET / — list
router.get('/', requireAuth, (req, res) => {
  const releases = db.prepare(`
    SELECT r.*, a.name as artist_name FROM releases r
    JOIN artists a ON r.artist_id = a.id
    WHERE r.status != 'archived'
    ORDER BY r.featured DESC, r.sort_order ASC, r.release_date DESC
  `).all();
  res.send(releasesListPage(releases, getUser(req)));
});

// GET /new
router.get('/new', requireAuth, (req, res) => {
  res.send(releaseFormPage({}, getArtists(), getUser(req)));
});

// POST /new
router.post('/new', requireAuth, upload.single('cover_image_file'), async (req, res) => {
  const user = getUser(req);
  const { title, slug, artist_id, type, genre, description, release_date, publish_at, sort_order, status, seo_title, seo_description, spotify_url, youtube_url, instagram_url, tiktok_url, apple_music_url } = req.body;
  const featured = req.body.featured ? 1 : 0;
  const show_spotify = boolField(req.body, 'show_spotify');
  const show_youtube = boolField(req.body, 'show_youtube');
  const show_instagram = boolField(req.body, 'show_instagram');
  const show_tiktok = boolField(req.body, 'show_tiktok');
  const show_apple_music = boolField(req.body, 'show_apple_music');

  if (!title || !slug || !artist_id) return res.send(releaseFormPage(req.body, getArtists(), user, 'Título, slug y artista son requeridos.'));

  const existing = db.prepare('SELECT id FROM releases WHERE slug = ?').get(slug);
  if (existing) return res.send(releaseFormPage(req.body, getArtists(), user, 'El slug ya existe.'));

  let cover_image = null;
  try {
    if (req.file) cover_image = await processCoverImage(req.file.buffer, slug);
  } catch (e) {
    return res.send(releaseFormPage(req.body, getArtists(), user, 'Error procesando imagen: ' + e.message));
  }

  db.prepare(`
    INSERT INTO releases (artist_id, title, slug, type, genre, description, cover_image,
      release_date, publish_at, spotify_url, youtube_url, instagram_url, tiktok_url, apple_music_url,
      show_spotify, show_youtube, show_instagram, show_tiktok, show_apple_music,
      featured, status, sort_order, seo_title, seo_description, created_by, updated_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(parseInt(artist_id), title, slug, type||'single', genre||null, description||null, cover_image,
    release_date||null, publish_at||null, spotify_url||null, youtube_url||null, instagram_url||null, tiktok_url||null, apple_music_url||null,
    show_spotify, show_youtube, show_instagram, show_tiktok, show_apple_music,
    featured, status||'draft', parseInt(sort_order)||0, seo_title||null, seo_description||null, user.id, user.id);

  res.redirect('/admin/releases');
});

// GET /:id — edit form
router.get('/:id', requireAuth, (req, res) => {
  const release = db.prepare('SELECT * FROM releases WHERE id = ?').get(req.params.id);
  if (!release) return res.status(404).send('Lanzamiento no encontrado');
  res.send(releaseFormPage(release, getArtists(), getUser(req)));
});

// POST /:id — update
router.post('/:id', requireAuth, upload.single('cover_image_file'), async (req, res) => {
  const user = getUser(req);
  const release = db.prepare('SELECT * FROM releases WHERE id = ?').get(req.params.id);
  if (!release) return res.status(404).send('Lanzamiento no encontrado');

  const { title, slug, artist_id, type, genre, description, release_date, publish_at, sort_order, status, seo_title, seo_description, spotify_url, youtube_url, instagram_url, tiktok_url, apple_music_url } = req.body;
  const featured = req.body.featured ? 1 : 0;
  const show_spotify = boolField(req.body, 'show_spotify');
  const show_youtube = boolField(req.body, 'show_youtube');
  const show_instagram = boolField(req.body, 'show_instagram');
  const show_tiktok = boolField(req.body, 'show_tiktok');
  const show_apple_music = boolField(req.body, 'show_apple_music');

  if (!title || !slug || !artist_id) return res.send(releaseFormPage({ ...release, ...req.body }, getArtists(), user, 'Título, slug y artista son requeridos.'));

  const existing = db.prepare('SELECT id FROM releases WHERE slug = ? AND id != ?').get(slug, release.id);
  if (existing) return res.send(releaseFormPage({ ...release, ...req.body }, getArtists(), user, 'El slug ya existe.'));

  let cover_image = release.cover_image;
  try {
    if (req.file) cover_image = await processCoverImage(req.file.buffer, slug);
  } catch (e) {
    return res.send(releaseFormPage({ ...release, ...req.body }, getArtists(), user, 'Error procesando imagen: ' + e.message));
  }

  db.prepare(`
    UPDATE releases SET artist_id=?, title=?, slug=?, type=?, genre=?, description=?, cover_image=?,
      release_date=?, publish_at=?, spotify_url=?, youtube_url=?, instagram_url=?, tiktok_url=?, apple_music_url=?,
      show_spotify=?, show_youtube=?, show_instagram=?, show_tiktok=?, show_apple_music=?,
      featured=?, status=?, sort_order=?, seo_title=?, seo_description=?,
      updated_by=?, updated_at=datetime('now')
    WHERE id=?
  `).run(parseInt(artist_id), title, slug, type||'single', genre||null, description||null, cover_image,
    release_date||null, publish_at||null, spotify_url||null, youtube_url||null, instagram_url||null, tiktok_url||null, apple_music_url||null,
    show_spotify, show_youtube, show_instagram, show_tiktok, show_apple_music,
    featured, status||'draft', parseInt(sort_order)||0, seo_title||null, seo_description||null, user.id, release.id);

  res.redirect('/admin/releases');
});

// POST /:id/duplicate
router.post('/:id/duplicate', requireAuth, (req, res) => {
  const user = getUser(req);
  const r = db.prepare('SELECT * FROM releases WHERE id = ?').get(req.params.id);
  if (!r) return res.redirect('/admin/releases');
  const newSlug = r.slug + '-copy-' + Date.now();
  db.prepare(`
    INSERT INTO releases (artist_id, title, slug, type, genre, description, cover_image,
      release_date, spotify_url, youtube_url, instagram_url, tiktok_url, apple_music_url,
      show_spotify, show_youtube, show_instagram, show_tiktok, show_apple_music,
      featured, status, sort_order, created_by, updated_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(r.artist_id, r.title + ' (copia)', newSlug, r.type, r.genre, r.description, r.cover_image,
    r.release_date, r.spotify_url, r.youtube_url, r.instagram_url, r.tiktok_url, r.apple_music_url,
    r.show_spotify, r.show_youtube, r.show_instagram, r.show_tiktok, r.show_apple_music,
    0, 'draft', r.sort_order, user.id, user.id);
  res.redirect('/admin/releases');
});

// POST /:id/archive
router.post('/:id/archive', requireAuth, (req, res) => {
  db.prepare("UPDATE releases SET status='archived', updated_at=datetime('now') WHERE id=?").run(req.params.id);
  res.redirect('/admin/releases');
});

// POST /:id/delete
router.post('/:id/delete', requireAuth, (req, res) => {
  db.prepare('DELETE FROM releases WHERE id=?').run(req.params.id);
  res.redirect('/admin/releases');
});

module.exports = router;
