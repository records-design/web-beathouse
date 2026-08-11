const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const db = require('../../database/db');
const { requireAuth } = require('../middleware/auth');
const mediaPage = require('../views/media');

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

// GET /
router.get('/', requireAuth, (req, res) => {
  const files = db.prepare(`
    SELECT m.*,
      (SELECT COUNT(*) FROM artists WHERE main_image = m.path OR carousel_image = m.path) +
      (SELECT COUNT(*) FROM releases WHERE cover_image = m.path) as in_use
    FROM media m
    ORDER BY m.created_at DESC
  `).all();
  res.send(mediaPage(files, getUser(req), req.query.msg || ''));
});

// POST /upload
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  const user = getUser(req);
  if (!req.file) return res.redirect('/admin/media');

  const dir = path.join(__dirname, '../../uploads');
  fs.mkdirSync(dir, { recursive: true });

  const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
  const filename = Date.now() + ext;
  const filePath = path.join(dir, filename);

  let width, height;
  try {
    const info = await sharp(req.file.buffer).metadata();
    width = info.width;
    height = info.height;
    fs.writeFileSync(filePath, req.file.buffer);
  } catch (e) {
    return res.redirect('/admin/media');
  }

  const url = '/uploads/' + filename;
  const relPath = 'uploads/' + filename;

  db.prepare(`
    INSERT INTO media (filename, original_name, path, url, mimetype, size, width, height, created_by)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(filename, req.file.originalname, relPath, url, req.file.mimetype, req.file.size, width, height, user.id);

  res.redirect('/admin/media?msg=Archivo+subido+correctamente');
});

// POST /:id/delete
router.post('/:id/delete', requireAuth, (req, res) => {
  const file = db.prepare('SELECT * FROM media WHERE id=?').get(req.params.id);
  if (!file) return res.redirect('/admin/media');

  // Check in use
  const inUseArtists = db.prepare('SELECT COUNT(*) as c FROM artists WHERE main_image = ? OR carousel_image = ?').get(file.path, file.path);
  const inUseReleases = db.prepare('SELECT COUNT(*) as c FROM releases WHERE cover_image = ?').get(file.path);
  if (inUseArtists.c + inUseReleases.c > 0) return res.redirect('/admin/media');

  // Delete file
  try {
    const fullPath = path.join(__dirname, '../../', file.path);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch (e) {}

  db.prepare('DELETE FROM media WHERE id=?').run(file.id);
  res.redirect('/admin/media?msg=Archivo+eliminado');
});

module.exports = router;
