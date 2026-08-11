const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../../database/db');
const { requireAuth } = require('../middleware/auth');
const accountPage = require('../views/account');

function getUser(req) {
  return { id: req.session.userId, username: req.session.username, role: req.session.role };
}

// GET /
router.get('/', requireAuth, (req, res) => {
  res.send(accountPage(getUser(req)));
});

// POST /
router.post('/', requireAuth, (req, res) => {
  const user = getUser(req);
  const { current_password, new_password, confirm_password } = req.body;

  if (!current_password || !new_password || !confirm_password) {
    return res.send(accountPage(user, 'Todos los campos son requeridos.'));
  }
  if (new_password.length < 8) {
    return res.send(accountPage(user, 'La nueva contraseña debe tener al menos 8 caracteres.'));
  }
  if (new_password !== confirm_password) {
    return res.send(accountPage(user, 'Las contraseñas no coinciden.'));
  }

  const dbUser = db.prepare('SELECT * FROM users WHERE id=?').get(user.id);
  if (!dbUser || !bcrypt.compareSync(current_password, dbUser.password_hash)) {
    return res.send(accountPage(user, 'La contraseña actual es incorrecta.'));
  }

  const hash = bcrypt.hashSync(new_password, 12);
  db.prepare("UPDATE users SET password_hash=?, updated_at=datetime('now') WHERE id=?").run(hash, user.id);
  res.send(accountPage(user, '', 'Contraseña actualizada correctamente.'));
});

module.exports = router;
