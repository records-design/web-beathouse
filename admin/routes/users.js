const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../../database/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const usersPage = require('../views/users');

function getUser(req) {
  return { id: req.session.userId, username: req.session.username, role: req.session.role };
}

// GET /
router.get('/', requireAuth, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, username, role, active, created_at FROM users ORDER BY created_at ASC').all();
  res.send(usersPage(users, getUser(req)));
});

// POST /new
router.post('/new', requireAuth, requireAdmin, (req, res) => {
  const { username, password, role } = req.body;
  const user = getUser(req);
  const users = db.prepare('SELECT id, username, role, active, created_at FROM users ORDER BY created_at ASC').all();

  if (!username || !password) return res.send(usersPage(users, user, 'Usuario y contraseña son requeridos.'));
  if (password.length < 8) return res.send(usersPage(users, user, 'La contraseña debe tener al menos 8 caracteres.'));

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.send(usersPage(users, user, 'El usuario ya existe.'));

  const hash = bcrypt.hashSync(password, 12);
  db.prepare("INSERT INTO users (username, password_hash, role, active) VALUES (?,?,?,1)").run(username, hash, role || 'editor');
  res.redirect('/admin/users');
});

// POST /:id — update role or toggle active
router.post('/:id', requireAuth, requireAdmin, (req, res) => {
  const user = getUser(req);
  const targetId = parseInt(req.params.id);
  if (targetId === user.id) return res.redirect('/admin/users');

  const { _action, role } = req.body;
  if (_action === 'role' && role) {
    db.prepare("UPDATE users SET role=?, updated_at=datetime('now') WHERE id=?").run(role, targetId);
  } else if (_action === 'toggle') {
    const target = db.prepare('SELECT active FROM users WHERE id=?').get(targetId);
    if (target) db.prepare("UPDATE users SET active=?, updated_at=datetime('now') WHERE id=?").run(target.active ? 0 : 1, targetId);
  }
  res.redirect('/admin/users');
});

// POST /:id/delete
router.post('/:id/delete', requireAuth, requireAdmin, (req, res) => {
  const user = getUser(req);
  const targetId = parseInt(req.params.id);
  if (targetId === user.id) return res.redirect('/admin/users'); // Cannot delete self
  db.prepare('DELETE FROM users WHERE id=?').run(targetId);
  res.redirect('/admin/users');
});

module.exports = router;
