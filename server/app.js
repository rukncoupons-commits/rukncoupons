'use strict';

require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.tailwindcss.com',
        'https://cdn.jsdelivr.net',
        'https://www.googletagmanager.com',
        'https://connect.facebook.net',
        'https://analytics.tiktok.com',
        'https://www.gstatic.com',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://cdn.tailwindcss.com',
        'https://cdn.jsdelivr.net',
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      connectSrc: ["'self'", 'https:', 'http:'],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ─── Compression ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Sessions ────────────────────────────────────────────────────────────────
app.use(session({
  secret: 'rukn-al-coupons-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
}));

// ─── View Engine ─────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// ─── Routes ──────────────────────────────────────────────────────────────────
const adminRoutes = require('./src/routes/admin.routes');
const routes = require('./src/routes/index');

app.use('/admin', adminRoutes);
app.use('/', routes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('pages/404', {
    title: 'الصفحة غير موجودة | ركن الكوبونات',
    meta: {
      title: 'الصفحة غير موجودة | ركن الكوبونات',
      description: 'الصفحة التي تبحث عنها غير موجودة.',
      canonical: process.env.SITE_URL || 'https://rukncoupons.com',
      robots: 'noindex, nofollow',
      ogTitle: 'الصفحة غير موجودة',
      ogDescription: 'الصفحة التي تبحث عنها غير موجودة.',
      ogImage: '',
      twitterCard: 'summary',
    },
    jsonLd: null,
    hreflangTags: [],
    trackingConfig: null,
    socialConfig: null,
    countryCode: 'sa',
    countries: [],
  });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(500).send('حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.');
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Rukn Al-Coupons server running at http://localhost:${PORT}`);
});

module.exports = app;
