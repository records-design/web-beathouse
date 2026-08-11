const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../../database/db');
const loginPage = require('../views/login');

// GET /admin/login
router.get('/login', (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/admin/dashboard');
  res.send(loginPage());
});

// POST /admin/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.send(loginPage('Por favor ingresá usuario y contraseña.'));
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.send(loginPage('Usuario o contraseña incorrectos.'));
  }
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.role = user.role;
  res.redirect('/admin/dashboard');
});

// GET /admin/logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

module.exports = router;
