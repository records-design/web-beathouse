const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const db = require('../../database/db');
const { requireAuth } = require('../middleware/auth');
const artistsListPage = require('../views/artists-list');
const artistFormPage = require('../views/artist-form');

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

async function processArtistImage(buffer, slug, field) {
  const dir = path.join(__dirname, '../../uploads/artists', slug);
  fs.mkdirSync(dir, { recursive: true });
  const prefix = field === 'carousel' ? 'carousel' : 'main';
  await sharp(buffer).resize(1200, 1500, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toFile(path.join(dir, `${prefix}-large.webp`));
  await sharp(buffer).resize(600, 750, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(dir, `${prefix}-medium.webp`));
  await sharp(buffer).resize(200, 250, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 75 }).toFile(path.join(dir, `${prefix}-thumb.webp`));
  return `uploads/artists/${slug}/${prefix}-large.webp`;
}

// GET / — list
router.get('/', requireAuth, (req, res) => {
  const { status, search } = req.query;
  let sql = "SELECT * FROM artists WHERE status != 'archived'";
  const params = [];
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (search) { sql += ' AND (name LIKE ? OR genre LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  sql += ' ORDER BY roster_order ASC, name ASC';
  const artists = db.prepare(sql).all(...params);
  res.send(artistsListPage(artists, getUser(req), req.query));
});

// GET /new
router.get('/new', requireAuth, (req, res) => {
  res.send(artistFormPage({}, getUser(req)));
});

// POST /new — create
router.post('/new', requireAuth, upload.fields([
  { name: 'main_image_file', maxCount: 1 },
  { name: 'carousel_image_file', maxCount: 1 }
]), async (req, res) => {
  const user = getUser(req);
  const { name, slug, genre, short_bio, bio, stat_label, spotify_url, instagram_url, youtube_url, tiktok_url, apple_music_url, website_url, status, roster_order, carousel_order, ticker_order, main_focal_x, main_focal_y, carousel_focal_x, carousel_focal_y, seo_title, seo_description } = req.body;
  const show_in_roster = req.body.show_in_roster ? 1 : 0;
  const show_in_carousel = req.body.show_in_carousel ? 1 : 0;
  const show_in_ticker = req.body.show_in_ticker ? 1 : 0;

  if (!name || !slug) return res.send(artistFormPage(req.body, user, 'Nombre y slug son requeridos.'));

  // Check slug unique
  const existing = db.prepare('SELECT id FROM artists WHERE slug = ?').get(slug);
  if (existing) return res.send(artistFormPage(req.body, user, 'El slug ya existe. Usá uno diferente.'));

  let main_image = null;
  let carousel_image = null;

  try {
    if (req.files?.main_image_file?.[0]) {
      main_image = await processArtistImage(req.files.main_image_file[0].buffer, slug, 'main');
    }
    if (req.files?.carousel_image_file?.[0]) {
      carousel_image = await processArtistImage(req.files.carousel_image_file[0].buffer, slug, 'carousel');
    }
  } catch (e) {
    return res.send(artistFormPage(req.body, user, 'Error procesando imagen: ' + e.message));
  }

  db.prepare(`
    INSERT INTO artists (name, slug, genre, short_bio, bio, stat_label, main_image, carousel_image,
      main_focal_x, main_focal_y, carousel_focal_x, carousel_focal_y,
      spotify_url, instagram_url, youtube_url, tiktok_url, apple_music_url, website_url,
      status, show_in_roster, show_in_carousel, show_in_ticker,
      roster_order, carousel_order, ticker_order, seo_title, seo_description,
      created_by, updated_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(name, slug, genre||null, short_bio||null, bio||null, stat_label||null, main_image, carousel_image,
    parseFloat(main_focal_x)||50, parseFloat(main_focal_y)||20,
    parseFloat(carousel_focal_x)||50, parseFloat(carousel_focal_y)||20,
    spotify_url||null, instagram_url||null, youtube_url||null, tiktok_url||null, apple_music_url||null, website_url||null,
    status||'draft', show_in_roster, show_in_carousel, show_in_ticker,
    parseInt(roster_order)||0, parseInt(carousel_order)||0, parseInt(ticker_order)||0,
    seo_title||null, seo_description||null, user.id, user.id);

  res.redirect('/admin/artists');
});

// GET /:id — edit form
router.get('/:id', requireAuth, (req, res) => {
  const artist = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id);
  if (!artist) return res.status(404).send('Artista no encontrado');
  res.send(artistFormPage(artist, getUser(req)));
});

// POST /:id — update
router.post('/:id', requireAuth, upload.fields([
  { name: 'main_image_file', maxCount: 1 },
  { name: 'carousel_image_file', maxCount: 1 }
]), async (req, res) => {
  const user = getUser(req);
  const artist = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id);
  if (!artist) return res.status(404).send('Artista no encontrado');

  const { name, slug, genre, short_bio, bio, stat_label, spotify_url, instagram_url, youtube_url, tiktok_url, apple_music_url, website_url, status, roster_order, carousel_order, ticker_order, main_focal_x, main_focal_y, carousel_focal_x, carousel_focal_y, seo_title, seo_description } = req.body;
  const show_in_roster = req.body.show_in_roster ? 1 : 0;
  const show_in_carousel = req.body.show_in_carousel ? 1 : 0;
  const show_in_ticker = req.body.show_in_ticker ? 1 : 0;

  if (!name || !slug) return res.send(artistFormPage({ ...artist, ...req.body }, user, 'Nombre y slug son requeridos.'));

  // Check slug unique (excluding self)
  const existing = db.prepare('SELECT id FROM artists WHERE slug = ? AND id != ?').get(slug, artist.id);
  if (existing) return res.send(artistFormPage({ ...artist, ...req.body }, user, 'El slug ya existe.'));

  let main_image = artist.main_image;
  let carousel_image = artist.carousel_image;

  try {
    if (req.files?.main_image_file?.[0]) {
      main_image = await processArtistImage(req.files.main_image_file[0].buffer, slug, 'main');
    }
    if (req.files?.carousel_image_file?.[0]) {
      carousel_image = await processArtistImage(req.files.carousel_image_file[0].buffer, slug, 'carousel');
    }
  } catch (e) {
    return res.send(artistFormPage({ ...artist, ...req.body }, user, 'Error procesando imagen: ' + e.message));
  }

  db.prepare(`
    UPDATE artists SET name=?, slug=?, genre=?, short_bio=?, bio=?, stat_label=?, main_image=?, carousel_image=?,
      main_focal_x=?, main_focal_y=?, carousel_focal_x=?, carousel_focal_y=?,
      spotify_url=?, instagram_url=?, youtube_url=?, tiktok_url=?, apple_music_url=?, website_url=?,
      status=?, show_in_roster=?, show_in_carousel=?, show_in_ticker=?,
      roster_order=?, carousel_order=?, ticker_order=?, seo_title=?, seo_description=?,
      updated_by=?, updated_at=datetime('now')
    WHERE id=?
  `).run(name, slug, genre||null, short_bio||null, bio||null, stat_label||null, main_image, carousel_image,
    parseFloat(main_focal_x)||50, parseFloat(main_focal_y)||20,
    parseFloat(carousel_focal_x)||50, parseFloat(carousel_focal_y)||20,
    spotify_url||null, instagram_url||null, youtube_url||null, tiktok_url||null, apple_music_url||null, website_url||null,
    status||'draft', show_in_roster, show_in_carousel, show_in_ticker,
    parseInt(roster_order)||0, parseInt(carousel_order)||0, parseInt(ticker_order)||0,
    seo_title||null, seo_description||null, user.id, artist.id);

  res.redirect('/admin/artists');
});

// POST /:id/archive
router.post('/:id/archive', requireAuth, (req, res) => {
  db.prepare("UPDATE artists SET status='archived', updated_at=datetime('now') WHERE id=?").run(req.params.id);
  res.redirect('/admin/artists');
});

// POST /:id/delete
router.post('/:id/delete', requireAuth, (req, res) => {
  db.prepare('DELETE FROM artists WHERE id=?').run(req.params.id);
  res.redirect('/admin/artists');
});

module.exports = router;
