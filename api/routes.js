const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/artists', (req, res) => {
  const { section } = req.query;
  let where = "status = 'published'";
  let orderBy = 'roster_order ASC';

  if (section === 'roster') {
    where += ' AND show_in_roster = 1';
    orderBy = 'roster_order ASC';
  } else if (section === 'carousel') {
    where += ' AND show_in_carousel = 1';
    orderBy = 'carousel_order ASC';
  } else if (section === 'ticker') {
    where += ' AND show_in_ticker = 1';
    orderBy = 'ticker_order ASC';
  }

  const artists = db.prepare(`SELECT * FROM artists WHERE ${where} ORDER BY ${orderBy}`).all();
  res.json(artists);
});

router.get('/releases', (req, res) => {
  const releases = db.prepare(`
    SELECT r.*, a.name as artist_name, a.slug as artist_slug
    FROM releases r
    JOIN artists a ON r.artist_id = a.id
    WHERE r.status = 'published'
      AND (r.publish_at IS NULL OR r.publish_at <= datetime('now'))
    ORDER BY r.featured DESC, r.sort_order ASC, r.release_date DESC
  `).all();
  res.json(releases);
});

module.exports = router;
