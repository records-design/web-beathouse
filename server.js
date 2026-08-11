const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure dirs exist
['database', 'uploads/artists', 'uploads/releases'].forEach(d => {
  fs.mkdirSync(path.join(__dirname, d), { recursive: true });
});

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: path.join(__dirname, 'database') }),
  secret: process.env.SESSION_SECRET || 'bth-session-secret-change-in-prod-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000 // 8 hours
  }
}));

// Static files — serve existing web
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin/assets', express.static(path.join(__dirname, 'admin')));

// Public API
app.use('/api', require('./api/routes'));

// Admin panel routes
app.use('/admin', require('./admin/routes/auth'));
app.use('/admin', require('./admin/routes/dashboard'));
app.use('/admin/artists', require('./admin/routes/artists'));
app.use('/admin/releases', require('./admin/routes/releases'));
app.use('/admin/media', require('./admin/routes/media'));
app.use('/admin/users', require('./admin/routes/users'));
app.use('/admin/account', require('./admin/routes/account'));

// Redirect /admin to /admin/dashboard
app.get('/admin', (req, res) => res.redirect('/admin/dashboard'));

app.listen(PORT, () => {
  console.log(`BeatHouse running at http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
