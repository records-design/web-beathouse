const express = require('express');
const router = express.Router();
const db = require('../../database/db');
const { requireAuth } = require('../middleware/auth');
const dashboardPage = require('../views/dashboard');

router.get('/dashboard', requireAuth, (req, res) => {
  const user = { id: req.session.userId, username: req.session.username, role: req.session.role };

  const totalArtists = db.prepare("SELECT COUNT(*) as c FROM artists WHERE status != 'archived'").get().c;
  const publishedArtists = db.prepare("SELECT COUNT(*) as c FROM artists WHERE status = 'published'").get().c;
  const totalReleases = db.prepare("SELECT COUNT(*) as c FROM releases WHERE status != 'archived'").get().c;
  const publishedReleases = db.prepare("SELECT COUNT(*) as c FROM releases WHERE status = 'published'").get().c;
  const draftReleases = db.prepare("SELECT COUNT(*) as c FROM releases WHERE status = 'draft'").get().c;
  const featuredRelease = db.prepare("SELECT title FROM releases WHERE featured = 1 AND status = 'published' LIMIT 1").get();

  const recentArtists = db.prepare("SELECT * FROM artists WHERE status != 'archived' ORDER BY created_at DESC LIMIT 5").all();
  const recentReleases = db.prepare(`
    SELECT r.*, a.name as artist_name FROM releases r
    JOIN artists a ON r.artist_id = a.id
    WHERE r.status != 'archived'
    ORDER BY r.created_at DESC LIMIT 5
  `).all();

  res.send(dashboardPage({
    stats: { totalArtists, publishedArtists, totalReleases, publishedReleases, draftReleases, featuredRelease: featuredRelease?.title },
    recentArtists,
    recentReleases
  }, user));
});

module.exports = router;
